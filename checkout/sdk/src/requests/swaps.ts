import axios from 'axios'
import config from '../config'

export default class Swaps {
	rivel?: any

	constructor (rivel: any) {
		this.rivel = rivel
	}

	async requestPath (params: { chainId: string | number, from: string, to: string }) {
		try {
			if (!params?.chainId || !params.from || !params.to) 
				throw new Error('Missing required parameters.')

			const res = await axios.get(`${config.API_URL}/swaps/path`, {
				params
			})

			return Promise.resolve(res.data)
		} catch (error:any) {
			return Promise.reject(error.message)
		}
	}
}