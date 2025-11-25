'use client'

'use client'

import { useEffect } from 'react'
import { ModernNav } from '@/components/dashboard/modern-nav'
import { useTransactionsStore } from '@/store/use-transactions-store'
import { useBudgetStore } from '@/store/use-budget-store'
import { useSavingsStore } from '@/store/use-savings-store'
import { useDebtsStore } from '@/store/use-debts-store'
import { useHolidayStore } from '@/store/use-holiday-store'
import { ToastProvider } from '@/components/ui/use-toast'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const loadTransactions = useTransactionsStore((state) => state.loadTransactions)
    const loadBudgets = useBudgetStore((state) => state.loadBudgets)
    const loadGoals = useSavingsStore((state) => state.loadGoals)
    const loadDebts = useDebtsStore((state) => state.loadDebts)
    const loadHolidayData = useHolidayStore((state) => state.loadHolidayData)

    useEffect(() => {
        loadTransactions()
        loadBudgets()
        loadGoals()
        loadDebts()
        loadHolidayData()
    }, [loadTransactions, loadBudgets, loadGoals, loadDebts, loadHolidayData])

    return (
        <ToastProvider>
            <div className="min-h-screen flex flex-col bg-background">
                {/* Navegación Moderna - Top/Bottom según dispositivo */}
                <ModernNav />

                {/* Área principal de contenido - Espacioso y sin restricciones */}
                <main className="flex-1 overflow-y-auto bg-muted/5 scroll-smooth pb-28 md:pb-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </ToastProvider>
    )
}