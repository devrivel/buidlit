import { useEffect, useState, createContext, ReactNode } from 'react'
import Web3Modal from 'web3modal'
import { ethers } from 'ethers'
import { API_URL } from '../constants'
import Web3 from 'web3'

export async function CreateKey(merchant: any) {
  try {
    const authToken = localStorage.getItem('auth_token')
    const response = await fetch(
      API_URL + 'merchants/' + merchant + '/apikeys?type=live',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
          Connection: 'keep-alive',
          Authorization: `Bearer ${authToken}`,
        },
      },
    )
    // @ts-ignore: Object is possibly 'null'.

    const data = await response.json()

    console.log(data)

    return data
  } catch (error) {
    console.log(
      error,
      'Got this error when generating an auth token for merchant',
    )
  }
}
