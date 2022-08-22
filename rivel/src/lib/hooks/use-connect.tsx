import { useEffect, useState, createContext, ReactNode } from 'react'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { API_URL } from '../constants'
import Web3 from 'web3'
import { CreateMerchant } from './use-create-merchant'

const web3modalStorageKey = 'WEB3_CONNECT_CACHED_PROVIDER'

export const WalletContext = createContext<any>({})

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [address, setAddress] = useState<string | undefined>(undefined)
  const [balance, setBalance] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  // @ts-ignore: Object is possibly 'null'.
  const [provider, setProvider] =
    useState<ethers.providers.Web3Provider>(undefined)
  const [authToken, setAuthToken] = useState()
  const web3Modal =
    typeof window !== 'undefined' && new Web3Modal({ cacheProvider: true })

  /* This effect will fetch wallet address if user has already connected his/her wallet */
  useEffect(() => {
    async function checkConnection() {
      try {
        if (window && window.ethereum) {
          // Check if web3modal wallet connection is available on storage
          if (localStorage.getItem(web3modalStorageKey)) {
            await connectToWallet()
          }
        } else {
          console.log('window or window.ethereum is not available')
        }
      } catch (error) {
        console.log(error, 'Catch error Account is not connected')
      }
    }
    checkConnection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setWalletAddress = async (provider: any) => {
    try {
      const signer = provider.getSigner()
      if (signer) {
        const web3Address = await signer.getAddress()
        setAddress(web3Address)
        getBalance(provider, web3Address)
      }
    } catch (error) {
      console.log(
        'Account not connected; logged from setWalletAddress function',
      )
    }
  }

  const getBalance = async (provider: any, walletAddress: string) => {
    const walletBalance = await provider.getBalance(walletAddress)
    const balanceInEth = ethers.utils.formatEther(walletBalance)
    setBalance(balanceInEth)
  }

  const disconnectWallet = () => {
    setAddress(undefined)
    web3Modal && web3Modal.clearCachedProvider()
  }

  const checkIfExtensionIsAvailable = () => {
    if (
      (window && window.web3 === undefined) ||
      (window && window.ethereum === undefined)
    ) {
      setError(true)
      web3Modal && web3Modal.toggleModal()
    }
  }

  const connectToWallet = async () => {
    try {
      setLoading(true)
      checkIfExtensionIsAvailable()
      const connection = web3Modal && (await web3Modal.connect())
      const provider = new ethers.providers.Web3Provider(connection)
      setProvider(provider)
      getAuthSignature()
      await subscribeProvider(connection)
      setWalletAddress(provider)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(
        error,
        'got this error on connectToWallet catch block while connecting the wallet',
      )
    }
  }

  const setToken = async (auth_token: any) => {
    console.log(auth_token)
    setAuthToken(auth_token)
    // @ts-ignore: Object is possibly 'null'.
    localStorage.setItem('auth_token', auth_token)
    // @ts-ignore: Object is possibly 'null'.
    localStorage.setItem('auth_exp', new Date())
    console.log('josh', authToken)
    location.reload()
  }

  const getAuthToken = async (signature: string) => {
    const content = { signature: signature }
    const response = await fetch(API_URL + 'auth/web3/token', {
      method: 'POST',
      // @ts-ignore: Object is possibly 'null'.
      body: new URLSearchParams(content),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
        Connection: 'keep-alive',
      },
    })
      // @ts-ignore: Object is possibly 'null'.
      .then((response) => response.json())
      .then((data) => {
        setToken(data.token)
      })
  }

  const getAuthSignature = async () => {
    try {
      const connection = web3Modal && (await web3Modal.connect())
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      console.log(verifySignature())
      if (await verifySignature()) {
        console.log(localStorage.getItem('auth_token'))
        return localStorage.getItem('auth_token')
      }
      const signature = await signer.signMessage('Login to Rivel')
      getAuthToken(signature)
      return signature
    } catch (error) {
      setLoading(false)
      console.log(
        error,
        'Got this error when generating an auth token for merchant',
      )
    }
  }

  async function verifySignature() {
    const tokenData = localStorage.getItem('auth_exp')
    const token = localStorage.getItem('auth_token')
    if (!tokenData || token == undefined) {
      return false
    }
    // @ts-ignore: Object is possibly 'null'.
    const oldDate = new Date(tokenData)
    const compareDate = new Date(
      new Date(oldDate).getTime() + 60 * 60 * 24 * 1000,
    )
    const todaysDate = new Date()
    if (todaysDate.getDate() < compareDate.getDate()) {
      return true
    } else {
      return false
    }
  }

  const subscribeProvider = async (connection: any) => {
    connection.on('close', () => {
      disconnectWallet()
    })
    connection.on('accountsChanged', async (accounts: string[]) => {
      if (accounts?.length) {
        setAddress(accounts[0])
        const provider = new ethers.providers.Web3Provider(connection)
        getBalance(provider, accounts[0])
      } else {
        disconnectWallet()
      }
    })
  }

  return (
    <WalletContext.Provider
      value={{
        address,
        balance,
        loading,
        error,
        connectToWallet,
        disconnectWallet,
        provider,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}
