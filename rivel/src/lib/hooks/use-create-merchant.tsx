import {
  useEffect,
  useState,
  createContext,
  ReactNode,
  useContext,
} from 'react'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { API_URL } from '../constants'
import Web3 from 'web3'

export async function UpdateMerchant(id: any, address: any) {
  try {
    const authToken = localStorage.getItem('auth_token')
    const content = {
      paymentAddresses: [
        {
          chainId: '137',
          address: address,
        },
      ],
    }
    const response = await fetch(API_URL + 'merchants/' + id, {
      method: 'PUT',
      // @ts-ignore: Object is possibly 'null'.
      body: JSON.stringify(content),
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        Connection: 'keep-alive',
        Authorization: `Bearer ${authToken}`,
      },
    })
      // @ts-ignore: Object is possibly 'null'.
      .then((response) => console.log(response))
  } catch (error) {
    console.log(error, 'Got this error when updating merchant')
  }
}

export async function CreateMerchant(name: string, address: any) {
  try {
    const authToken = localStorage.getItem('auth_token')
    const content = { name: name }
    const response = await fetch(API_URL + 'merchants', {
      method: 'POST',
      // @ts-ignore: Object is possibly 'null'.
      body: new URLSearchParams(content),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: '*/*',
        Connection: 'keep-alive',
        Authorization: `Bearer ${authToken}`,
      },
    })
      // @ts-ignore: Object is possibly 'null'.
      .then((response) => response.json())
      .then((data) => UpdateMerchant(data._id, address))
  } catch (error) {
    console.log(
      error,
      'Got this error when generating an auth token for merchant',
    )
  }
}
