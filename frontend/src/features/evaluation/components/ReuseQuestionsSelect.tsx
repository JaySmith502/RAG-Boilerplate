import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EvaluationStatusResponse } from '@/types/api'

interface ReuseQuestionsSelectProps {
  value: string | undefined
  onChange: (value: string | undefined) => void
  evaluations: EvaluationStatusResponse[]
  disabled?: boolean
}

export function ReuseQuestionsSelect({
  value,
  onChange,
  evaluations,
  disabled,
}: ReuseQuestionsSelectProps) {
  // Only show completed evaluations
  const completedEvaluations = evaluations.filter(e => e.status === 'completed')

  return (
    <Select
      value={value ?? 'none'}
      onValueChange={(v) => onChange(v === 'none' ? undefined : v)}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Generate new questions" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Generate new questions</SelectItem>
        {completedEvaluations.map((evaluation) => (
          <SelectItem key={evaluation.evaluation_id} value={evaluation.evaluation_id}>
            {evaluation.evaluation_id.slice(0, 8)}... ({evaluation.folder_path})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
