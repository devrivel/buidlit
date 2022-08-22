import { ethers } from 'ethers'
import { sequence } from '0xsequence'
import WalletConnectProvider from '@walletconnect/web3-provider'
import Web3Modal from 'web3modal'
import config from '../config'

// 4c0c0c3bb8344d5d831c37d603019878

export const createProvider = async (givenProvider:any) => {
	let provider, signer = null

	if (!givenProvider) {
		const web3modal = new Web3Modal({
			cacheProvider: true,
			providerOptions: config.providerOptions
		})
	
		const instance = await web3modal.connect()
		provider = new ethers.providers.Web3Provider(instance)
		signer = provider.getSigner()
	} else {
		provider = new ethers.providers.Web3Provider(givenProvider)
		signer = provider.getSigner()
	}

	return { provider, signer }
}

export const createInjected = async (type: string = 'metamask') => {
	if (typeof window === 'undefined' || !window.ethereum) throw new Error('window.ethereum not available.')

	let injection = window.ethereum

	if (window.ethereum.providers?.length) { 
		if (type === 'metamask') injection = window.ethereum.providers.find((p:any) => p.isMetaMask)
		if (type === 'coinbase') injection = window.ethereum.providers.find((p:any) => p.isCoinbaseWallet)
	}

	const provider = new ethers.providers.Web3Provider(injection)
	await provider.send("eth_requestAccounts", [])
	const signer = provider.getSigner()

	return { provider, signer }
}

export const createSequence = async () => {
	try {
		const wallet = await sequence.initWallet('polygon')
		const connectDetails = await wallet.connect({
			app: config.APP_NAME,
			authorize: true
		})
	
		if(!connectDetails.connected) {
			return Promise.reject('User denied connection')
		}
	
		const provider = wallet.getProvider()
		const signer = wallet.getSigner()
	
		return { provider, signer, wallet }
	} catch (error:any) {
		return Promise.reject(error)
	}
}

export const createWalletConnect = async () => {
	try {
		const walletConnect = new WalletConnectProvider({
			rpc: {
				1: 'https://cloudflare-eth.com',
				137: 'https://polygon-rpc.com'

			}
		})
	
		await walletConnect.enable()

		const provider = new ethers.providers.Web3Provider(walletConnect)
		const signer = provider.getSigner()

		return { provider, signer, walletConnect }
	} catch (error:any) {
		throw new Error(error.message)
	}
}

export const createCoinbase = async () => {
	try {
		if (typeof window === 'undefined' || !window.ethereum) throw new Error('window.ethereum not available.')

		return true
	} catch (error:any) {
		console.log(error)
		throw new Error(error.message)
	}
}