'use client'

import { useEffect } from 'react'
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { KPICard } from '@/components/dashboard/kpi-card'
import { IncomeExpenseChart } from '@/components/charts/income-expense-chart'
import { CategoryDistributionChart } from '@/components/charts/category-distribution-chart'
import { useTransactionsStore } from '@/store/use-transactions-store'
import { getCurrentPeriod } from '@/lib/utils'
import {
    calculateTotalByType,
    calculateMonthlyBalance,
    groupTransactionsByCategory,
    getMonthlyTimeSeries,
} from '@/lib/calculations'

export default function DashboardPage() {
    const transactions = useTransactionsStore((state) => state.transactions)
    const { month, year } = getCurrentPeriod()

    const { income, expenses, balance } = calculateMonthlyBalance(transactions, month, year)
    const categoryData = groupTransactionsByCategory(transactions, month, year)
    const timeSeriesData = getMonthlyTimeSeries(transactions, 6)

    const expenseCategories = categoryData.filter((cat) =>
        transactions.find((t) => t.category === cat.category && t.type === 'expense')
    )

    return (
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-base md:text-lg text-muted-foreground">
                    Vista general de tus finanzas personales
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <KPICard
                    title="Total Ingresos"
                    value={income}
                    icon={TrendingUp}
                    delay={0}
                />
                <KPICard
                    title="Total Gastos"
                    value={expenses}
                    icon={TrendingDown}
                    delay={0.1}
                />
                <KPICard
                    title="Balance del Mes"
                    value={balance}
                    icon={DollarSign}
                    delay={0.2}
                    className={`sm:col-span-2 lg:col-span-1 ${balance >= 0 ? 'border-success/20' : 'border-destructive/20'}`}
                />
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 xl:grid-cols-2">
                <div className="p-2 bg-card/50 rounded-2xl border shadow-sm">
                    <IncomeExpenseChart data={timeSeriesData} />
                </div>

                {expenseCategories.length > 0 && (
                    <div className="p-2 bg-card/50 rounded-2xl border shadow-sm">
                        <CategoryDistributionChart data={expenseCategories} />
                    </div>
                )}
            </div>

            {/* Quick Summary */}
            <div className="glass-card rounded-2xl border bg-card/50 p-6 md:p-8 shadow-sm">
                <h3 className="text-xl md:text-2xl font-semibold mb-6">Resumen Rápido</h3>

                <div className="grid gap-6 md:gap-8 grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <p className="text-xs md:text-sm font-medium text-muted-foreground">Total Transacciones</p>
                        <p className="text-2xl md:text-3xl font-bold tracking-tight">{transactions.length}</p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs md:text-sm font-medium text-muted-foreground">Promedio Ingresos</p>
                        <p className="text-2xl md:text-3xl font-bold tracking-tight">
                            ${income > 0 ? Math.round(income / timeSeriesData.length).toLocaleString() : 0}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs md:text-sm font-medium text-muted-foreground">Promedio Gastos</p>
                        <p className="text-2xl md:text-3xl font-bold tracking-tight">
                            ${expenses > 0 ? Math.round(expenses / timeSeriesData.length).toLocaleString() : 0}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs md:text-sm font-medium text-muted-foreground">Tasa de Ahorro</p>
                        <p className={`text-2xl md:text-3xl font-bold tracking-tight ${balance > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                            {income > 0 ? ((balance / income) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}