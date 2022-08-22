import React from 'react'
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
import { useBreakpoint } from '@/lib/hooks/use-breakpoint'
import { useIsMounted } from '@/lib/hooks/use-is-mounted'
import { CustomerData } from '@/data/static/top-currency-data'
import { EllipseAddress } from '@/data/utils/helper'
import { BlankData } from '@/data/static/top-currency-data'

const COLUMNS = [
  {
    Header: 'Products',
    accessor: 'product.name',
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
        Wallet Address
      </div>
    ),
    accessor: 'subscriber',
    // @ts-ignore
    Cell: ({ cell: { value } }) => (
      <div className="ltr:text-right rtl:text-left">
        {EllipseAddress(value)}
      </div>
    ),
    minWidth: 100,
    maxWidth: 140,
  },
  {
    Header: () => (
      <div className="ltr:ml-auto ltr:text-right rtl:mr-auto rtl:text-left">
        Next Payment
      </div>
    ),
    accessor: 'nextPaymentAt',
    // @ts-ignore
    Cell: ({ cell: { value } }) => (
      <div className="ltr:text-right rtl:text-left">
        {value && new Date(value).toLocaleDateString()}
      </div>
    ),
    minWidth: 100,
    maxWidth: 140,
  },
  {
    Header: () => (
      <div className="ltr:ml-auto ltr:text-right rtl:mr-auto rtl:text-left">
        Status
      </div>
    ),
    accessor: 'status',
    // @ts-ignore
    Cell: ({ cell: { value } }) => (
      <div className="ltr:text-right rtl:text-left">{value}</div>
    ),
    minWidth: 100,
    maxWidth: 140,
  },
]

export default function CustomersList(subscriptionData: any) {
  const isMounted = useIsMounted()
  const breakpoint = useBreakpoint()

  let data
  if (subscriptionData == null || subscriptionData == undefined) {
    data = BlankData
  } else {
    data = subscriptionData.results
  }

  // const data = React.useMemo(() => CustomerData, [])
  // const columns = React.useMemo(() => COLUMNS, [])

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
      // @ts-ignore
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
