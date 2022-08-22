import axios from 'axios'
import config from '../config'

export async function getCheckout (checkoutId: string) {
	try {
		const res = await axios.get(`${config.API_URL}/products/checkout/${checkoutId}`)
		return Promise.resolve(res.data)
	} catch (error:any) {
		return Promise.reject(error.message)
	}
}