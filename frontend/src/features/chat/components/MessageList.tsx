import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from './MessageBubble'
import { useChatScroll } from '../hooks/useChatScroll'
import type { Message } from '@/types/api'

interface MessageListProps {
  messages: Message[]
  pendingMessage?: string | null
}

export function MessageList({ messages, pendingMessage }: MessageListProps) {
  const { containerRef, handleScroll } = useChatScroll([messages, pendingMessage])

  return (
    <ScrollArea className="flex-1 px-4">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex flex-col gap-4 py-4"
      >
        {messages.length === 0 && !pendingMessage ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm">Type a message below to begin</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble key={`${message.timestamp}-${index}`} message={message} />
            ))}
            {pendingMessage && (
              <MessageBubble
                message={{
                  role: 'user',
                  content: pendingMessage,
                  timestamp: new Date().toISOString(),
                }}
                isPending
              />
            )}
          </>
        )}
      </div>
    </ScrollArea>
  )
}
