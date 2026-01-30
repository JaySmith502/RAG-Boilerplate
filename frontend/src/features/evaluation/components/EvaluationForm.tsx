import { useState } from 'react'
import { Play, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { FolderSelect } from '@/features/ingestion/components/FolderSelect'
import { ReuseQuestionsSelect } from './ReuseQuestionsSelect'
import type { EvaluationRequest, EvaluationStatusResponse } from '@/types/api'

interface EvaluationFormProps {
  onSubmit: (request: EvaluationRequest) => void
  isPending: boolean
  evaluations: EvaluationStatusResponse[]
}

export function EvaluationForm({ onSubmit, isPending, evaluations }: EvaluationFormProps) {
  const [folderPath, setFolderPath] = useState('')
  const [topK, setTopK] = useState(10)
  const [useQueryEnhancer, setUseQueryEnhancer] = useState(false)
  const [useReranking, setUseReranking] = useState(false)
  const [numQuestionsPerDoc, setNumQuestionsPerDoc] = useState(1)
  const [sourceEvaluationId, setSourceEvaluationId] = useState<string | undefined>()

  const canSubmit = folderPath && !isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    onSubmit({
      folder_path: folderPath,
      top_k: topK,
      use_query_enhancer: useQueryEnhancer,
      use_reranking: useReranking,
      num_questions_per_doc: numQuestionsPerDoc,
      source_evaluation_id: sourceEvaluationId ?? null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Folder Selection - EVAL-01 */}
      <div className="space-y-2">
        <Label>Evaluation Dataset Folder</Label>
        <FolderSelect
          value={folderPath}
          onChange={setFolderPath}
          disabled={isPending}
        />
      </div>

      {/* Parameter Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top-K Slider - EVAL-02 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Top K Results</Label>
            <span className="text-sm text-muted-foreground">{topK}</span>
          </div>
          <Slider
            min={1}
            max={50}
            step={1}
            value={[topK]}
            onValueChange={([value]) => setTopK(value)}
            disabled={isPending}
          />
        </div>

        {/* Questions Per Doc Slider - EVAL-05 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Questions Per Document</Label>
            <span className="text-sm text-muted-foreground">{numQuestionsPerDoc}</span>
          </div>
          <Slider
            min={1}
            max={10}
            step={1}
            value={[numQuestionsPerDoc]}
            onValueChange={([value]) => setNumQuestionsPerDoc(value)}
            disabled={isPending || !!sourceEvaluationId}
          />
          {sourceEvaluationId && (
            <p className="text-xs text-muted-foreground">
              Disabled when reusing questions
            </p>
          )}
        </div>
      </div>

      {/* Toggle Checkboxes - EVAL-03, EVAL-04 */}
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="query-enhancer"
            checked={useQueryEnhancer}
            onCheckedChange={(checked) => setUseQueryEnhancer(checked === true)}
            disabled={isPending}
          />
          <Label htmlFor="query-enhancer" className="cursor-pointer">
            Enable Query Enhancer
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="reranking"
            checked={useReranking}
            onCheckedChange={(checked) => setUseReranking(checked === true)}
            disabled={isPending}
          />
          <Label htmlFor="reranking" className="cursor-pointer">
            Enable Reranking
          </Label>
        </div>
      </div>

      {/* Reuse Questions - EVAL-06 */}
      <div className="space-y-2">
        <Label>Reuse Questions From</Label>
        <ReuseQuestionsSelect
          value={sourceEvaluationId}
          onChange={setSourceEvaluationId}
          evaluations={evaluations}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">
          Reuse questions from a previous evaluation for fair comparison
        </p>
      </div>

      {/* Submit Button - EVAL-07 */}
      <Button type="submit" disabled={!canSubmit}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Evaluating...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Start Evaluation
          </>
        )}
      </Button>
    </form>
  )
}
