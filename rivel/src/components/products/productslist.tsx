import {
  useTable,
  useResizeColumns,
  useFlexLayout,
  useSortBy,
  usePagination,
} from 'react-table'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import Scrollbar from '@/components/ui/scrollbar'
import { ChevronDown } from '@/components/icons/chevron-down'
import { TopCurrencyData } from '@/data/static/top-currency-data'
import { useBreakpoint } from '@/lib/hooks/use-breakpoint'
import { useIsMounted } from '@/lib/hooks/use-is-mounted'
import { ProductListData } from '@/data/static/top-currency-data'
import { BlankData } from '@/data/static/top-currency-data'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { Copy } from '@/components/icons/copy'
import { Check } from '@/components/icons/check'
import { useState } from 'react'
import { Ethereum } from '../icons/ethereum'
import { Usdc } from '../icons/usdc'
import { Matic } from '../icons/matic'
import { Chainlink } from '../icons/chainlink'

function calculateTimeUnit(value: any) {
  if (value > 2628288) {
    return `${Math.round(value / 2628288)} Month(s)`
  } else if (value > 86400365) {
    return `${Math.round(value / 86400365)} Year(s)`
  } else if (value == undefined) {
    return ''
  } else {
    return `${Math.round(value / 86400)} Day(s)`
  }
}

export const CURRENCIES = {
  WETH: {
    id: 1,
    name: 'Wrapped Ethereum',
    value: 'WETH',
    icon: <Ethereum height={12} />,
  },
  USDC: {
    id: 2,
    name: 'USDC',
    value: 'USDC',
    icon: <Usdc height={12} />,
  },
  WMATIC: {
    id: 3,
    name: 'Wrapped Matic',
    value: 'WMATIC',
    icon: <Matic height={12} />,
  },
  LINK: {
    id: 4,
    name: 'Link',
    value: 'LINK',
    icon: <Chainlink height={12} />,
  },
}

const COLUMNS = [
  {
    Header: 'Name',
    accessor: 'name',
    // @ts-ignore
    Cell: ({ cell: { value } }) => (
      // <div className="ltr:text-right rtl:text-left">{value}</div>
      <div className="mb-5 grid grid-cols-3 gap-4 text-sm text-gray-900 last:mb-0 dark:text-white">
        <span className="whitespace-nowrap text-xs font-medium capitalize">
          {value}
        </span>
      </div>
    ),
    minWidth: 140,
    maxWidth: 260,
  },
  {
    Header: () => (
      <div className="ltr:ml-auto ltr:text-right rtl:mr-auto rtl:text-left">
        Interval
      </div>
    ),
    accessor: 'recurring.interval',
    // @ts-ignore
    Cell: ({ cell: { value } }) => (
      <div className="ltr:text-right rtl:text-left">
        {calculateTimeUnit(value)}
      </div>
    ),
    minWidth: 100,
    maxWidth: 140,
  },
  {
    Header: () => (
      <div className="ltr:ml-auto ltr:text-right rtl:mr-auto rtl:text-left">
        Price
      </div>
    ),
    accessor: 'price',
    // @ts-ignore
    Cell: ({ cell: props }) => (
      <div className="flex items-center justify-end ltr:text-right rtl:text-left">
        {props.row.original.price && (
          <div className="mr-[5px]">
            {' '}
            {CURRENCIES[props?.row?.original?.currency?.detail]?.icon}{' '}
          </div>
        )}
        {props.row.original.price &&
          `${props.row.original.price} ${props?.row?.original?.currency?.detail}`}
      </div>
    ),
    minWidth: 100,
    maxWidth: 140,
  },
  {
    Header: () => (
      <div className="ltr:ml-auto ltr:text-right rtl:mr-auto rtl:text-left">
        Subscribers
      </div>
    ),
    accessor: 'subscriptionCount',
    // @ts-ignore
    Cell: ({ cell: { value } }) => (
      <div className="ltr:text-right rtl:text-left">{value}</div>
    ),
    minWidth: 100,
    maxWidth: 140,
  },
  {
    Header: () => (
      <div className="ltr:ml-auto ltr:text-right rtl:mr-auto rtl:text-left">
        Checkout
      </div>
    ),
    accessor: 'checkoutId',
    // @ts-ignore
    Cell: ({ cell: { value } }) => (
      <div>
        <a
          target="_blank"
          href={`https://pay.rivel.io/?p=${value}`}
          rel="noopener noreferrer"
        >
          <div className="text-blue-500 ltr:text-right rtl:text-left">
            {value}
          </div>
        </a>
      </div>
    ),
  },
  // {
  //   Header: () => (
  //     <div className="ltr:ml-auto ltr:text-right rtl:mr-auto rtl:text-left">
  //       Revenue
  //     </div>
  //   ),
  //   accessor: 'revenue',
  //   // @ts-ignore
  //   Cell: ({ cell: { value } }) => (
  //     <div className="ltr:text-right rtl:text-left">${value}</div>
  //   ),
  //   minWidth: 100,
  //   maxWidth: 140,
  // },
  // {
  //   Header: () => (
  //     <div className="ltr:ml-auto ltr:text-right rtl:mr-auto rtl:text-left">
  //       7D Chart
  //     </div>
  //   ),
  //   accessor: 'sales',
  //   // @ts-ignore
  //   Cell: ({ cell: { value } }) => (
  //     <div className="h-10 w-full">
  //       <ResponsiveContainer width="100%" height="100%">
  //         <AreaChart data={value}>
  //           <defs>
  //             <linearGradient
  //               id="liquidity-gradient"
  //               x1="0"
  //               y1="0"
  //               x2="0"
  //               y2="1"
  //             >
  //               <stop offset="5%" stopColor="#bc9aff" stopOpacity={0.5} />
  //               <stop offset="100%" stopColor="#7645D9" stopOpacity={0} />
  //             </linearGradient>
  //           </defs>
  //           <Area
  //             type="natural"
  //             dataKey="value"
  //             stroke="#7645D9"
  //             strokeWidth={1.5}
  //             fill="url(#liquidity-gradient)"
  //             dot={false}
  //           />
  //         </AreaChart>
  //       </ResponsiveContainer>
  //     </div>
  //   ),
  //   minWidth: 200,
  //   maxWidth: 300,
  // },
]

export default function ProductsList(products: any) {
  const isMounted = useIsMounted()
  const breakpoint = useBreakpoint()
  let data
  if (products == null || products == undefined) {
    data = BlankData
  } else {
    console.log(JSON.parse(JSON.stringify(products)))
    console.log(ProductListData)
    data = products.results
  }

  const columns = COLUMNS

  const {
    getTableProps,
    getTableBodyProps,
    state,
    headerGroups,
    page,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useSortBy,
    useResizeColumns,
    useFlexLayout,
    usePagination,
  )

  const { pageIndex } = state

  return (
    <div className="">
      <div className="rounded-tl-lg rounded-tr-lg bg-white px-4 pt-6 dark:bg-light-dark md:px-8 md:pt-8"></div>
      <div className="-mx-0.5">
        <Scrollbar style={{ width: '100%' }}>
          <div className="px-0.5">
            <table
              {...getTableProps()}
              className="transaction-table w-full border-separate border-0"
            >
              <thead className="text-sm text-gray-500 dark:text-gray-300">
                {headerGroups.map((headerGroup, idx) => (
                  <tr {...headerGroup.getHeaderGroupProps()} key={idx}>
                    {headerGroup.headers.map((column, idx) => (
                      <th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps(),
                        )}
                        key={idx}
                        className="group bg-white px-2 py-5 font-normal first:rounded-bl-lg last:rounded-br-lg ltr:first:pl-8 ltr:last:pr-8 rtl:first:pr-8 rtl:last:pl-8 dark:bg-light-dark md:px-4"
                      >
                        <div className="flex items-center">
                          {column.render('Header')}
                          {column.canResize && (
                            <div
                              {...column.getResizerProps()}
                              className={`resizer ${
                                column.isResizing ? 'isResizing' : ''
                              }`}
                            />
                          )}
                          <span className="ltr:ml-1 rtl:mr-1">
                            {column.isSorted ? (
                              column.isSortedDesc ? (
                                <ChevronDown />
                              ) : (
                                <ChevronDown className="rotate-180" />
                              )
                            ) : (
                              <ChevronDown className="rotate-180 opacity-0 transition group-hover:opacity-50" />
                            )}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody
                {...getTableBodyProps()}
                className="text-xs font-medium text-gray-900 dark:text-white 3xl:text-sm"
              >
                {page.map((row, idx) => {
                  prepareRow(row)
                  return (
                    <tr
                      {...row.getRowProps()}
                      key={idx}
                      className="mb-3 items-center rounded-lg bg-white uppercase shadow-card last:mb-0 dark:bg-light-dark"
                    >
                      {row.cells.map((cell, idx) => {
                        return (
                          <td
                            {...cell.getCellProps()}
                            key={idx}
                            className="px-2 py-4 tracking-[1px] ltr:first:pl-4 ltr:last:pr-4 rtl:first:pr-8 rtl:last:pl-8 md:px-4 md:py-6 md:ltr:first:pl-8 md:ltr:last:pr-8 3xl:py-5"
                          >
                            {cell.render('Cell')}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Scrollbar>
      </div>
    </div>
  )
}
