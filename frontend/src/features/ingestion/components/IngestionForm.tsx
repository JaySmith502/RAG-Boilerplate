import { useState } from 'react'
import { Play, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FolderSelect } from './FolderSelect'
import { useFolders } from '../hooks/useFolders'
import type { PipelineType, IngestionJobRequest } from '@/types/api'

interface IngestionFormProps {
  onSubmit: (request: IngestionJobRequest) => void
  isPending: boolean
}

export function IngestionForm({ onSubmit, isPending }: IngestionFormProps) {
  const [folderPath, setFolderPath] = useState('')
  const [includePdf, setIncludePdf] = useState(true)
  const [includeJson, setIncludeJson] = useState(false)
  const [pipelineType, setPipelineType] = useState<PipelineType>('recursive_overlap')

  const { data: foldersData } = useFolders()

  // Find selected folder to check file count
  const selectedFolder = foldersData?.folders.find(f => f.path === folderPath)
  const hasZeroFiles = selectedFolder && (selectedFolder.file_count ?? 0) === 0
  const hasNoFileTypeSelected = !includePdf && !includeJson
  const canSubmit = folderPath && !hasNoFileTypeSelected && !isPending

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    const fileTypes: string[] = []
    if (includePdf) fileTypes.push('pdf')
    if (includeJson) fileTypes.push('json')

    onSubmit({
      folder_path: folderPath,
      file_types: fileTypes,
      pipeline_type: pipelineType,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Folder Selection */}
      <div className="space-y-2">
        <Label htmlFor="folder">Source Folder</Label>
        <FolderSelect
          value={folderPath}
          onChange={setFolderPath}
          disabled={isPending}
        />
        {hasZeroFiles && (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span>Selected folder has no files</span>
          </div>
        )}
      </div>

      {/* File Types */}
      <div className="space-y-2">
        <Label>File Types</Label>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-pdf"
              checked={includePdf}
              onCheckedChange={(checked) => setIncludePdf(checked === true)}
              disabled={isPending}
            />
            <Label htmlFor="include-pdf" className="cursor-pointer">
              PDF Documents
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-json"
              checked={includeJson}
              onCheckedChange={(checked) => setIncludeJson(checked === true)}
              disabled={isPending}
            />
            <Label htmlFor="include-json" className="cursor-pointer">
              JSON Files
            </Label>
          </div>
        </div>
        {hasNoFileTypeSelected && (
          <p className="text-sm text-destructive">
            Select at least one file type
          </p>
        )}
      </div>

      {/* Pipeline Type */}
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

      {/* Submit Button */}
      <Button type="submit" disabled={!canSubmit}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Starting...
          </>
        ) : (
          <>
            <Play className="mr-2 h-4 w-4" />
            Start Ingestion
          </>
        )}
      </Button>
    </form>
  )
}
