import Web3 from 'web3'
import Chain from '../models/Chain'
import { logger } from '../utils/Logger'

// Gets random element from an array of RPC endpoints
function randomRPC (rpcs:Array<any>) {
	return rpcs[Math.floor(Math.random()*rpcs.length)]
}

export async function getProvider (chainId:number | string) {
	try {
		const chain = await Chain.findOne({ chainId })
		if (!chain) return Promise.reject(new Error('Chain not supported.'))

		let endpoint = ''
		endpoint = randomRPC(chain.rpc)
		const web3 = new Web3(endpoint)
		
		// Check if RPC endpoint is online
		let isListening = await web3.eth.net.isListening()
		while (!isListening) {
			// Fetch and set new endpoint if offline
			endpoint = randomRPC(chain.rpc)
			web3.setProvider(endpoint)
			isListening = await web3.eth.net.isListening()
		}

		return web3
	} catch (error:any) {
		logger.error(error.message)
		return Promise.reject(error)
	}
}
