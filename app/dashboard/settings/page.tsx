'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useTransactionsStore } from '@/store/use-transactions-store'
import { useBudgetStore } from '@/store/use-budget-store'
import { useSavingsStore } from '@/store/use-savings-store'
import { useDebtsStore } from '@/store/use-debts-store'
import { useHolidayStore } from '@/store/use-holiday-store'
import { Storage, STORAGE_KEYS } from '@/lib/storage'

export default function SettingsPage() {
    const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [statusMessage, setStatusMessage] = useState('')

    const handleExport = () => {
        const data = {
            transactions: Storage.get(STORAGE_KEYS.TRANSACTIONS, []),
            budgets: Storage.get(STORAGE_KEYS.BUDGETS, []),
            savings: Storage.get(STORAGE_KEYS.SAVINGS, []),
            debts: Storage.get(STORAGE_KEYS.DEBTS, []),
            holiday: Storage.get(STORAGE_KEYS.HOLIDAY, null),
            exportDate: new Date().toISOString(),
            version: '1.0'
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `blackfinance-backup-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string
                const data = JSON.parse(content)

                // Validate basic structure
                if (!data.transactions && !data.budgets) {
                    throw new Error('Formato de archivo inválido')
                }

                // Restore data
                if (data.transactions) Storage.set(STORAGE_KEYS.TRANSACTIONS, data.transactions)
                if (data.budgets) Storage.set(STORAGE_KEYS.BUDGETS, data.budgets)
                if (data.savings) Storage.set(STORAGE_KEYS.SAVINGS, data.savings)
                if (data.debts) Storage.set(STORAGE_KEYS.DEBTS, data.debts)
                if (data.holiday) Storage.set(STORAGE_KEYS.HOLIDAY, data.holiday)

                // Reload stores
                useTransactionsStore.getState().loadTransactions()
                useBudgetStore.getState().loadBudgets()
                useSavingsStore.getState().loadGoals()
                useDebtsStore.getState().loadDebts()
                useHolidayStore.getState().loadHolidayData()

                setImportStatus('success')
                setStatusMessage('Datos restaurados correctamente')

                // Reset file input
                event.target.value = ''
            } catch (error) {
                console.error('Import error:', error)
                setImportStatus('error')
                setStatusMessage('Error al importar el archivo. Verifica que sea un backup válido.')
            }
        }
        reader.readAsText(file)
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Configuración</h1>
                <p className="text-muted-foreground">Administra tus datos y preferencias.</p>
            </div>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="h-5 w-5 text-primary" />
                        Copia de Seguridad
                    </CardTitle>
                    <CardDescription>
                        Exporta tus datos para no perderlos o impórtalos en otro dispositivo.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button onClick={handleExport} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                            <Download className="mr-2 h-4 w-4" />
                            Exportar Datos
                        </Button>

                        <div className="relative w-full sm:w-auto">
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleImport}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/10 text-primary">
                                <Upload className="mr-2 h-4 w-4" />
                                Importar Datos
                            </Button>
                        </div>
                    </div>

                    {importStatus === 'success' && (
                        <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-md">
                            <CheckCircle2 className="h-5 w-5" />
                            <p className="text-sm">{statusMessage}</p>
                        </div>
                    )}

                    {importStatus === 'error' && (
                        <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-md">
                            <AlertTriangle className="h-5 w-5" />
                            <p className="text-sm">{statusMessage}</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
