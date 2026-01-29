import { useState } from 'react'
import { ChevronDown, FileText } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'

interface SourceCitationsProps {
  sources: string[]
}

export function SourceCitations({ sources }: SourceCitationsProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!sources || sources.length === 0) {
    return null
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-3 pt-3 border-t border-border/50">
      <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-full">
        <ChevronDown
          className={cn(
            'h-3 w-3 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
        <FileText className="h-3 w-3" />
        <span>
          {sources.length} source{sources.length !== 1 ? 's' : ''}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <ul className="space-y-1.5">
          {sources.map((source, index) => (
            <li
              key={index}
              className="text-xs text-muted-foreground pl-5 truncate"
              title={source}
            >
              {source}
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  )
}
