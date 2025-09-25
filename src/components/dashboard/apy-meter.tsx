'use client'

import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { tiers } from "@/lib/constants";

const chartConfig = {
  apy: {
    label: "APY",
  },
  platinum: {
    label: "Platinum",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type ApyMeterProps = {
  apy: number;
};

export default function ApyMeter({ apy }: ApyMeterProps) {
  const chartData = [{ month: "1", apy: Math.round(apy) }];
  const platinumTier = tiers.find(tier => tier.name === 'PLATINUM');
  const maxApy = platinumTier ? Math.round((Math.pow(1 + platinumTier.dailyReturn, 365) - 1) * 100) : 0;


  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[200px]"
    >
      <>
        <RadialBarChart
          data={chartData}
          endAngle={0}
          innerRadius="80%"
          outerRadius="140%"
          barSize={20}
          startAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, maxApy]}
            dataKey="apy"
            tick={false}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel nameKey="name" />}
          />
          <RadialBar
            background={{ fill: "hsl(var(--muted))" }}
            dataKey="apy"
            cornerRadius={10}
            fill="hsl(var(--accent))"
          />
        </RadialBarChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-5xl font-bold font-headline text-accent">
              {Math.round(apy)}%
          </p>
          <p className="text-sm text-muted-foreground">APY</p>
        </div>
      </>
    </ChartContainer>
  )
}
