'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Receipt,
    PiggyBank,
    CreditCard,
    Target,
    Gift,
    Bell,
    User,
    Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { getCurrentPeriod } from '@/lib/utils'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transacciones', href: '/dashboard/transactions', icon: Receipt },
    { name: 'Presupuesto', href: '/dashboard/budget', icon: PiggyBank },
    { name: 'Aguinaldo', href: '/dashboard/holiday', icon: Gift },
    { name: 'Ahorro', href: '/dashboard/savings', icon: Target },
    { name: 'Deudas', href: '/dashboard/debts', icon: CreditCard },
]

export function ModernNav() {
    const pathname = usePathname()
    const { monthName, year } = getCurrentPeriod()

    return (
        <>
            {/* Desktop Navigation - Top Bar */}
            <nav className="hidden md:block sticky top-0 z-50 glass-card border-b border-border/50 backdrop-blur-xl">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo y Periodo */}
                        <div className="flex items-center gap-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gradient">BlackFinance</h1>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {monthName} {year}
                                </p>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="flex items-center gap-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                const Icon = item.icon

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300',
                                            isActive
                                                ? 'text-primary'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                                        )}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="hidden lg:inline">{item.name}</span>

                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* User Actions */}
                        <div className="flex items-center gap-2">
                            <button className="relative p-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full"></span>
                            </button>
                            <Link href="/dashboard/settings" className="p-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                                <Settings className="w-5 h-5" />
                            </Link>
                            <button className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                                <User className="w-5 h-5 text-primary" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation - Bottom Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 backdrop-blur-xl pb-safe">
                <div className="grid grid-cols-3 gap-1 p-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center justify-center gap-1 p-3 rounded-xl transition-all duration-300',
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
                                )}
                            >
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className="relative"
                                >
                                    <Icon className={cn(
                                        "w-6 h-6 transition-all",
                                        isActive && "drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                                    )} />
                                </motion.div>
                                <span className="text-[10px] font-medium leading-none">
                                    {item.name}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </nav>

            {/* Mobile Header - Compact */}
            <div className="md:hidden sticky top-0 z-40 glass-card border-b border-border/50 backdrop-blur-xl">
                <div className="flex items-center justify-between px-4 py-3">
                    <div>
                        <h1 className="text-lg font-bold text-gradient">BlackFinance</h1>
                        <p className="text-[10px] text-muted-foreground">
                            {monthName} {year}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="relative p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent rounded-full"></span>
                        </button>
                        <button className="p-2 rounded-lg bg-primary/10">
                            <User className="w-4 h-4 text-primary" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
