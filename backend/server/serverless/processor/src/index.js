import mongoose from 'mongoose'
import { getProvider } from '../../../services/Web3Provider'
import { getRouterPath, encodePath } from '../../../services/Uniswap'
import config from '../../../config'
import Currency from '../../../models/Currency'
import Subscription from '../../../models/Subscription'
import SubscriptionABI from '../../../../abis/Subscription.json'

let conn = null

async function getDueSubscriptions () {
	try {
		const subscriptions = await Subscription
			.find({ nextPaymentAt: { $lt: new Date() }, status: 'active' })
			.populate('product')

		return subscriptions
	} catch (error) {
		return Promise.reject(error)
	}
}

async function connectMongo () {
	conn = mongoose.connect(config.mongoConnection, {
		serverSelectionTimeoutMS: 5000
	}).then(() => mongoose)

	console.log('mongo connected')

	await conn

	return conn
}

async function processSubscription (data) {
	try {
		const rivelAddress = config.subscriptionContracts[data.chainId.toString()]
		if (!rivelAddress) return
	
		const userCurrency = await Currency.findOneWithCache({ address: data.userCurrency })
		const productCurrency = await Currency.findOneWithCache({ address: data.productCurrency })

		if (!userCurrency || !productCurrency) return
	
		const routerPath = await getRouterPath({ 
			chainId: Number(data.chainId), 
			from: userCurrency.symbol,
			to: productCurrency.symbol
		})
		const path = encodePath(routerPath?.route[0].route)
	
		const provider = await getProvider(data.chainId)
		const account = provider.eth.accounts.privateKeyToAccount(process.env.PROCESSOR_PK)
		const contract = new provider.eth.Contract(SubscriptionABI, rivelAddress)

		const method = contract.methods.processSubscription(
			data.contractId,
			path.encodedPath
		)

		const gas = await method.estimateGas({ from: account.address })

		const signed = await account.signTransaction({
			to: contract.options.address,
			data: method.encodeABI(),
			gas: Number((gas * 1.1).toFixed(0)) // To prevent underpriced transactions
		})

		await provider.eth.sendSignedTransaction(signed.rawTransaction)

		await Subscription.updateOne({ _id: data._id }, {
			lastPaymentAt: new Date(),
			nextPaymentAt: new Date(((new Date().getTime() / 1000) + data.product.recurring.interval) * 1000)
		})

		return Promise.resolve(true)
	} catch (error) {
		const err = error.message

		console.log(err)

		if (err.includes('Payment is not due for this subscription')) {
			console.log('payment not due')
		}

		return Promise.resolve(false)
	}
}

export const handler = async () => {
	if (conn === null) {
		await connectMongo()
	}

	const subscriptions = await getDueSubscriptions()

	for (const subscription of subscriptions) {
		await processSubscription(subscription)
	}
}	