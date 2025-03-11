import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

type Step = {
  id: string
  label: string
}

type StepsProps = {
  steps: Step[]
  currentStep: string
  className?: string
}

export function Steps({ steps, currentStep, className }: StepsProps) {
  return (
    <div className={cn("grid grid-cols-4 gap-2 w-full", className)}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = steps.findIndex((s) => s.id === currentStep) > index

        return (
          <div key={step.id} className="flex flex-col items-center relative">
            {index > 0 && (
              <div
                className={cn(
                  "absolute top-3 h-0.5 w-full -left-1/2",
                  isCompleted ? "bg-primary" : "bg-gray-200",
                )}
              />
            )}

            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium z-10",
                isActive && "bg-primary text-primary-foreground",
                isCompleted
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-200 text-gray-600",
              )}
            >
              {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : index + 1}
            </div>

            <span
              className={cn(
                "text-sm font-medium mt-2 text-center",
                isActive && "text-primary",
                !isActive && !isCompleted && "text-gray-500",
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
