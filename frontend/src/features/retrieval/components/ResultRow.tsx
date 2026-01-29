import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { TableCell, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import type { RetrievedDocument } from '@/types/api'

interface ResultRowProps {
  document: RetrievedDocument
  index: number
}

export function ResultRow({ document, index }: ResultRowProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Truncate text for preview (first 100 chars)
  const previewText = document.text.length > 100
    ? document.text.slice(0, 100) + '...'
    : document.text

  // Format score safely (can be null when reranking not used)
  const scoreDisplay = document.score?.toFixed(4) ?? 'N/A'

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} asChild>
      <>
        <CollapsibleTrigger asChild>
          <TableRow
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => setIsOpen(!isOpen)}
          >
            <TableCell className="w-12 font-medium">{index + 1}</TableCell>
            <TableCell className="max-w-md">
              <span className="truncate block">{previewText}</span>
            </TableCell>
            <TableCell className="max-w-32">
              <span className="truncate block">{document.source}</span>
            </TableCell>
            <TableCell className="text-right">{scoreDisplay}</TableCell>
            <TableCell className="w-10">
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
              />
            </TableCell>
          </TableRow>
        </CollapsibleTrigger>
        <CollapsibleContent asChild>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={5} className="bg-muted/30 p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Full Text:</p>
                  <p className="text-sm whitespace-pre-wrap">{document.text}</p>
                </div>
                {Object.keys(document.metadata).length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Metadata:</p>
                    <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                      {JSON.stringify(document.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </>
    </Collapsible>
  )
}
