import type { NextPageWithLayout } from '@/types'
import { NextSeo } from 'next-seo'
import DashboardLayout from '@/layouts/dashboard/_dashboard'
import Button from '@/components/ui/button'
import Input from '@/components/ui/forms/input'
import InputLabel from '@/components/ui/input-label'
import { CreateMerchant } from '@/lib/hooks/use-create-merchant'
import { API_STATUS } from '@/lib/constants'
import { useState, useContext } from 'react'
import { WalletContext } from '@/lib/hooks/use-connect'

const CreateMerchantPage: NextPageWithLayout = () => {
  const [name, setName] = useState()
  const [status, setStatus] = useState('')
  const { address, disconnectWallet, balance } = useContext(WalletContext)

  function verifyMerchant() {
    // @ts-ignore: Object is possibly 'null'
    if (
      document.getElementById('nameInput').value == '' ||
      document.getElementById('nameInput').value == undefined
    ) {
      setStatus('Please enter a name for the account')
    } else {
      // @ts-ignore: Object is possibly 'null'
      setStatus('Pending')
      console.log(address)
      // @ts-ignore: Object is possibly 'null'
      CreateMerchant(document.getElementById('nameInput').value, address)
        // @ts-ignore: Object is possibly 'null'
        .then(setStatus('Success'))
    }
  }

  return (
    <>
      <NextSeo
        title="Create Merchant"
        description="Rivel - The most advanced on-chain crypto payment processor"
      />
      <div className="mx-auto w-full px-4 pt-8 pb-14 sm:px-6 sm:pb-20 sm:pt-12 lg:px-8 xl:px-10 2xl:px-0">
        <h2 className="mb-6 text-lg font-medium uppercase tracking-wider text-gray-900 dark:text-white sm:mb-10 sm:text-2xl">
          Create Merchant Account
        </h2>

        {/* Name */}
        <div className="mb-8">
          <InputLabel title="Name" important />
          <Input type="text" placeholder="Merchant Name" id="nameInput" />
          {/* @ts-ignore: Object is possibly 'null' */}
          <h1 className={`mt-[10px] ${API_STATUS[status]}`}>{status}</h1>
        </div>
        {/* @ts-ignore: Object is possibly 'null' */}
        <Button onClick={() => verifyMerchant()} shape="rounded">
          CREATE
        </Button>
      </div>
    </>
  )
}

CreateMerchantPage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>
}

export default CreateMerchantPage
