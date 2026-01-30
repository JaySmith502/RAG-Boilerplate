import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EvaluationStatusResponse } from '@/types/api'

interface EvaluationSelectProps {
  value: string | null
  onChange: (value: string | null) => void
  evaluations: EvaluationStatusResponse[]
  disabled?: boolean
}

/**
 * Dropdown to select a completed evaluation.
 * Displays evaluation ID preview, folder path, and hit rate.
 */
export function EvaluationSelect({
  value,
  onChange,
  evaluations,
  disabled,
}: EvaluationSelectProps) {
  // Filter to completed evaluations only
  const completedEvaluations = evaluations.filter(
    (e) => e.status === 'completed'
  )

  const handleChange = (newValue: string) => {
    onChange(newValue === '' ? null : newValue)
  }

  if (completedEvaluations.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="No evaluations available" />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select
      value={value ?? ''}
      onValueChange={handleChange}
      disabled={disabled}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select an evaluation" />
      </SelectTrigger>
      <SelectContent>
        {completedEvaluations.map((evaluation) => {
          const hitRate = evaluation.results_summary?.hit_rate
          const hitRateDisplay =
            hitRate !== undefined
              ? `${(hitRate * 100).toFixed(1)}%`
              : 'N/A'

          return (
            <SelectItem
              key={evaluation.evaluation_id}
              value={evaluation.evaluation_id}
            >
              {evaluation.evaluation_id.slice(0, 8)}... - {evaluation.folder_path} - Hit: {hitRateDisplay}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
