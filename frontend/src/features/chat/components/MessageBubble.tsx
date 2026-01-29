import { cn } from '@/lib/utils'
import type { Message } from '@/types/api'

interface MessageBubbleProps {
  message: Message
  isPending?: boolean
}

export function MessageBubble({ message, isPending }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      className={cn(
        'flex w-full',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted rounded-bl-md',
          isPending && 'opacity-70'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={cn(
            'text-xs mt-1',
            isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </div>
  )
}
