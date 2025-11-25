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
    Menu,
    X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Transacciones', href: '/dashboard/transactions', icon: Receipt },
    { name: 'Presupuesto', href: '/dashboard/budget', icon: PiggyBank },
    { name: 'Aguinaldo & Navidad', href: '/dashboard/holiday', icon: Gift },
    { name: 'Ahorro', href: '/dashboard/savings', icon: Target },
    { name: 'Deudas', href: '/dashboard/debts', icon: CreditCard },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Mobile menu button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg glass-card"
            >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar */}
            <AnimatePresence>
                {(isOpen || true) && (
                    <motion.aside
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                            'fixed lg:sticky top-0 left-0 z-40 h-screen w-64 glass-card border-r border-border',
                            'lg:translate-x-0',
                            isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                        )}
                    >
                        <div className="flex flex-col h-full p-6">
                            {/* Logo */}
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-gradient">
                                    BlackFinance
                                </h1>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Dashboard Personal
                                </p>
                            </div>

                            {/* Navigation */}
                            <nav className="flex-1 space-y-2">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href
                                    const Icon = item.icon

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={cn(
                                                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                                                isActive
                                                    ? 'bg-primary text-primary-foreground shadow-lg glow-hover'
                                                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                                            )}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.name}
                                        </Link>
                                    )
                                })}
                            </nav>

                            {/* Footer */}
                            <div className="pt-6 border-t border-border">
                                <p className="text-xs text-muted-foreground text-center">
                                    © 2025 BlackFinance
                                </p>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
                />
            )}
        </>
    )
}
