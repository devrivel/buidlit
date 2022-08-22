import { useState } from 'react'
import Image from 'next/image'
import cn from 'classnames'
import { useWindowScroll } from '@/lib/hooks/use-window-scroll'
import { FlashIcon } from '@/components/icons/flash'
import Hamburger from '@/components/ui/hamburger'
import ActiveLink from '@/components/ui/links/active-link'
import SearchButton from '@/components/search/button'
import { useIsMounted } from '@/lib/hooks/use-is-mounted'
import { useDrawer } from '@/components/drawer-views/context'
import Sidebar from '@/layouts/dashboard/_sidebar'
import WalletConnect from '@/components/nft/wallet-connect'
import RivelLogo from '@/assets/images/RivelLogoWhite.png'
import Link from 'next/link'

function NotificationButton() {
  return (
    <ActiveLink href="/notifications">
      <div className="relative flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-100 bg-white text-brand shadow-main transition-all hover:-translate-y-0.5 hover:shadow-large focus:-translate-y-0.5 focus:shadow-large focus:outline-none dark:border-gray-700 dark:bg-light-dark dark:text-white sm:h-12 sm:w-12">
        <FlashIcon className="h-auto w-3 sm:w-auto" />
        <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-brand shadow-light sm:h-3 sm:w-3" />
      </div>
    </ActiveLink>
  )
}

function LinkArea() {
  return (
    <div className="flex w-full max-w-[500px] justify-between px-[30px]">
      <button>SOLUTIONS</button>
      <button>DEVELOPERS</button>
      <button>PRICING</button>
    </div>
  )
}

function DashboardButton() {
  return (
    <button>
      <div className="rounded-[30px] border-[2px] px-3">
        <p>DASHBOARD</p>
      </div>
    </button>
  )
}

export function Header() {
  const { openDrawer } = useDrawer()
  const isMounted = useIsMounted()
  let windowScroll = useWindowScroll()
  let [isOpen, setIsOpen] = useState(false)

  return (
    <nav
      className={`invisible fixed top-0 z-30 w-full transition-all duration-300 ltr:right-0 rtl:left-0 md:visible xl:pr-[30px] ${
        isMounted && windowScroll.y > 10
          ? 'h-16 bg-gradient-to-b from-white to-white/80 shadow-card backdrop-blur dark:from-dark dark:to-dark/80 sm:h-20'
          : 'h-16 sm:h-24'
      }`}
    >
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10 3xl:px-12">
        <Image src={RivelLogo} />
        <LinkArea />

        <DashboardButton />
      </div>
    </nav>
  )
}

interface HomeLayoutProps {
  contentClassName?: string
}

export default function Layout({
  children,
  contentClassName,
}: React.PropsWithChildren<HomeLayoutProps>) {
  return (
    <div>
      <Header />
      <main className={cn('', contentClassName)}>{children}</main>
    </div>
  )
}
