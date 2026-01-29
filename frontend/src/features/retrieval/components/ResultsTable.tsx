import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ResultRow } from './ResultRow'
import type { RetrievedDocument } from '@/types/api'

interface ResultsTableProps {
  documents: RetrievedDocument[]
  query: string
  totalRetrieved: number
}

export function ResultsTable({ documents, query, totalRetrieved }: ResultsTableProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Query: "{query}"</span>
        <span>{totalRetrieved} result{totalRetrieved !== 1 ? 's' : ''} found</span>
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Text Preview</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document, index) => (
              <ResultRow
                key={`${document.source}-${index}`}
                document={document}
                index={index}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
