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

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  }
}

const HomePage: NextPageWithLayout<
  InferGetStaticPropsType<typeof getStaticProps>
> = () => {
  return (
    <>
      <NextSeo
        title="Rivel.io"
        description="Rivel - Blockchain Oracle, Crypto Payment System"
      />
      <div className="flex flex-wrap">
        <div>
          <h1>Coming Soon</h1>
        </div>
      </div>
    </>
  )
}

HomePage.getLayout = function getLayout(page) {
  return <DashboardLayout>{page}</DashboardLayout>
}

export default HomePage
