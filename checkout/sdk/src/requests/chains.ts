import axios from 'axios'
import config from '../config'

export async function getSupportedCurrencies (chainId:string | number) {
	try {
		const res = await axios.get(`${config.API_URL}/chains/${chainId}/currencies`)
		return Promise.resolve(res.data)
	} catch (error:any) {
		return Promise.reject(error.message)
	}
}