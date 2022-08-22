import axios from 'axios'
import { ethers } from 'ethers'
import config from '../config'

import SubscriptionABI from '../abis/Subscription.json'

export default class Subscriptions {
	rivel?: any;

	constructor (rivel:any) {
		this.rivel = rivel
	}

	async create (params: { product: string, currency: string, path: string }) {
		try {
			this.rivel.emit('subscriptionStatus', 'creation')

			const res = await axios({
				url: `${config.API_URL}/subscriptions`,
				method: 'post',
				headers: {
					'x-api-key': this.rivel.apiKey
				},
				data: {
					product: params.product,
					currency: params.currency,
					chainId: this.rivel.chainId,
					subscriber: this.rivel.address
				}
			})

			this.rivel.emit('subscriptionStatus', 'contract_sync')

			const rivelAddress = config.subscriptionContracts[this.rivel.chainId.toString()]
			if (!rivelAddress) return Promise.reject('No Rivel contract found for this chain.')

			const contract = new ethers.Contract(rivelAddress, SubscriptionABI, this.rivel.signer)

			const contractData = await contract.createSubscription(
				this.rivel.address,
				ethers.utils.formatBytes32String(params.product),
				res.data.userCurrency,
				params.path,
				{
					gasLimit: 2000000,
				}
			)

			this.rivel.emit('subscriptionStatus', 'waiting_for_blockchain')

			const receipt = await contractData.wait()
			const subEvent = receipt.events.find((e:any) => {
				return e.event && e.event === 'NewSubscription' 
			})

			const contractId = subEvent.args._subscriptionId

			this.rivel.emit('subscriptionStatus', 'validating')

			const validation = await axios({
				url: `${config.API_URL}/subscriptions/${res.data._id}/validate`,
				method: 'put',
				headers: {
					'x-api-key': this.rivel.apiKey
				},
				data: {
					contractId
				}
			})

			this.rivel.emit('subscriptionStatus', 'ready')

			return Promise.resolve(validation.data)
		} catch (error:any) {
			console.log(error)
			return Promise.reject(error.message)
		}
	}
}