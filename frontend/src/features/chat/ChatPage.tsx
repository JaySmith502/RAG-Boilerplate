import { useCallback } from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageList } from './components/MessageList'
import { MessageInput } from './components/MessageInput'
import { useSession } from './hooks/useSession'
import { useSendMessage } from './hooks/useSendMessage'

interface ChatPageProps {
  selectedSessionId: string | null
  onSelectSession: (sessionId: string | null) => void
}

export function ChatPage({ selectedSessionId, onSelectSession }: ChatPageProps) {
  const {
    data: session,
    isLoading: isLoadingSession,
    isError: isSessionError,
  } = useSession(selectedSessionId)

  const {
    mutate: sendMessage,
    isPending: isSending,
    variables: pendingVariables,
  } = useSendMessage()

  // When a new session is created from sending a message, update selection
  const handleSend = useCallback(
    (message: string) => {
      sendMessage(
        {
          message,
          session_id: selectedSessionId,
        },
        {
          onSuccess: (data) => {
            // If this was a new chat (no session), update to the new session ID
            if (!selectedSessionId && data.session_id) {
              onSelectSession(data.session_id)
            }
          },
        }
      )
    },
    [selectedSessionId, sendMessage, onSelectSession]
  )

  const messages = session?.messages ?? []
  const pendingMessage = isSending ? pendingVariables?.message : null

  // Loading state for existing session
  if (selectedSessionId && isLoadingSession) {
    return (
      <PageContainer fullWidth className="flex flex-col h-[calc(100vh-4rem)] p-0">
        <div className="flex-1 p-4 space-y-4">
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-16 w-1/2 ml-auto" />
          <Skeleton className="h-16 w-2/3" />
        </div>
        <div className="border-t p-4">
          <Skeleton className="h-11 w-full" />
        </div>
      </PageContainer>
    )
  }

  // Error state
  if (selectedSessionId && isSessionError) {
    return (
      <PageContainer fullWidth className="flex flex-col h-[calc(100vh-4rem)] p-0">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-destructive">Failed to load conversation</p>
            <p className="text-sm text-muted-foreground mt-1">Please try selecting another session</p>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer fullWidth className="flex flex-col h-[calc(100vh-4rem)] p-0">
      <MessageList messages={messages} pendingMessage={pendingMessage} />
      <MessageInput onSend={handleSend} disabled={isSending} />
    </PageContainer>
  )
}
