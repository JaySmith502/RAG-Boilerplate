import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { copyToClipboard } from '../utils/clipboard'

interface MessageActionsProps {
  content: string
}

export function MessageActions({ content }: MessageActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const success = await copyToClipboard(content)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-1 mt-2 -ml-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        {copied ? (
          <>
            <Check className="h-3 w-3 mr-1" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </>
        )}
      </Button>
    </div>
  )
}
