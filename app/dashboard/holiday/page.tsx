'use client'

import { useState } from 'react'
import { Plus, Gift, DollarSign, ShoppingBag, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useHolidayStore } from '@/store/use-holiday-store'
import { formatCurrency } from '@/lib/utils'
import { motion } from 'framer-motion'

export default function HolidayPage() {
    const aguinaldo = useHolidayStore((state) => state.aguinaldoProjection)
    const setAguinaldo = useHolidayStore((state) => state.setAguinaldoProjection)
    const holidayBudgets = useHolidayStore((state) => state.holidayBudgets)
    const addHolidayBudget = useHolidayStore((state) => state.addHolidayBudget)
    const addHolidayItem = useHolidayStore((state) => state.addHolidayItem)
    const markItemPurchased = useHolidayStore((state) => state.markItemPurchased)

    const [aguinaldoOpen, setAguinaldoOpen] = useState(false)
    const [budgetOpen, setBudgetOpen] = useState(false)
    const [itemOpen, setItemOpen] = useState(false)
    const [selectedBudgetId, setSelectedBudgetId] = useState('')

    const [aguinaldoForm, setAguinaldoForm] = useState({
        grossAmount: '',
        taxRate: '13',
    })

    const [budgetForm, setBudgetForm] = useState({
        name: 'Navidad 2025',
        budgetAmount: '',
    })

    const [itemForm, setItemForm] = useState({
        name: '',
        estimatedCost: '',
        category: 'regalos',
    })

    const handleAguinaldoSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        const gross = parseFloat(aguinaldoForm.grossAmount)
        const tax = parseFloat(aguinaldoForm.taxRate) / 100
        const net = gross * (1 - tax)

        setAguinaldo({
            grossAmount: gross,
            taxRate: parseFloat(aguinaldoForm.taxRate),
            netAmount: net,
            expectedDate: '2025-12-15',
            allocations: {
                savings: net * 0.3,
                debts: net * 0.2,
                shopping: net * 0.3,
                emergency: net * 0.1,
                other: net * 0.1,
            },
        })
        setAguinaldoOpen(false)
    }

    const handleBudgetSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        addHolidayBudget({
            name: budgetForm.name,
            budgetAmount: parseFloat(budgetForm.budgetAmount),
            spentAmount: 0,
            items: [],
            year: new Date().getFullYear(),
        })
        setBudgetOpen(false)
    }

    const handleItemSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedBudgetId) {
            addHolidayItem(selectedBudgetId, {
                name: itemForm.name,
                estimatedCost: parseFloat(itemForm.estimatedCost),
                actualCost: 0,
                purchased: false,
                category: itemForm.category,
            })
            setItemOpen(false)
            setItemForm({ name: '', estimatedCost: '', category: 'regalos' })
        }
    }

    const currentBudget = holidayBudgets[0]

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <Gift className="w-8 h-8 text-primary" />
                        Aguinaldo & Navidad
                    </h1>
                    <p className="text-muted-foreground mt-2">Planifica tu aguinaldo y gastos navideños</p>
                </div>
            </div>

            <Tabs defaultValue="aguinaldo" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="aguinaldo">Aguinaldo</TabsTrigger>
                    <TabsTrigger value="budget">Presupuesto Navideño</TabsTrigger>
                    <TabsTrigger value="shopping">Lista de Compras</TabsTrigger>
                </TabsList>

                <TabsContent value="aguinaldo" className="space-y-6">
                    {!aguinaldo ? (
                        <div className="glass-card p-12 rounded-2xl text-center">
                            <Gift className="w-16 h-16 mx-auto text-primary mb-4" />
                            <p className="text-muted-foreground mb-4">Configura tu proyección de aguinaldo</p>
                            <Dialog open={aguinaldoOpen} onOpenChange={setAguinaldoOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Configurar Aguinaldo
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Proyección de Aguinaldo</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleAguinaldoSubmit} className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <Label>Monto Bruto</Label>
                                            <Input type="number" value={aguinaldoForm.grossAmount} onChange={(e) => setAguinaldoForm({ ...aguinaldoForm, grossAmount: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Tasa de Impuesto (%)</Label>
                                            <Input type="number" value={aguinaldoForm.taxRate} onChange={(e) => setAguinaldoForm({ ...aguinaldoForm, taxRate: e.target.value })} required />
                                        </div>
                                        <Button type="submit" className="w-full">Calcular</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl">
                                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-success" />
                                    Resumen de Aguinaldo
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Monto Bruto</span>
                                        <span className="font-semibold">{formatCurrency(aguinaldo.grossAmount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Impuestos ({aguinaldo.taxRate}%)</span>
                                        <span className="font-semibold text-destructive">
                                            -{formatCurrency(aguinaldo.grossAmount - aguinaldo.netAmount)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-border">
                                        <span className="font-semibold">Monto Neto</span>
                                        <span className="font-bold text-success text-xl">{formatCurrency(aguinaldo.netAmount)}</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl">
                                <h3 className="font-semibold text-lg mb-4">Asignación Sugerida</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Ahorros (30%)</span>
                                        <span className="font-semibold">{formatCurrency(aguinaldo.allocations.savings)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Compras/Regalos (30%)</span>
                                        <span className="font-semibold">{formatCurrency(aguinaldo.allocations.shopping)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Deudas (20%)</span>
                                        <span className="font-semibold">{formatCurrency(aguinaldo.allocations.debts)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Fondo Emergencia (10%)</span>
                                        <span className="font-semibold">{formatCurrency(aguinaldo.allocations.emergency)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Otros (10%)</span>
                                        <span className="font-semibold">{formatCurrency(aguinaldo.allocations.other)}</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="budget" className="space-y-6">
                    {!currentBudget ? (
                        <div className="glass-card p-12 rounded-2xl text-center">
                            <ShoppingBag className="w-16 h-16 mx-auto text-primary mb-4" />
                            <p className="text-muted-foreground mb-4">Crea tu presupuesto navideño</p>
                            <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
                                <DialogTrigger asChild>
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Crear Presupuesto
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Nuevo Presupuesto Navideño</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleBudgetSubmit} className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <Label>Nombre</Label>
                                            <Input value={budgetForm.name} onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Presupuesto Total</Label>
                                            <Input type="number" value={budgetForm.budgetAmount} onChange={(e) => setBudgetForm({ ...budgetForm, budgetAmount: e.target.value })} required />
                                        </div>
                                        <Button type="submit" className="w-full">Crear</Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : (
                        <div className="glass-card p-6 rounded-2xl">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-semibold text-lg">{currentBudget.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {formatCurrency(currentBudget.spentAmount)} de {formatCurrency(currentBudget.budgetAmount)}
                                    </p>
                                </div>
                                <Badge variant={currentBudget.spentAmount > currentBudget.budgetAmount ? 'destructive' : 'success'}>
                                    {((currentBudget.spentAmount / currentBudget.budgetAmount) * 100).toFixed(0)}% usado
                                </Badge>
                            </div>
                            <Progress value={(currentBudget.spentAmount / currentBudget.budgetAmount) * 100} className="mb-6" />
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="shopping" className="space-y-6">
                    {currentBudget && (
                        <>
                            <Button onClick={() => {
                                setSelectedBudgetId(currentBudget.id)
                                setItemOpen(true)
                            }}>
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar Item
                            </Button>

                            <div className="space-y-3">
                                {currentBudget.items.map((item, index) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="glass-card p-4 rounded-xl flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${item.purchased ? 'bg-success border-success' : 'border-muted-foreground'}`}>
                                                {item.purchased && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <div>
                                                <p className={`font-medium ${item.purchased ? 'line-through text-muted-foreground' : ''}`}>
                                                    {item.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{item.category}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold">
                                                {formatCurrency(item.purchased ? item.actualCost : item.estimatedCost)}
                                            </span>
                                            {!item.purchased && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        const cost = prompt('Costo real:')
                                                        if (cost) markItemPurchased(currentBudget.id, item.id, parseFloat(cost))
                                                    }}
                                                >
                                                    Marcar como comprado
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                                {currentBudget.items.length === 0 && (
                                    <div className="glass-card p-12 rounded-2xl text-center">
                                        <p className="text-muted-foreground">No hay items en la lista</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </TabsContent>
            </Tabs>

            <Dialog open={itemOpen} onOpenChange={setItemOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nuevo Item</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleItemSubmit} className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Costo Estimado</Label>
                            <Input type="number" value={itemForm.estimatedCost} onChange={(e) => setItemForm({ ...itemForm, estimatedCost: e.target.value })} required />
                        </div>
                        <div className="space-y-2">
                            <Label>Categoría</Label>
                            <Input value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} />
                        </div>
                        <Button type="submit" className="w-full">Agregar</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
