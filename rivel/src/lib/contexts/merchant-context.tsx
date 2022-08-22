import { createContext } from 'react'

const MerchantContext = createContext({
  merchantId: undefined,
  setMerchantId: (id: any) => {},
})

export default MerchantContext
