import { useState } from 'react'
import type { NextPageWithLayout } from '@/types'
import cn from 'classnames'
import { NextSeo } from 'next-seo'
import { Transition } from '@/components/ui/transition'
import DashboardLayout from '@/layouts/dashboard/_dashboard'
import { RadioGroup } from '@/components/ui/radio-group'
import { Listbox } from '@/components/ui/listbox'
import Image from '@/components/ui/image'
import Button from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import Input from '@/components/ui/forms/input'
import Textarea from '@/components/ui/forms/textarea'
import Uploader from '@/components/ui/forms/uploader'
import InputLabel from '@/components/ui/input-label'
import ToggleBar from '@/components/ui/toggle-bar'
import { TagIcon } from '@/components/icons/tag-icon'
import { LoopIcon } from '@/components/icons/loop-icon'
import { SandClock } from '@/components/icons/sand-clock'
import { ChevronDown } from '@/components/icons/chevron-down'
import { Ethereum } from '@/components/icons/ethereum'
import { Flow } from '@/components/icons/flow'
import { Warning } from '@/components/icons/warning'
import { Unlocked } from '@/components/icons/unlocked'
import Avatar from '@/components/ui/avatar'
import { CreateProduct } from '@/lib/hooks/use-create-product'
//images
import AuthorImage from '@/assets/images/author.jpg'
import NFT1 from '@/assets/images/nft/nft-1.jpg'
import Router from 'next/router'
import { Sun } from '@/components/icons/sun'
import { CalenderIcon } from '@/components/icons/calender'
import { Usdc } from '@/components/icons/usdc'
import { Chainlink } from '@/components/icons/chainlink'
import { Matic } from '@/components/icons/matic'
import BaseSpinner from '@/components/icons/loader'
import Link from 'next/link'

const PeriodOptions = [
  {
    name: 'Days',
    value: 'day',
    icon: <Sun className="h-5 w-5 sm:h-auto sm:w-auto" />,
  },
  {
    name: 'Months',
    value: 'month',
    icon: <CalenderIcon className="h-5 w-5 sm:h-auto sm:w-auto" />,
  },
  {
    name: 'Years',
    value: 'year',
    icon: <SandClock className="h-5 w-5 sm:h-auto sm:w-auto" />,
  },
]

const CurrencyOptions = [
  {
    id: 1,
    name: 'Wrapped Ethereum',
    value: 'WETH',
    icon: <Ethereum height={24} />,
  },
  {
    id: 2,
    name: 'USDC',
    value: 'USDC',
    icon: <Usdc height={24} />,
  },
  {
    id: 3,
    name: 'Wrapped Matic',
    value: 'WMATIC',
    icon: <Matic height={24} />,
  },
  {
    id: 4,
    name: 'Link',
    value: 'LINK',
    icon: <Chainlink height={24} />,
  },
]

type PeriodTypeProps = {
  value: string
  onChange: (value: string) => void
}

function PeriodType({ value, onChange }: PeriodTypeProps) {
  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className="grid grid-cols-3 gap-3"
    >
      {PeriodOptions.map((item, index) => (
        <RadioGroup.Option value={item.value} key={index}>
          {({ checked }) => (
            <span
              className={`relative flex cursor-pointer items-center justify-center rounded-lg border-2 border-solid bg-white text-center text-sm font-medium tracking-wider shadow-card transition-all hover:shadow-large dark:bg-light-dark ${
                checked ? 'border-brand' : 'border-white dark:border-light-dark'
              }`}
            >
              <span className="relative flex h-28 flex-col items-center justify-center gap-3 px-2 text-center text-xs uppercase sm:h-36 sm:gap-4 sm:text-sm">
                {item.icon}
                {item.name}
              </span>
            </span>
          )}
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  )
}

const CreateNFTPage: NextPageWithLayout = () => {
  let [publish, setPublish] = useState(true)
  let [periodType, setPeriodType] = useState('fixed')
  let [trialType, setTrialType] = useState('fixed')
  let [currency, setCurrency] = useState(CurrencyOptions[0])
  let [isLoading, setIsLoading] = useState(false)
  let [productData, setProductData] = useState()

  const createNewProduct = async () => {
    setIsLoading(true)

    let trialValue

    //@ts-ignore
    if (
      document.getElementById('trialValue').value == '' ||
      document.getElementById('trialValue').value == null
    ) {
      trialValue = 0
    } else {
      //@ts-ignore
      trialValue = `${document.getElementById('trialValue').value} ${trialType}`
    }

    const path = Router.asPath.split('?')[1]
    //@ts-ignore
    const productName = document.getElementById('productName').value
    //@ts-ignore
    const productPrice = document.getElementById('productPrice').value

    const productCurrency = { type: 'crypto', detail: currency.value }
    //@ts-ignore
    const productInterval = {
      interval: `${document.getElementById('periodValue').value} ${periodType}`,
      intervalCount: 0,
      trialPeriod: trialValue,
    }

    let newProduct = await CreateProduct(
      path,
      productName,
      productPrice,
      productCurrency,
      productInterval,
    )

    const data = await newProduct
    console.log(data)
    setProductData(data)
    setIsLoading(false)
  }

  return (
    <>
      <NextSeo
        title="Create Product"
        description="Rivel - the most advanced crypto payment processor"
      />

      <div className="mx-auto w-full px-4 pt-8 pb-14 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8 xl:px-10 2xl:px-0">
        {!productData ? (
          <div>
            {!isLoading ? (
              <div>
                <h2 className="mb-6 text-lg font-medium uppercase tracking-wider text-gray-900 dark:text-white sm:mb-10 sm:text-2xl">
                  Create New Product
                </h2>
                {/* Name */}
                <div className="mb-8">
                  <InputLabel title="Name" important />
                  <Input type="text" placeholder="Item name" id="productName" />
                </div>

                {/* Settlement Currency */}
                <div className="mb-8">
                  <InputLabel title="Settlement Currency" />
                  <div className="relative">
                    <Listbox value={currency} onChange={setCurrency}>
                      <Listbox.Button className="text-case-inherit letter-space-inherit flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 outline-none transition-shadow duration-200 hover:border-gray-900 hover:ring-1 hover:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-600 dark:hover:ring-gray-600 sm:h-12 sm:px-5">
                        <div className="flex items-center">
                          <span className="ltr:mr-2 rtl:ml-2">
                            {currency.icon}
                          </span>
                          {currency.name}
                        </div>
                        <ChevronDown />
                      </Listbox.Button>
                      <Transition
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute left-0 z-10 mt-1 grid w-full origin-top-right gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-large outline-none dark:border-gray-700 dark:bg-gray-800 xs:p-2">
                          {CurrencyOptions.map((option) => (
                            <Listbox.Option key={option.id} value={option}>
                              {({ selected }) => (
                                <div
                                  className={`flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-gray-900 transition dark:text-gray-100  ${
                                    selected
                                      ? 'bg-gray-200/70 font-medium dark:bg-gray-600/60'
                                      : 'hover:bg-gray-100 dark:hover:bg-gray-700/70'
                                  }`}
                                >
                                  <span className="ltr:mr-2 rtl:ml-2">
                                    {option.icon}
                                  </span>
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

                {/* Price */}
                <div className="mb-8">
                  <InputLabel
                    title="Price"
                    subTitle="# amount of settlement token"
                    important
                  />
                  <Input
                    min={0}
                    type="number"
                    placeholder="Enter your price"
                    inputClassName="spin-button-hidden"
                    id="productPrice"
                  />
                </div>

                {/* Interval Period Selector */}
                <div className="mb-8">
                  <InputLabel title="Interval Period" />
                  {publish && (
                    <PeriodType value={periodType} onChange={setPeriodType} />
                  )}
                </div>
                <div className="mb-8">
                  <Input type="number" placeholder="Enter #" id="periodValue" />
                </div>

                {/* Trial Period Selector */}
                <div className="mb-8">
                  <InputLabel title="Trial Period" subTitle="Defaults to 0" />
                  {publish && (
                    <PeriodType value={trialType} onChange={setTrialType} />
                  )}
                </div>
                <div className="mb-8">
                  <Input type="number" placeholder="0" id="trialValue" />
                </div>

                <Button onClick={() => createNewProduct()} shape="rounded">
                  CREATE
                </Button>
              </div>
            ) : (
              <div className="mt-[100px] flex h-[80%] h-full w-full items-center justify-center justify-center align-middle">
                {BaseSpinner()}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="mb-6 text-lg font-medium uppercase tracking-wider text-gray-900 dark:text-white sm:mb-10 sm:text-2xl">
              Product Created
            </h2>
            <div className="flex h-full flex-col justify-center rounded-lg bg-white p-6 shadow-card dark:bg-light-dark xl:p-8">
              <h1 className="mb-7 mt-[10px] font-medium tracking-tighter text-gray-900 dark:text-white xl:text-2xl 3xl:mb-8 3xl:text-[32px]">
                {/* @ts-ignore */}
                {productData?.name}
              </h1>
              <div className="mb-7 mt-[10px] font-medium tracking-tighter text-gray-900 dark:text-white xl:text-2xl 3xl:mb-8 3xl:text-[32px]">
                {/* @ts-ignore */}
                <h1>Merchant Id: {productData?.merchant}</h1>
              </div>
              <a
                target={'_blank'}
                href={`https://pay.rivel.io/?p=${productData?.checkoutId}`}
                rel="noreferrer"
              >
                <Button onClick={() => createNewProduct()}>
                  View Customer Checkout
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

CreateNFTPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>
}

export default CreateNFTPage
