import { useEffect, useState, createContext, ReactNode } from 'react'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { API_URL } from '../constants'
import Web3 from 'web3'

export async function CreateProduct(
  merchant: string,
  name: string,
  price: any,
  currency: any,
  recurring: any,
) {
  try {
    const authToken = localStorage.getItem('auth_token')
    const content = {
      merchant: merchant,
      name: name,
      price: price,
      currency: currency,
      recurring: recurring,
    }

    console.log(content)
    const response = await fetch(API_URL + 'products', {
      method: 'POST',
      body: JSON.stringify(content),
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        Connection: 'keep-alive',
        Authorization: `Bearer ${authToken}`,
      },
    })
    // @ts-ignore: Object is possibly 'null'.

    const data = await response.json()

    return data
  } catch (error) {
    console.log(
      error,
      'Got this error when generating an auth token for merchant',
    )
  }
}
