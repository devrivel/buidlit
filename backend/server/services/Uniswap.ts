import { AlphaRouter } from '@uniswap/smart-order-router'
import { TradeType, Token, CurrencyAmount } from '@uniswap/sdk-core'
import { ethers } from 'ethers'
import Chain from '../models/Chain'
import Currency from '../models/Currency'

export async function getRouterPath (config: { chainId: number, from: string, to: string }) {
	try {
		const { chainId, from, to } = config

		const chain = await Chain.findOne({ chainId })
		if (!chain) throw new Error('No chain found.')

		const fromToken = await Currency.findOneWithCache({ chainId, symbol: from })
		const toToken = await Currency.findOneWithCache({ chainId, symbol: to })

		const provider = new ethers.providers.JsonRpcProvider(chain.rpc[0])
		if (!provider) throw new Error('Unable to create web3 provider.')

		const FROM = new Token(chainId, fromToken.address, fromToken.decimals, fromToken.symbol, fromToken.name)
		const TO = new Token(chainId, toToken.address, toToken.decimals, toToken.symbol, toToken.name)

		const router = new AlphaRouter({ chainId: Number(chainId), provider })
		
		const routerResponse = await router.route(
			CurrencyAmount.fromRawAmount(TO, '10'),
			FROM, 
			TradeType.EXACT_OUTPUT)

		return Promise.resolve(routerResponse)
	} catch (error) {
		return Promise.reject(error)
	}
}

export function encodePath (route:any) {
	const tokenPath = route.tokenPath
	const pools = route.pools
	if (!pools?.length || !tokenPath?.length) return { path: [], encodedPath: '', packDetail: [] }

	const path: Array<any> = []
	const packDetail: Array<string> = []

	tokenPath.forEach((token:any, i:number) => {
		path.push(token.address)
		packDetail.push('address')

		if (i !== tokenPath.length - 1) {
			path.push(pools[i].fee)
			packDetail.push('uint24')
		}
	})

	const encodedPath = ethers.utils.solidityPack(
		packDetail.reverse(),
		path.reverse()
	)

	return { path, encodedPath, packDetail }
}