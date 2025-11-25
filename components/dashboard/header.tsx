'use client'

import { Bell, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentPeriod } from '@/lib/utils'

export function DashboardHeader() {
    const { monthName, year } = getCurrentPeriod()

    return (
        <header className="sticky top-0 z-30 glass-card border-b border-border p-4 lg:p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">¡Bienvenido!</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {monthName} {year}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full"></span>
                    </Button>

                    <Button variant="ghost" size="icon">
                        <Settings className="w-5 h-5" />
                    </Button>

                    <Button variant="glass" size="icon">
                        <User className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </header>
    )
}
