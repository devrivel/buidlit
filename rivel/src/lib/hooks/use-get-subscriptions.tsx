import { API_URL } from '../constants'

export async function getSubscriptions(merchantId: any, active: boolean) {
  let subStatus
  if (active == true) {
    subStatus = '&status=active'
  } else {
    subStatus = '&status=canceled'
  }

  try {
    const authToken = localStorage.getItem('auth_token')
    const response = await fetch(
      API_URL + 'subscriptions?merchant=' + merchantId + subStatus,
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
