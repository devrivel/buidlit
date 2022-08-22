import { createInjected, createSequence, createWalletConnect } from "./provider";
import { utils } from "ethers";
import { EventEmitter } from 'events'
import Token from './utils/token'
import Subscriptions from "./requests/subscriptions"
import Swaps from "./requests/swaps"
import * as products from './requests/products'
import * as chains from './requests/chains'
import * as prices from './requests/prices'

export class Rivel extends EventEmitter {
	apiKey: string;
	provider: any;
	signer: any;
	walletType?: string;

	products?: any;
	chains?: any;
	prices?: any;
	token: any;
	subscriptions: any;
	swaps: any;
	utils: any;

	address?: string;
	chainId?: number;

	private walletConnect?: any;
	private sequence?: any;

	constructor (apiKey:string) {
		super()
		this.apiKey = apiKey

		this.products = products
		this.chains = chains
		this.prices = prices
		this.utils = utils

		this.token = new Token(this)
		this.subscriptions = new Subscriptions(this)
		this.swaps = new Swaps(this)
	}

	async initWallet(wallet: string = 'metamask') {
		this.walletType = wallet

		try {
			switch (wallet) {
				case 'metamask' || 'coinbase':
					const injected = await createInjected(wallet)
					this.provider = injected.provider
					this.signer = injected.signer
					this.address = await this.signer.getAddress()
					break
				case 'sequence':
					const sequence = await createSequence()
					this.provider = sequence.provider
					this.signer = sequence.signer
					this.sequence = sequence.wallet
					this.address = await sequence.wallet.getAddress()
					break
				case 'walletconnect':
					const walletconnect = await createWalletConnect()
					this.provider = walletconnect.provider
					this.signer = walletconnect.signer
					this.walletConnect = walletconnect.walletConnect
					this.address = await this.signer.getAddress()
					break
			}

			this._initListeners()
	
			return Promise.resolve(this.address)
		} catch (error) {
			return Promise.reject(error)
		}
	}

	async changeNetwork (chainId: number | string) {
		if (typeof window === 'undefined' || !window.ethereum) return
		const chainHex = utils.hexlify(Number(chainId))

		await window.ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: chainHex }]
		})
	}

	private async _initListeners () {
		const network = await this.provider.getNetwork()

		if (network?.chainId) {
			this._chainChanged(network.chainId)
		}

		this.provider.on('network', (network:any) => {
			this._chainChanged(Number(network?.chainId))
		})

		if (this.walletConnect) {
			this.walletConnect.on('chainChanged', (chainId:number) => {
				this._chainChanged(chainId)
			})
		}

		if (this.sequence) {
			const chainId = await this.sequence.getChainId()
			this._chainChanged(chainId)

			this.sequence.on('chainChanged', (chainId: string) => {
				this._chainChanged(Number(chainId))
			})
		}
	}

	private _chainChanged (chainId:number) {
		this.emit('chainId', chainId)
		this.chainId = chainId
	}
}