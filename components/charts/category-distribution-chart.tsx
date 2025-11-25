'use client'

import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { CATEGORY_LABELS, CATEGORY_COLORS, Category } from '@/types'

interface CategoryData {
    category: Category
    total: number
}

interface CategoryDistributionChartProps {
    data: CategoryData[]
}

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
    const chartData = data.map((item) => ({
        name: CATEGORY_LABELS[item.category],
        value: item.total,
        color: CATEGORY_COLORS[item.category],
    }))

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <Card>
                <CardHeader>
                    <CardTitle>Distribución por Categoría</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={130}
                                paddingAngle={2}
                                dataKey="value"
                                label={({ name, percent }) =>
                                    `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                                }
                                labelLine={{ stroke: '#a1a1aa' }}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(22, 22, 29, 0.95)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    backdropFilter: 'blur(20px)',
                                }}
                                formatter={(value: number) => formatCurrency(value)}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </motion.div>
    )
}
