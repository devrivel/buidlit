import { Router, Request, Response } from 'express'
import Web3 from 'web3'
import fs from 'fs'
import path from 'path'
import { body, validationResult } from 'express-validator'
import { IKeyable } from '../../interfaces/IKeayble'
import Subscription from '../../models/Subscription'
import Product from '../../models/Product'
import Currency from '../../models/Currency'
import { requireApiKey, validateApiKey, extractUser, requireMerchantAccessLevel } from '../../middleware/AuthMiddleware'
import config from '../../config'
import { logger } from '../../utils/Logger'
import { getProvider } from '../../services/Web3Provider'
import { addProduct, getSubscription } from '../../services/Blockchain'

// ABIs
const SubscriptionABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../abis/Subscription.json'), 'utf8'))

const router = Router()

router.post('/', [
	requireApiKey,
	body('product').notEmpty(),
	body('chainId').notEmpty(),
	body('currency').notEmpty(),
	body('subscriber').notEmpty()
], async (req: Request, res: Response) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ code: 400, errors: errors.array() })
	}

	const { chainId, currency, subscriber } = req.body

	try {
		// Validate subscriber address
		if(!Web3.utils.isAddress(req.body.subscriber)) {
			return res.status(400).json({ code: 400, message: 'Invalid subscriber address.' })
		}

		// Validate user's chosen currency
		const userCurrency = await Currency.findOneWithCache({
			chainId: chainId,
			symbol: currency
		})

		if (!userCurrency) {
			return res.status(400).json({ code: 400, message: 'Invalid currency.' })
		}

		// Validate product and check if can be subscribed
		const product = await Product.findOne({ _id: req.body.product }).populate('merchant')
		if (!product 
			|| !product.active 
			|| !product.recurring?.interval
		) {
			return res.status(400).json({ code: 400, message: 'Invalid product.' }) 
		}

		// Check if product exists on the current chain
		const contractAddress = config.subscriptionContracts[chainId.toString()]
		if (!contractAddress) return res.status(400).json({ code: 400, message: 'Invalid chain.' })

		const paymentDetails = product.merchant.paymentAddresses.find((elem) => elem.chainId === chainId.toString())
		if (!paymentDetails?.address) return res.status(400).json({ code: 400, message: 'Invalid chain.' })

		const provider = await getProvider(chainId)
		const contract = new provider.eth.Contract(SubscriptionABI, contractAddress)

		// Bytes32 of backend product ID
		const productId = Web3.utils.asciiToHex(product._id.toString())
		const products = await contract.methods.getMerchantsProducts(paymentDetails.address).call()

		const productCurrency = await Currency.findOneWithCache({ 
			chainId,
			symbol: product.currency.detail
		})
		
		// If contract does not have the product id, create the product
		if (!products.find((id:string) => id.includes(productId))) {
			await addProduct(
				provider, 
				contract, 
				{...product.toObject(), currency: {...product.currency, ...productCurrency.toObject()}}, 
				paymentDetails.address
			)
		}

		// // Create subscription with pending state
		const subscription = await Subscription.create({
			subscriber: subscriber,
			chainId: chainId,
			product: product._id,
			// @ts-ignore
			merchant: product.merchant._id,
			userCurrency: userCurrency.address,
			productCurrency: productCurrency.address,
			price: product.price,
			status: 'pending'
		})

		return res.status(200).send(subscription)
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

// Called after subscription is created on the contract
router.put('/:subscriptionId/validate', [
	requireApiKey,
	body('contractId').notEmpty()
], async (req: Request, res: Response) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ code: 400, errors: errors.array() })
	}

	try {
		const subscription = await Subscription.findOne({ _id: req.params.subscriptionId })
		if (!subscription) return res.status(404).json({ code: 404, message: 'Not found.' })
		if (subscription.status !== 'pending') return res.status(400).json({ code: 400, message: 'Subscription already validated.' })

		const contractId = req.body.contractId

		// Check if valid on contract
		const contractData = await getSubscription(subscription.chainId, contractId)
		if (contractData[0] === '0x0000000000000000000000000000000000000000') {
			return res.status(400).json({ code: 400, message: 'Subscription not active on smart contract.' })
		}
	
		subscription.status = 'active'
		subscription.contractId = contractId
		subscription.nextPaymentAt = new Date(contractData[2] * 1000) // Convert next payment to ms
		subscription.lastPaymentAt = new Date()
		await subscription.save()
		
		return res.status(200).json({ message: 'Subscription activated.' })
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

router.get('/', [
	validateApiKey,
	extractUser,
	requireMerchantAccessLevel(['owner', 'admin', 'developer'], '')
], async (req: Request, res: Response) => {
	try {
		const filter: IKeyable = {
			merchant: req.query.merchant,
			status: req.query.status || 'active',
		}

		if (req.query.product) filter.product = req.query.product

		const subscriptions = await Subscription.find(filter).populate('product')

		return res.status(200).json({ results: subscriptions })
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

router.put('/:subscriptionId/cancel', [
	requireApiKey
], async (req: Request, res: Response) => {
	try {
		const subscription = await Subscription.findOne({ _id: req.params.subscriptionId })
		if (!subscription) return res.status(404).json({ code: 404, message: 'Not found.' })
		if (subscription.status !== 'active') return res.status(400).json({ code: 400, message: 'Subscription can\'t be canceled.' })

		// TODO: Check status from contract

		subscription.status = 'canceled'
		subscription.canceledAt = new Date()
		await subscription.save()

		return res.status(200).json({ message: 'Subscription canceled.' })
	} catch (error:any) {
		logger.error(error.message)
		return res.status(500).json({ code: 500, message: 'Something went wrong.' })
	}
})

export default router