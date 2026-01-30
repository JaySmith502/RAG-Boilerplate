import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFolders } from '../hooks/useFolders'

interface FolderSelectProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function FolderSelect({ value, onChange, disabled }: FolderSelectProps) {
  const { data, isFetching, refetch } = useFolders()

  return (
    <div className="flex items-center gap-2">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder="Select a folder..." />
        </SelectTrigger>
        <SelectContent>
          {data?.folders.map((folder) => (
            <SelectItem key={folder.path} value={folder.path}>
              {folder.name} ({folder.file_count ?? 0} files)
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => refetch()}
        disabled={disabled || isFetching}
        title="Refresh folder list"
      >
        <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  )
}
