"use client"

import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { CATEGORY_COLORS } from "@/lib/types"

interface CategoryChartProps {
  data: { category: string; amount: number; count: number }[]
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; name: string; payload: { count: number } }[] }) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="glass-panel rounded-lg p-3 border border-border">
        <p className="font-semibold text-foreground">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
          }).format(data.value)}/mo
        </p>
        <p className="text-xs text-muted-foreground">{data.payload.count} subscriptions</p>
      </div>
    )
  }
  return null
}

export function CategoryChart({ data }: CategoryChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0)

  const chartData = data.map(item => ({
    name: item.category,
    value: item.amount,
    count: item.count,
    color: CATEGORY_COLORS[item.category] || CATEGORY_COLORS['Other']
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl p-6"
    >
      <h3 className="font-semibold text-foreground mb-4">Spending by Category</h3>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Chart */}
        <div className="w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 w-full">
          {chartData.map((item, index) => {
            const percentage = totalAmount > 0 ? Math.round((item.value / totalAmount) * 100) : 0
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(item.value)}
                  </span>
                  <span className="text-xs text-muted-foreground w-10 text-right">
                    {percentage}%
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
