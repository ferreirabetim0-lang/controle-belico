'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Step = {
  key: string
  name: string
  completed: boolean
  completedAt?: string
}

type Process = {
  id: string
  type: string
  status: string
  progress: number
  startedAt: string
  steps: Step[]
}

export function ProcessChecklist({ process }: { process: Process }) {
  const [steps, setSteps] = useState(process.steps)
  const [showAll, setShowAll] = useState(false)

  const completed = steps.filter((s) => s.completed).length
  const progress = Math.round((completed / steps.length) * 100)

  const visibleSteps = showAll ? steps : steps.slice(0, 10)

  function toggleStep(key: string) {
    setSteps((prev) =>
      prev.map((s) =>
        s.key === key
          ? { ...s, completed: !s.completed, completedAt: !s.completed ? new Date().toLocaleDateString('pt-BR') : undefined }
          : s
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="bg-gradient-to-r from-[#0B2545] to-[#134074] rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold">Processo {process.type}</h3>
            <p className="text-white/60 text-sm">Iniciado em {process.startedAt}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-extrabold text-[#3E92CC]">{progress}%</div>
            <div className="text-white/60 text-xs">{completed}/{steps.length} etapas</div>
          </div>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-[#3E92CC] to-[#00C853] h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/40 mt-2">
          <span>Início</span>
          <span>Conclusão</span>
        </div>
      </div>

      {/* Steps */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">Checklist do Processo</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-lg">
            {steps.filter((s) => !s.completed).length} pendentes
          </span>
        </div>

        <div className="divide-y divide-border">
          {visibleSteps.map((step, i) => (
            <div
              key={step.key}
              className={`flex items-center gap-4 px-5 py-4 transition-colors ${
                step.completed ? 'bg-[#00C853]/5' : 'hover:bg-muted/30'
              } cursor-pointer`}
              onClick={() => toggleStep(step.key)}
            >
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-[#00C853]" />
                ) : (
                  <Circle className="w-5 h-5 text-border" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm font-medium ${
                    step.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                  }`}
                >
                  {i + 1}. {step.name}
                </span>
              </div>
              {step.completed && step.completedAt && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {step.completedAt}
                </div>
              )}
              {!step.completed && (
                <span className="text-xs text-[#D50000] font-medium bg-[#D50000]/10 px-2 py-0.5 rounded-full flex-shrink-0">
                  Pendente
                </span>
              )}
            </div>
          ))}
        </div>

        {steps.length > 10 && (
          <div className="p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full text-sm gap-2"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? (
                <><ChevronUp className="w-4 h-4" /> Mostrar menos</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> Ver todas as {steps.length} etapas</>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Add new process */}
      <div className="flex gap-3">
        {['CR', 'CRAF', 'GT'].map((type) => (
          <Button key={type} variant="outline" size="sm" className="gap-2">
            + Iniciar {type}
          </Button>
        ))}
      </div>
    </div>
  )
}
