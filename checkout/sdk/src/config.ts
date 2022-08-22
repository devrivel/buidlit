const config: any = {
	APP_NAME: 'Rivel.io',
	API_URL: 'https://rivel-backend.onrender.com/v1',
	providerOptions: {},
	subscriptionContracts: {
		'137': '0xe6B55761029150921E72Dd16C5d4E328146701fD'
	},
	supportedWallets: [
		{
			name: 'Metamask',
			id: 'metamask',
			icon: '/icons/metamask.svg'
		},
		{
			name: 'WalletConnect',
			id: 'walletconnect',
			icon: '/icons/walletconnect.svg'
		},
		{
			name: 'Sequence Wallet',
			id: 'sequence',
			icon: '/icons/sequence.svg'
		},
		{
			name: 'Coinbase Wallet',
			id: 'coinbase',
			icon: '/icons/coinbase.png'
		}
	]
}

export default config