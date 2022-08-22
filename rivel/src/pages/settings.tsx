import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { NextSeo } from 'next-seo'
import type { NextPageWithLayout } from '@/types'
import DashboardLayout from '@/layouts/dashboard/_dashboard'
import CoinSlider from '@/components/ui/coin-card'
import OverviewChart from '@/components/ui/chats/overview-chart'
import LiquidityChart from '@/components/ui/chats/liquidity-chart'
import VolumeChart from '@/components/ui/chats/volume-chart'
import TopPools from '@/components/ui/top-pools'
import TransactionTable from '@/components/transaction/transaction-table'
import TopCurrencyTable from '@/components/top-currency/currency-table'
import { coinSlideData } from '@/data/static/coin-slide-data'
import Avatar from '@/components/ui/avatar'
import TopupButton from '@/components/ui/topup-button'
import Button from '@/components/ui/button'
//images
import AuthorImage from '@/assets/images/author.jpg'
import ProductsList from '@/components/products/productslist'
import CustomersList from '@/components/customers/customerslist'
import Input from '@/components/ui/forms/input'
import InputPlaceholder from '@/components/icons/input-placeholder.svg'
import { useEffect, useState } from 'react'
import RivelLogo from '@/assets/images/Rivel.svg'
import Image from 'next/image'
import classNames from 'classnames'
import { getKeys } from '@/lib/hooks/use-get-keys'
import MerchantContext from '@/lib/contexts/merchant-context'
import { useContext } from 'react'
import BaseSpinner from '@/components/icons/loader'
import { CreateKey } from '@/lib/hooks/use-create-key'

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  }
}

const Settings: NextPageWithLayout<
  InferGetStaticPropsType<typeof getStaticProps>
> = () => {
  const [preview, setPreview] = useState()
  const [apiKeys, setApiKeys] = useState()
  let [isLoading, setIsLoading] = useState(true)
  const { merchantId } = useContext(MerchantContext)

  const setImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.name
    // @ts-ignore: Object is possibly 'null'.
    const file = event.target.files[0]
    console.log(file)
    // @ts-ignore: Object is possibly 'null'.
    setPreview(URL.createObjectURL(file))
  }

  useEffect(() => {
    const getApiKeys = async () => {
      const data = await getKeys(merchantId)
      setApiKeys(data.results)
      console.log(apiKeys)
      setIsLoading(false)
    }

    // call the function
    getApiKeys()
      // make sure to catch any error
      .catch(console.error)
  }, [])

  const apiComponent = (value: any) => {
    return (
      <div className="mt-[20px] mb-[20px] flex h-full w-full w-full flex-row justify-between rounded-lg bg-white p-6 shadow-card dark:bg-light-dark xl:p-8">
        <h2>API Key:</h2>
        <h2>{value.key}</h2>
      </div>
    )
  }

  const CreateApiKey = async () => {
    const response = await CreateKey(merchantId)
    const data = await getKeys(merchantId)
    console.log(data)
    setApiKeys(data.results)
  }

  return (
    <>
      <NextSeo
        title="Rivel.io"
        description="Rivel - Blockchain Oracle, Crypto Payment System"
      />
      <div
        className={
          !isLoading
            ? 'hidden'
            : 'mt-[100px] flex h-[80%] h-full w-full items-center justify-center justify-center align-middle'
        }
      >
        {BaseSpinner()}
      </div>
      <div className={isLoading ? 'hidden' : ''}>
        <h1 className="mb-7 mt-[10px] font-medium tracking-tighter text-gray-900 dark:text-white xl:text-2xl 3xl:mb-8 3xl:text-[32px]">
          Settings
        </h1>
        {/* <div className="mb-[20px] flex h-full w-full flex-col justify-center rounded-lg bg-white p-6 shadow-card dark:bg-light-dark xl:w-[50%] xl:p-8">
          <h1>Display Name</h1>
          <Input placeholder="Mico" />
        </div>
        <div className="mb-[20px] flex h-full w-full flex-col justify-center rounded-lg bg-white p-6 shadow-card dark:bg-light-dark xl:w-[50%] xl:p-8">
          <h1>Logo</h1>
          <h2>Logo can be used to customize checkout pages</h2>
          <label htmlFor={'upload-button'}>
            <div className="my-[20px] mt-[10px] flex flex h-full w-full flex-col justify-center justify-center rounded-lg bg-stone-100 p-6 shadow-card dark:bg-light-dark xl:p-8">
              <Image
                className=""
                width={'100%'}
                height={'100%'}
                src={preview ? preview : RivelLogo}
              />
            </div>
          </label>
          <input
            type="file"
            name="logoImage"
            id="upload-button"
            style={{ display: 'none' }}
            accept="image/*"
            onChange={setImage}
          />
          {!preview ? (
            <h2>Please select an image</h2>
          ) : (
            <h2>Click to change image</h2>
          )}
        </div>
        <div className="mb-[20px] flex h-full w-full flex-col justify-center rounded-lg bg-white p-6 shadow-card dark:bg-light-dark xl:w-[50%] xl:p-8">
          <h1>Payment Addresses</h1>
          <h2>
            To receive payments in multiple chains, you have to add a payment
            address for the desired chain. Click a chain to change the payment
            address.
          </h2>
        </div> */}
        <div className="mb-[20px] flex h-full w-full flex-col justify-center rounded-lg bg-white p-6 shadow-card dark:bg-light-dark xl:w-[50%] xl:p-8">
          <h1>API Keys</h1>
          <h2>Generate API Keys for use with the Rivel SDK.</h2>

          {/* @ts-ignore */}
          {apiKeys?.map((key) => apiComponent(key))}

          <Button onClick={() => CreateApiKey()} shape="rounded">
            + Create API Key
          </Button>
        </div>
        {/* <Button className="w-full xl:w-[50%]">Save Settings</Button> */}
      </div>
    </>
  )
}

Settings.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>
}

export default Settings
