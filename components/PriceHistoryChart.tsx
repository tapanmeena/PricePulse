'use client'

import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts'
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

interface PriceHistoryPoint {
  date: string
  price: number
}

interface PriceHistoryChartProps {
  data: PriceHistoryPoint[]
  currency: string
}

const chartConfig = {
  price: {
    label: 'Price',
    color: 'hsl(var(--chart-1))',
  },
  lowest: {
    label: 'Lowest',
    color: 'hsl(var(--chart-2))',
  },
  highest: {
    label: 'Highest',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig

type TooltipFormatter = NonNullable<TooltipProps<ValueType, NameType>['formatter']>

export default function PriceHistoryChart({ data, currency }: PriceHistoryChartProps) {
  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    []
  )

  const formattedData = useMemo(
    () =>
      data.map((entry) => {
        const date = new Date(entry.date)
        return {
          label: date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          tooltipLabel: date.toLocaleDateString('en-IN', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
          price: entry.price,
        }
      }),
    [data]
  )

  const tooltipFormatter: TooltipFormatter = (value, _name, item) => {
    const numericValue = typeof value === 'number' ? value : Number(value)

    if (Number.isNaN(numericValue)) {
      return value
    }

    const payload = item && 'payload' in item ? ((item.payload as (typeof formattedData)[number]) ?? undefined) : undefined

    return [
      (
        <span key="price-value" className="font-medium text-foreground">
          {currency} {numberFormatter.format(numericValue)}
        </span>
      ),
      payload?.tooltipLabel,
    ]
  }

  const priceValues = formattedData.map((entry) => entry.price)
  const lowestPrice = priceValues.length ? Math.min(...priceValues) : null
  const highestPrice = priceValues.length ? Math.max(...priceValues) : null
  const isFlatSeries =
    typeof lowestPrice === 'number' && typeof highestPrice === 'number' && lowestPrice === highestPrice

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart data={formattedData} margin={{ left: 12, right: 12, top: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="chart-price" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stopColor="var(--color-price)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--color-price)" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="4 4" />
        <XAxis dataKey="label" tickLine={false} axisLine stroke="hsl(var(--muted-foreground))" tickMargin={8} />
        <YAxis
          width={64}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => numberFormatter.format(Number(value))}
        />
        <ChartTooltip
          cursor={{ strokeDasharray: '4 4' }}
          content={
            <ChartTooltipContent
              indicator="line"
              labelKey="tooltipLabel"
              formatter={tooltipFormatter}
            />
          }
        />
        {isFlatSeries ? (
          typeof lowestPrice === 'number' && (
            <ReferenceLine
              y={lowestPrice}
              stroke="var(--color-price)"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: 'Price',
                position: 'insideLeft',
                style: {
                  fill: 'var(--color-price)',
                  fontSize: 11,
                  fontWeight: 600,
                },
              }}
            />
          )
        ) : (
          <>
            {typeof lowestPrice === 'number' && (
              <ReferenceLine
                y={lowestPrice}
                stroke="var(--color-lowest)"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: 'Lowest',
                  position: 'insideLeft',
                  style: {
                    fill: 'var(--color-lowest)',
                    fontSize: 11,
                    fontWeight: 600,
                  },
                }}
              />
            )}
            {typeof highestPrice === 'number' && (
              <ReferenceLine
                y={highestPrice}
                stroke="var(--color-highest)"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{
                  value: 'Highest',
                  position: 'insideLeft',
                  style: {
                    fill: 'var(--color-highest)',
                    fontSize: 11,
                    fontWeight: 600,
                  },
                }}
              />
            )}
          </>
        )}
        <Area
          type="monotone"
          dataKey="price"
          stroke="var(--color-price)"
          strokeWidth={2}
          fill="url(#chart-price)"
          fillOpacity={1}
          activeDot={{ r: 4 }}
        />
      </AreaChart>
    </ChartContainer>
  )
}
