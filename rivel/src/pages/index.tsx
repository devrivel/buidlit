import type { GetStaticProps, InferGetStaticPropsType } from 'next'
import { useState, useEffect, useContext } from 'react'
import { NextSeo } from 'next-seo'
import type { NextPageWithLayout } from '@/types'
import DashboardLayout from '@/layouts/dashboard/_dashboard'
import Button from '@/components/ui/button'
import AuthorImage from '@/assets/images/author.jpg'
import ProductsList from '@/components/products/productslist'
import CustomersList from '@/components/customers/customerslist'
import InputLabel from '@/components/ui/input-label'
import { Listbox } from '@/components/ui/listbox'
import { ChevronDown } from '@/components/icons/chevron-down'
import { Transition } from '@/components/ui/transition'
import { getMerchants } from '@/lib/hooks/use-get-merchants'
import routes from '@/config/routes'
import { Router } from 'next/router'
import Link from 'next/link'
import { UpdateMerchant } from '@/lib/hooks/use-create-merchant'
import { WalletContext } from '@/lib/hooks/use-connect'
import { getProducts } from '@/lib/hooks/use-get-products'
import BaseSpinner from '@/components/icons/loader'
import MerchantContext from '@/lib/contexts/merchant-context'
import { getSubscriptions } from '@/lib/hooks/use-get-subscriptions'
import { GetPrice } from '@/lib/hooks/use-get-usdprice'

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  }
}

const HomePage: NextPageWithLayout<
  InferGetStaticPropsType<typeof getStaticProps>
> = (props) => {
  let [merchant, setMerchant] = useState()
  let [merchantData, setMerchantData] = useState()
  let [productData, setProductData] = useState()
  let [subscriptionData, setSubscriptionData] = useState()
  let [isLoading, setIsLoading] = useState(true)
  let [isActive, setIsActive] = useState(true)
  let [revenueData, setRevenueData] = useState()

  const { setMerchantId } = useContext(MerchantContext)

  useEffect(() => {
    const merchantInfo = async () => {
      try {
        const newMerchantData = await getMerchants()
        // @ts-ignore
        setMerchant(newMerchantData.results[0])
        setMerchantData(newMerchantData.results)
        setMerchantId(newMerchantData.results[0]._id)

        const newProductData = await getProducts(newMerchantData.results[0]._id)
        setProductData(newProductData)

        const newSubscriptionData = await getSubscriptions(
          newMerchantData.results[0]._id,
          isActive,
        )

        var revenue = 0

        for (var i = 0; i < newSubscriptionData.results.length; i++) {
          const tokenPriceUsd = await GetPrice(
            newSubscriptionData.results[i]?.productCurrency,
          )
          revenue =
            revenue +
            Number(newSubscriptionData.results[i].price) * Number(tokenPriceUsd)
        }

        //@ts-ignore
        setRevenueData(revenue.toString())

        setSubscriptionData(newSubscriptionData)
        setIsLoading(false)
      } catch (error) {
        console.log(error)
        setIsLoading(false)
      }
    }

    // call the function
    merchantInfo()
      // make sure to catch any error
      .catch(console.error)
  }, [])

  const changeMerchant = async (newMerchant: any) => {
    setIsLoading(true)
    setMerchant(newMerchant)
    setMerchantId(newMerchant._id)
    const newProductData = await getProducts(newMerchant._id)
    setProductData(newProductData)

    const newSubscriptionData = await getSubscriptions(
      newMerchant._id,
      isActive,
    )
    console.log('working?', newSubscriptionData)
    setSubscriptionData(newSubscriptionData)

    var revenue = 0

    for (var i = 0; i < newSubscriptionData.results.length; i++) {
      const tokenPriceUsd = await GetPrice(
        newSubscriptionData.results[i]?.productCurrency,
      )
      revenue =
        revenue +
        Number(newSubscriptionData.results[i].price) * Number(tokenPriceUsd)
    }

    //@ts-ignore
    setRevenueData(revenue.toString())

    setSubscriptionData(newSubscriptionData)

    setIsLoading(false)
  }

  const showUnactive = async () => {
    if (isActive == true) {
      setIsActive(false)
    } else {
      setIsActive(true)
    }

    const newSubscriptionData = await getSubscriptions(merchant?._id, isActive)
    console.log('working?', newSubscriptionData)
    setSubscriptionData(newSubscriptionData)

    setIsLoading(false)
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
        <div className="mb-8">
          <InputLabel title="Merchant Accounts" />
          <div className="relative">
            <Listbox value={merchant} onChange={changeMerchant}>
              <Listbox.Button className="text-case-inherit letter-space-inherit flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 outline-none transition-shadow duration-200 hover:border-gray-900 hover:ring-1 hover:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-600 dark:hover:ring-gray-600 sm:h-12 sm:px-5">
                <div className="flex items-center">
                  {/* @ts-ignore */}
                  {merchant?.name
                    ? merchant?.name
                    : 'Please Create/Connect Merchant'}
                </div>
                <ChevronDown />
              </Listbox.Button>
              <Transition
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute left-0 z-10 mt-1 grid w-full origin-top-right gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-large outline-none dark:border-gray-700 dark:bg-gray-800 xs:p-2">
                  {/* @ts-ignore */}
                  {merchantData?.map((option) => (
                    <Listbox.Option key={option.__v} value={option}>
                      {({ selected }) => (
                        <div
                          className={`flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-gray-900 transition dark:text-gray-100  ${
                            selected
                              ? 'bg-gray-200/70 font-medium dark:bg-gray-600/60'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700/70'
                          }`}
                        >
                          {option.name}
                        </div>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </Listbox>
          </div>
        </div>

        <div>
          <div className="flex flex-wrap justify-between space-x-[0%] space-y-[10px]">
            <div className="md:w[30%] w-full sm:w-full lg:w-[30%] 2xl:w-[30%] 3xl:w-[30%]">
              <div className="flex h-full flex-col justify-center rounded-lg bg-white p-6 shadow-card dark:bg-light-dark xl:p-8">
                <h1 className="mb-7 mt-[10px] font-medium tracking-tighter text-gray-900 dark:text-white xl:text-2xl 3xl:mb-8 3xl:text-[32px]">
                  Revenue
                </h1>
                <div className="mb-7 mt-[10px] font-medium tracking-tighter text-gray-900 dark:text-white xl:text-2xl 3xl:mb-8 3xl:text-[32px]">
                  <h1>${revenueData ? revenueData : 0} USD</h1>
                </div>
                <h1>Last 30 days</h1>
              </div>
            </div>
            <div className="md:w[30%] w-full sm:w-full lg:w-[30%] 2xl:w-[30%] 3xl:w-[30%]">
              <div className="flex h-full flex-col justify-center rounded-lg bg-white p-6 shadow-card dark:bg-light-dark xl:p-8">
                <h1 className="mb-7 mt-[10px] font-medium tracking-tighter text-gray-900 dark:text-white xl:text-2xl 3xl:mb-8 3xl:text-[32px]">
                  Products
                </h1>
                <div className="mb-7 mt-[10px] font-medium tracking-tighter text-gray-900 dark:text-white xl:text-2xl 3xl:mb-8 3xl:text-[32px]">
                  {/* @ts-ignore */}
                  <h1>
                    {productData?.results?.length
                      ? productData?.results?.length
                      : 0}
                  </h1>
                </div>
                <h1>Total</h1>
              </div>
            </div>
            <div className="md:w[30%] w-full sm:w-full lg:w-[30%] 2xl:w-[30%] 3xl:w-[30%]">
              <div className="flex h-full flex-col justify-center rounded-lg bg-white p-6 shadow-card dark:bg-light-dark xl:p-8">
                <h1 className="mb-7 mt-[10px] font-medium tracking-tighter text-gray-900 dark:text-white xl:text-2xl 3xl:mb-8 3xl:text-[32px]">
                  Customers
                </h1>
                <div className="mb-7 mt-[10px] font-medium tracking-tighter text-gray-900 dark:text-white xl:text-2xl 3xl:mb-8 3xl:text-[32px]">
                  {/* @ts-ignore */}
                  <h1>
                    {subscriptionData?.results?.length
                      ? subscriptionData?.results?.length
                      : 0}
                  </h1>
                </div>
                <h1>Total</h1>
              </div>
            </div>
          </div>

          <div className="mt-8 grid w-full gap-6 sm:my-10">
            <div className="flex h-full w-full flex-col justify-center rounded-lg bg-white p-6 shadow-card dark:bg-light-dark xl:p-8">
              <div className="flex w-full flex-row justify-between">
                <div>
                  <h1>Products</h1>
                  {/* @ts-ignore */}
                  <h1>{productData?.results?.length} Total</h1>
                </div>
                <div>
                  {/* @ts-ignore */}
                  <Link href={routes.createProduct + `?${merchant?._id}`}>
                    <Button>+ Add New</Button>
                  </Link>
                </div>
              </div>
              {ProductsList(productData)}
            </div>
          </div>

          <div className="mt-8 grid w-full gap-6 sm:my-10">
            <div className="flex h-full w-full flex-col justify-center rounded-lg bg-white p-6 shadow-card dark:bg-light-dark xl:p-8">
              <div className="flex w-full flex-row justify-between">
                <div>
                  <h1>Customers</h1>
                  <h1>{subscriptionData?.results?.length} Total</h1>
                </div>
                <div>
                  <Button onClick={showUnactive}>
                    {!isActive ? 'Show Unactive' : 'Show Active'}
                  </Button>
                </div>
              </div>
              {CustomersList(subscriptionData)}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

HomePage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>
}

export default HomePage
