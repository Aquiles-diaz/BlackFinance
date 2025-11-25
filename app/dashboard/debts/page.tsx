'use client'

import { useState } from 'react'
import { Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useDebtsStore } from '@/store/use-debts-store'
import { formatCurrency, formatDateInput } from '@/lib/utils'
import { calculateDebtProgress } from '@/lib/calculations'
import { motion } from 'framer-motion'

export default function DebtsPage() {
    const debts = useDebtsStore((state) => state.debts)
    const addDebt = useDebtsStore((state) => state.addDebt)
    const addPayment = useDebtsStore((state) => state.addPayment)

    const [isOpen, setIsOpen] = useState(false)
    const [paymentOpen, setPaymentOpen] = useState(false)
    const [selectedDebtId, setSelectedDebtId] = useState('')
    const [paymentAmount, setPaymentAmount] = useState('')
    const [formData, setFormData] = useState(() => ({
        name: '',
        totalAmount: '',
        paidAmount: '',
        interestRate: '',
        monthlyPayment: '',
        startDate: formatDateInput(new Date()),
        endDate: formatDateInput(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
    }))

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        addDebt({
            name: formData.name,
            totalAmount: parseFloat(formData.totalAmount),
            paidAmount: parseFloat(formData.paidAmount) || 0,
            interestRate: parseFloat(formData.interestRate),
            monthlyPayment: parseFloat(formData.monthlyPayment),
            startDate: formData.startDate,
            endDate: formData.endDate,
            status: 'active',
        })
        setIsOpen(false)
    }

    const handlePayment = () => {
        if (selectedDebtId && paymentAmount) {
            addPayment(selectedDebtId, parseFloat(paymentAmount))
            setPaymentOpen(false)
            setPaymentAmount('')
            setSelectedDebtId('')
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid': return <CheckCircle className="w-5 h-5 text-success" />
            case 'overdue': return <AlertCircle className="w-5 h-5 text-destructive" />
            default: return <Clock className="w-5 h-5 text-warning" />
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Deudas</h1>
                    <p className="text-muted-foreground mt-2">Gestiona tus deudas y pagos</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Deuda
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nueva Deuda</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Monto Total</Label>
                                    <Input type="number" value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Monto Pagado</Label>
                                    <Input type="number" value={formData.paidAmount} onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Tasa de Interés (%)</Label>
                                    <Input type="number" value={formData.interestRate} onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Pago Mensual</Label>
                                    <Input type="number" value={formData.monthlyPayment} onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })} required />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Fecha Inicio</Label>
                                    <Input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Fecha Fin</Label>
                                    <Input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
                                </div>
                            </div>
                            <Button type="submit" className="w-full">Crear</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6">
                {debts.map((debt, index) => {
                    const { percentage, remaining, monthsLeft } = calculateDebtProgress(debt)

                    return (
                        <motion.div
                            key={debt.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-6 rounded-2xl"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-start gap-3">
                                    {getStatusIcon(debt.status)}
                                    <div>
                                        <h3 className="font-semibold text-lg">{debt.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {formatCurrency(debt.paidAmount)} de {formatCurrency(debt.totalAmount)}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant={debt.status === 'paid' ? 'success' : debt.status === 'overdue' ? 'destructive' : 'warning'}>
                                    {debt.status === 'paid' ? 'Pagada' : debt.status === 'overdue' ? 'Vencida' : 'Activa'}
                                </Badge>
                            </div>

                            <Progress value={percentage} className="mb-4" />

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-muted-foreground">Restante</p>
                                    <p className="font-semibold">{formatCurrency(remaining)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Pago Mensual</p>
                                    <p className="font-semibold">{formatCurrency(debt.monthlyPayment)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Meses Restantes</p>
                                    <p className="font-semibold">{monthsLeft}</p>
                                </div>
                            </div>

                            {debt.status !== 'paid' && (
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        setSelectedDebtId(debt.id)
                                        setPaymentOpen(true)
                                    }}
                                >
                                    Registrar Pago
                                </Button>
                            )}
                        </motion.div>
                    )
                })}
                {debts.length === 0 && (
                    <div className="glass-card p-12 rounded-2xl text-center">
                        <p className="text-muted-foreground">No hay deudas registradas</p>
                    </div>
                )}
            </div>

            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Registrar Pago</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Monto del Pago</Label>
                            <Input
                                type="number"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={handlePayment} className="flex-1">Registrar</Button>
                            <Button variant="outline" onClick={() => setPaymentOpen(false)}>Cancelar</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
