import { useState, useEffect, useMemo, useContext } from 'react'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import { Rivel } from '../../sdk'
import BaseSpinner from '../components/Common/BaseSpinner'
import Head from 'next/head'
const rivel = new Rivel('3bf51673-a85c-48db-968f-e66a96446732')

const walletOptions = [
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
	},
]

export default function CheckoutPage () {
	const router = useRouter()
	const [checkoutPhase, setCheckoutPhase] = useState('fetching')
	const [product, setProduct] = useState({})
	const [productCurrency, setProductCurrency] = useState({})
	const [chains, setChains] = useState([])
	const [tokens, setTokens] = useState([])

	const [currentChain, setCurrentChain] = useState(0)
	const [userToken, setUserToken] = useState({})
	const [conversionRate, setConversionRate] = useState({})
	const [paymentLoading, setPaymentLoading] = useState(false)

	async function connectWallet (wallet) {
		await rivel.initWallet(wallet)
		localStorage.setItem('preferred_wallet', wallet)

		setCheckoutPhase('payment')
	}

	async function checkPreferredWallet () {
		const wallet = localStorage.getItem('preferred_wallet')
		if (!wallet) return

		await rivel.initWallet(wallet)
		setCheckoutPhase('payment')
	}

	const isSupportedChain = useMemo(() => {
		if (!currentChain) return false

		const supported = chains.map((item) => item.chainId)

		if (supported.includes(currentChain.toString())) return true
		return false
	}, [chains, currentChain])

	async function getPaymentTokens (chainId) {
		const paymentTokens = await rivel.chains.getSupportedCurrencies(chainId)
		setTokens(paymentTokens.results)
	}

	function formatCrypto (amount) {
		if (!amount) return 0
		return amount.toFixed(4)
	}

	function formatUSD (amount) {
		const formatter = new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
		})
		
		return formatter.format(amount)
	}

	async function startPayment () {
		setPaymentLoading(true)

		await rivel.token.approve(userToken.address, '115792089237316195423570985008687907853269984665640564039457584007913129639935')
		const path = await rivel.swaps.requestPath({
			chainId: currentChain, 
			from: userToken.symbol, 
			to: productCurrency.symbol
		})

		const subscription = await rivel.subscriptions.create({
			product: product._id,
			currency: userToken.symbol,
			path: path.encodedPath,
		})

		setPaymentLoading(false)
		setCheckoutPhase('ended')
	}

	useEffect(() => {
		if (!router.query.p) {
			if (router.isReady) location.href = 'https://rivel.io'
			return
		}

		const fetchCheckout = async () => {
			try {
				const data = await rivel.products.getCheckout(router.query.p)
				setProduct(data.product)
				setProductCurrency(data.currency)
				setChains(data.chains)

				setCheckoutPhase('wallet')
	
				// checkPreferredWallet()
			} catch (error) {
				location.href = 'https://rivel.io'
			}
		}

		fetchCheckout()
	}, [router.isReady])

	useEffect(() => {
		rivel.on('chainId', (chainId) => {
			setCurrentChain(chainId)
		})
	}, [])

	useEffect(() => {
		if (currentChain !== 0) {
			getPaymentTokens(currentChain)
		}
	}, [currentChain])

	useEffect(() => {
		(async () => {
			const rate = await rivel.prices.convert({ 
				chainId: currentChain,
				from: productCurrency.symbol,
				to: userToken.symbol,
				amount: product.price
			})

			setConversionRate(rate)
		})()
	}, [userToken])

	return (
		<>
		<Head>
			<title>Checkout | Rivel</title>
		</Head>
		<div className="rivel-checkout bg-[#FCFCFC] min-h-screen">
			<div className="md:h-20 bg-transparent border-b border-gray-200 md:flex md:items-center p-6 px-14 md:px-28 text-center">
				<div>
					<p className="font-semibold text-xl">Complete your purchase</p>
				</div>
				<div className="h-full ml-auto">
					<img 
						src="/img/Rivel_Logo_Color.svg" 
						alt="Rivel Logo" 
						className="h-8 md:h-full m-auto mt-3 md:mt-0"
					/>
				</div>
			</div>

			{ checkoutPhase === 'fetching' && 
				<div className="h-screen w-screen absolute inset-0 bg-white flex items-center justify-center">
					<div className="h-10 w-10">
						<BaseSpinner size="10" />
					</div>
				</div>
			}

			{ !!currentChain && !isSupportedChain && 
				<div className="h-screen w-screen absolute inset-0 bg-white flex items-center justify-center">
					<div>
						<p className="text-xl font-semibold">
							This network is not supported. The following networks are supported by {product?.merchant?.name}:
						</p>
	
						<div className="flex flex-wrap gap-4 justify-center mt-6">
							{ chains.map((chain) => (
								<div 
									key={chain._id}
									className="bg-white border border-gray-200 rounded-md 
									text-black py-2.5 px-4 flex flex-wrap items-center 
									transition duration-150"
								>
									<span className="pr-4 h-5">
										<img src={chain.icon} alt={chain.name} className="h-full" />
									</span>
									<span>
										{ chain.name }
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
			}

			{ checkoutPhase === 'ended' && 
				<div className="h-screen w-screen absolute inset-0 bg-white flex items-center justify-center text-center">
					<div>
						<svg 
							xmlns="http://www.w3.org/2000/svg" 
							width="60" height="60" 
							fill="currentColor" 
							className="mx-auto mb-8 text-gray-800" 
							viewBox="0 0 16 16"
						>
							<path d="M8 7.982C9.664 6.309 13.825 9.236 8 13 2.175 9.236 6.336 6.31 8 7.982Z"/>
							<path d="M3.75 0a1 1 0 0 0-.8.4L.1 4.2a.5.5 0 0 0-.1.3V15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V4.5a.5.5 0 0 0-.1-.3L13.05.4a1 1 0 0 0-.8-.4h-8.5Zm0 1H7.5v3h-6l2.25-3ZM8.5 4V1h3.75l2.25 3h-6ZM15 5v10H1V5h14Z"/>
						</svg>
						<p className="text-xl font-semibold">
							Thank you for your purchase!
						</p>
						<p className="">
							You can close this window.
						</p>
					</div>
				</div>
			}

			<div className="px-14 md:px-28 py-14 lg:flex">
				<div className="w-full lg:w-1/2 lg:pr-10">
					{ checkoutPhase === 'wallet' && 
						<>
							<p className="font-semibold text-lg">Connect Wallet</p>
							<p className="text-gray-600 mb-5">Choose your preferred wallet.</p>

							<div className="flex flex-wrap gap-4">
								{ walletOptions.map((option) => (
									<button 
										key={option.id}
										className="bg-white border border-gray-200 rounded-md 
										text-black py-2.5 px-4 flex flex-wrap items-center 
										transition duration-150 hover:bg-gray-100"
										onClick={() => connectWallet(option.id) }
									>
										<span className="pr-4 h-5">
											<img src={option.icon} alt={option.name} className="h-full rounded-sm" />
										</span>
										<span>
											{ option.name }
										</span>
									</button>
								))}
							</div>
						</>
					}
					{ checkoutPhase === 'payment' && 
						<>
							<p className="font-semibold text-lg">Pay with:</p>
							<p className="text-gray-600 mb-5">Choose your preferred payment token.</p>

							<div className="flex flex-wrap gap-4">
								{ tokens.map((token) => (
									<button 
										key={token._id}
										className={
											classNames("bg-white border border-gray-200 rounded-md\
											text-black py-2.5 px-4 flex flex-wrap items-center\
											transition duration-150 hover:bg-gray-100",
											{ 'bg-blue-50 border-black': userToken?._id === token._id }
										)}
										onClick={() => setUserToken(token) }
									>
										<span className="pr-4 h-5">
											<img src={token.icon} alt={token.name} className="h-full" />
										</span>
										<span>
											{ token.symbol }
										</span>
									</button>
								))}
							</div>
						</>
					}
				</div>
				<div className="w-full lg:w-1/2 lg:pl-10 mt-14 lg:mt-0">
					<div className="bg-white rounded-lg border border-gray-100 shadow-lg py-6 px-8 h-full">
						<div className="pb-8">
							<p className="text-lg font-semibold">Your items</p>
						</div>
						<div className="flex">
							<div>
								<p>{product.name}</p>
							</div>
							<div className="ml-auto flex items-center whitespace-nowrap">
								<span className="h-3 mr-3">
									<img src={productCurrency.icon} alt="Currency Icon" className="h-full"/>
								</span>
								<p className="font-medium">
									{product.price} {productCurrency.symbol}
								</p>
							</div>
						</div>
						<hr className="my-6" />
						<div className="flex">
							<div>
								<p className="text-gray-600">Subtotal</p>
							</div>
							<div className="ml-auto flex items-center whitespace-nowrap">
								<span className="h-3 mr-3">
									<img src={productCurrency.icon} alt="Currency Icon" className="h-full"/>
								</span>
								<p className="font-medium">
									{product.price} {productCurrency.symbol}
								</p>
							</div>
						</div>

						<div className="">
							{ checkoutPhase === 'wallet' && 
								<button className="bg-gray-400 text-white w-full p-3 rounded-full uppercase font-semibold mt-20" disabled>
									Connect wallet first
								</button>
							}
							{ checkoutPhase === 'payment' && 
								<>
									{ !userToken?._id &&
										<button className="bg-gray-400 text-white w-full p-3 rounded-full uppercase font-semibold mt-20" disabled>
											Choose payment token
										</button>
									}
									{ !!userToken?._id && 
										<>
											<div className="flex mt-6">
												<p>Total</p>
												<div className="ml-auto">
													<div className="flex items-center whitespace-nowrap">
														<span className="h-3 mr-3">
															<img src={userToken.icon} alt="Currency Icon" className="h-full"/>
														</span>
														<p className="font-medium">
															{ formatCrypto(conversionRate.rate) } { userToken.symbol }
														</p>
													</div>
													<p className="text-sm text-gray-600 text-right">~ {formatUSD(conversionRate.usdRate)}</p>
												</div>
											</div>
											<button 
												className="bg-blue-500 text-white w-full p-3 rounded-full uppercase font-semibold mt-20"
												onClick={() => startPayment() }
											>
												{ paymentLoading &&
													<div className="w-full flex justify-center">
														<BaseSpinner size="5" />
													</div>
												}
												{ !paymentLoading &&
													<>Pay { formatCrypto(conversionRate.rate) } { userToken.symbol }</>
												}
											</button>
										</>
									}
								</>
							}
						</div>
					</div>
				</div>
			</div>
		</div>
		</>
	)
}