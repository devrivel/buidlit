import { ethers, BigNumber } from 'ethers'
import config from '../config'
import ERC20ABI from '../abis/ERC20.json'

export default class Token {
	rivel?: any; 

	constructor (rivel:any) {
		this.rivel = rivel
	}

	async approve (tokenAddress: string, amount: number | string) {
		try {
			const contract = new ethers.Contract(tokenAddress, ERC20ABI, this.rivel.signer)

			const rivelAddress = config.subscriptionContracts[this.rivel.chainId.toString()]
			if (!rivelAddress) return Promise.reject('No Rivel contract found on this chain.')

			const allowance = await contract.allowance(this.rivel.address, rivelAddress) // User address, contract address
			if (allowance.gte(BigNumber.from(amount))) { 
				console.log('Token allowance is sufficient.')
				return Promise.resolve(true) 
			}
	
			await contract.approve(rivelAddress, amount)

			return Promise.resolve(true)
		} catch (error:any) {
			return Promise.reject(error.message)
		}
	}
}