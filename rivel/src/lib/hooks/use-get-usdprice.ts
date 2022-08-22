const API_URL = 'https://api.dexscreener.com/latest/dex/tokens/'

export async function GetPrice(token: any) {
  try {
    const response = await fetch(API_URL + token, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        Connection: 'keep-alive',
      },
    })
    // @ts-ignore: Object is possibly 'null'.

    const data = await response.json()
    console.log(data.pairs[0].priceUsd)
    return data.pairs[0].priceUsd
  } catch (error) {
    console.log(
      error,
      'Got this error when generating an auth token for merchant',
    )
  }
}
