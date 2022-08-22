import Web3 from 'web3'
import { ethers, BigNumber } from 'ethers'
import fs from 'fs'
import path from 'path'
import { getProvider } from './Web3Provider'
import { IProduct } from '../interfaces/IProduct'
import { logger } from '../utils/Logger'
import config from '../config'

const SubscriptionABI = JSON.parse(fs.readFileSync(path.join(__dirname, '../../abis/Subscription.json'), 'utf8'))

export async function addProduct (provider:any, contract:any, product:any, paymentAddress:string) {
	const account = provider.eth.accounts.privateKeyToAccount(process.env.PROCESSOR_PK)

	const method = contract.methods.createMerchantSubscription(
		paymentAddress,
		product.currency.address,
		ethers.utils.parseUnits(product.price.toString(), product.currency.decimals).toString(),
		product.recurring.interval,
		Web3.utils.asciiToHex(product._id.toString()),
		product.recurring.trialPeriod || 0
	)
	const gas = await method.estimateGas({ from: account.address })

	const signed = await account.signTransaction({
		to: contract.options.address,
		data: method.encodeABI(),
		gas: Number((gas * 1.1).toFixed(0)) // To prevent underpriced transactions
	})

	await provider.eth.sendSignedTransaction(signed.rawTransaction)
	
	return Promise.resolve(true)
}

export async function getSubscription (chainId: number | string, id: string) {
	try {
		const contractAddress = config.subscriptionContracts[chainId.toString()]
		if (!contractAddress) throw new Error('No contract found.')

		const provider = await getProvider(chainId)
		const contract = new provider.eth.Contract(SubscriptionABI, contractAddress)

		const subscription = await contract.methods.getSubscriptionData(id).call()

		return subscription
	} catch (error:any) {
		logger.error(error.message)
		return Promise.reject(error)
	}
}

export async function getSubscriptions (chainId: number | string, userAddress: string) {
	try {
		const contractAddress = config.subscriptionContracts[chainId.toString()]
		if (!contractAddress) throw new Error('No contract found.')

		const provider = await getProvider(chainId)
		const contract = new provider.eth.Contract(SubscriptionABI, contractAddress)

		const subscriptions = await contract.methods.getSubscribersSubscriptions(userAddress).call()

		console.log(subscriptions)

		return subscriptions
	} catch (error:any) {
		logger.error(error.message)
		return Promise.reject(error)
	}
}

