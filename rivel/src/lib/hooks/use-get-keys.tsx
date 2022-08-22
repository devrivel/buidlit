import { API_URL } from '../constants'

export async function getKeys(id: any) {
  try {
    const authToken = localStorage.getItem('auth_token')
    const response = await fetch(
      API_URL + 'merchants/' + id + '/apikeys?type=live',
      {
        method: 'GET',
        // @ts-ignore: Object is possibly 'null'.
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: '*/*',
          Connection: 'keep-alive',
          Authorization: `Bearer ${authToken}`,
        },
      },
    )

    const data = await response.json()

    return data
  } catch (error) {
    console.log(
      error,
      'Got this error when generating an auth token for merchant',
    )
  }
}
