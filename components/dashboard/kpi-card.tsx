'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface KPICardProps {
    title: string
    value: number
    icon: LucideIcon
    trend?: {
        value: number
        isPositive: boolean
    }
    delay?: number
    currency?: boolean
    className?: string
}

export function KPICard({
    title,
    value,
    icon: Icon,
    trend,
    delay = 0,
    currency = true,
    className,
}: KPICardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
        >
            <Card className={cn('group hover:scale-[1.02] transition-transform duration-300', className)}>
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                            <p className="text-sm text-muted-foreground font-medium">{title}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-bold tracking-tight">
                                    {currency ? formatCurrency(value) : value.toLocaleString()}
                                </p>
                                {trend && (
                                    <span
                                        className={cn(
                                            'text-sm font-medium',
                                            trend.isPositive ? 'text-success' : 'text-destructive'
                                        )}
                                    >
                                        {trend.isPositive ? '+' : '-'}
                                        {Math.abs(trend.value)}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                            <Icon className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
