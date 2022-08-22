import axios from 'axios'
import config from '../config'

export async function convert (params: { chainId: string | number, from: string, to: string, amount: number | string }) {
	try {
		if (!params.chainId) return Promise.reject('Invalid params')

		const res = await axios.get(`${config.API_URL}/prices/convert`, {
			params
		})
		return Promise.resolve(res.data)
	} catch (error:any) {
		return Promise.reject(error.message)
	}
}