import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { PipelineType, RetrievalRequest } from '@/types/api'

interface RetrievalFormProps {
  onSubmit: (request: RetrievalRequest) => void
  isPending: boolean
}

export function RetrievalForm({ onSubmit, isPending }: RetrievalFormProps) {
  const [query, setQuery] = useState('')
  const [topK, setTopK] = useState(10)
  const [useQueryEnhancer, setUseQueryEnhancer] = useState(false)
  const [useReranking, setUseReranking] = useState(false)
  const [pipelineType, setPipelineType] = useState<PipelineType>('recursive_overlap')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    onSubmit({
      query: query.trim(),
      top_k: topK,
      use_query_enhancer: useQueryEnhancer,
      use_reranking: useReranking,
      pipeline_type: pipelineType,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Query Input */}
      <div className="space-y-2">
        <Label htmlFor="query">Search Query</Label>
        <Input
          id="query"
          placeholder="Enter your search query..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isPending}
        />
      </div>

      {/* Parameter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top-K Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="top-k">Top K Results</Label>
            <span className="text-sm text-muted-foreground">{topK}</span>
          </div>
          <Slider
            id="top-k"
            min={1}
            max={50}
            step={1}
            value={[topK]}
            onValueChange={([value]) => setTopK(value)}
            disabled={isPending}
          />
        </div>

        {/* Pipeline Select */}
        <div className="space-y-2">
          <Label htmlFor="pipeline">Pipeline Type</Label>
          <Select
            value={pipelineType}
            onValueChange={(value) => setPipelineType(value as PipelineType)}
            disabled={isPending}
          >
            <SelectTrigger id="pipeline">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recursive_overlap">Recursive Overlap</SelectItem>
              <SelectItem value="semantic">Semantic</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Toggle Checkboxes */}
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

      {/* Submit Button */}
      <Button type="submit" disabled={isPending || !query.trim()}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Retrieving...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Retrieve
          </>
        )}
      </Button>
    </form>
  )
}
