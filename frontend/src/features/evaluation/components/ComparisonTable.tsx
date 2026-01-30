import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { EvaluationStatusResponse } from '@/types/api'

interface ComparisonTableProps {
  evaluations: EvaluationStatusResponse[]
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
}

interface RetrieveParams {
  top_k: number
  use_query_enhancer: boolean
  use_reranking: boolean
}

export function ComparisonTable({
  evaluations,
  selectedIds,
  onSelectionChange,
}: ComparisonTableProps) {
  const completedEvaluations = evaluations.filter((e) => e.status === 'completed')

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    onSelectionChange(newSet)
  }

  if (completedEvaluations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No completed evaluations to compare
      </div>
    )
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Evaluation ID</TableHead>
            <TableHead>Folder</TableHead>
            <TableHead>Top-K</TableHead>
            <TableHead>Enhancer</TableHead>
            <TableHead>Reranking</TableHead>
            <TableHead className="text-right">Hit Rate</TableHead>
            <TableHead className="text-right">MRR</TableHead>
            <TableHead className="text-right">Avg Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {completedEvaluations.map((evaluation) => {
            const params = evaluation.retrieve_params as RetrieveParams
            const summary = evaluation.results_summary
            const isSelected = selectedIds.has(evaluation.evaluation_id)

            return (
              <TableRow
                key={evaluation.evaluation_id}
                className={cn(
                  'cursor-pointer hover:bg-muted/50',
                  isSelected && 'bg-muted/50'
                )}
                onClick={() => toggleSelection(evaluation.evaluation_id)}
              >
                <TableCell>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelection(evaluation.evaluation_id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {evaluation.evaluation_id.slice(0, 8)}...
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={evaluation.folder_path}>
                  {evaluation.folder_path}
                </TableCell>
                <TableCell>{params.top_k ?? 'N/A'}</TableCell>
                <TableCell>{params.use_query_enhancer ? 'Yes' : 'No'}</TableCell>
                <TableCell>{params.use_reranking ? 'Yes' : 'No'}</TableCell>
                <TableCell className="text-right">
                  {summary?.hit_rate !== undefined
                    ? `${(summary.hit_rate * 100).toFixed(1)}%`
                    : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {summary?.mrr !== undefined ? summary.mrr.toFixed(3) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {summary?.avg_score !== undefined ? summary.avg_score.toFixed(3) : 'N/A'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
