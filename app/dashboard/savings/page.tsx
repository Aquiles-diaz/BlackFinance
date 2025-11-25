'use client'

import { useState } from 'react'
import { Plus, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { useSavingsStore } from '@/store/use-savings-store'
import { formatCurrency, formatDateInput } from '@/lib/utils'
import { calculateSavingsProgress } from '@/lib/calculations'
import { motion } from 'framer-motion'

export default function SavingsPage() {
    const goals = useSavingsStore((state) => state.goals)
    const addGoal = useSavingsStore((state) => state.addGoal)
    const addToGoal = useSavingsStore((state) => state.addToGoal)

    const [isOpen, setIsOpen] = useState(false)
    const [contributionOpen, setContributionOpen] = useState(false)
    const [selectedGoalId, setSelectedGoalId] = useState<string>('')
    const [contribution, setContribution] = useState('')
    const [formData, setFormData] = useState(() => ({
        name: '',
        targetAmount: '',
        currentAmount: '',
        deadline: formatDateInput(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
        color: '#6366f1',
    }))

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        addGoal({
            name: formData.name,
            targetAmount: parseFloat(formData.targetAmount),
            currentAmount: parseFloat(formData.currentAmount) || 0,
            deadline: formData.deadline,
            color: formData.color,
        })
        setIsOpen(false)
        setFormData({ name: '', targetAmount: '', currentAmount: '', deadline: formatDateInput(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)), color: '#6366f1' })
    }

    const handleContribution = () => {
        if (selectedGoalId && contribution) {
            addToGoal(selectedGoalId, parseFloat(contribution))
            setContributionOpen(false)
            setContribution('')
            setSelectedGoalId('')
        }
    }

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Ahorros</h1>
                    <p className="text-muted-foreground mt-2">Gestiona tus metas de ahorro</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Nueva Meta
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Nueva Meta de Ahorro</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Monto Objetivo</Label>
                                <Input type="number" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Monto Actual</Label>
                                <Input type="number" value={formData.currentAmount} onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Fecha Límite</Label>
                                <Input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} required />
                            </div>
                            <Button type="submit" className="w-full">Crear</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal, index) => {
                    const { percentage, remaining, daysLeft } = calculateSavingsProgress(goal)

                    return (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-6 rounded-2xl"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-lg">{goal.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Meta: {formatCurrency(goal.targetAmount)}
                                    </p>
                                </div>
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Target className="w-5 h-5 text-primary" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground">Progreso</span>
                                        <span className="font-semibold">{percentage.toFixed(1)}%</span>
                                    </div>
                                    <Progress value={percentage} />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Ahorrado</p>
                                        <p className="font-semibold text-sm">{formatCurrency(goal.currentAmount)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Falta</p>
                                        <p className="font-semibold text-sm">{formatCurrency(remaining)}</p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-border">
                                    <p className="text-xs text-muted-foreground">
                                        {daysLeft > 0 ? `${daysLeft} días restantes` : 'Meta vencida'}
                                    </p>
                                </div>

                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => {
                                        setSelectedGoalId(goal.id)
                                        setContributionOpen(true)
                                    }}
                                >
                                    Agregar Ahorro
                                </Button>
                            </div>
                        </motion.div>
                    )
                })}
                {goals.length === 0 && (
                    <div className="col-span-full glass-card p-12 rounded-2xl text-center">
                        <p className="text-muted-foreground">No hay metas de ahorro definidas</p>
                    </div>
                )}
            </div>

            <Dialog open={contributionOpen} onOpenChange={setContributionOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Agregar Ahorro</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Monto</Label>
                            <Input
                                type="number"
                                value={contribution}
                                onChange={(e) => setContribution(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={handleContribution} className="flex-1">Agregar</Button>
                            <Button variant="outline" onClick={() => setContributionOpen(false)}>Cancelar</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
