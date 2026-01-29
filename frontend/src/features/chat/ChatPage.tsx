import { useCallback } from 'react'
import { RefreshCw, Loader2 } from 'lucide-react'
import { PageContainer } from '@/components/layout/page-container'
import { Button } from '@/components/ui/button'
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
    refetch: refetchSession,
    isFetching: isFetchingSession,
  } = useSession(selectedSessionId)

  const {
    mutate: sendMessage,
    isPending: isSending,
    variables: pendingVariables,
    isError: isSendError,
    error: sendError,
    reset: resetSendError,
  } = useSendMessage()

  const handleSend = useCallback(
    (message: string) => {
      // Clear any previous error
      resetSendError()

      sendMessage(
        {
          message,
          session_id: selectedSessionId,
        },
        {
          onSuccess: (data) => {
            if (!selectedSessionId && data.session_id) {
              onSelectSession(data.session_id)
            }
          },
        }
      )
    },
    [selectedSessionId, sendMessage, onSelectSession, resetSendError]
  )

  const handleRetry = useCallback(() => {
    if (pendingVariables?.message) {
      handleSend(pendingVariables.message)
    }
  }, [pendingVariables, handleSend])

  const messages = session?.messages ?? []
  const pendingMessage = isSending ? pendingVariables?.message : null

  // Loading state for existing session
  if (selectedSessionId && isLoadingSession) {
    return (
      <PageContainer fullWidth className="flex flex-col h-[calc(100vh-4rem)] p-0">
        <div className="flex-1 p-4 space-y-4">
          <div className="flex justify-start">
            <Skeleton className="h-16 w-3/4 rounded-2xl" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-12 w-1/2 rounded-2xl" />
          </div>
          <div className="flex justify-start">
            <Skeleton className="h-20 w-2/3 rounded-2xl" />
          </div>
        </div>
        <div className="border-t p-4">
          <div className="flex gap-2 items-end max-w-4xl mx-auto">
            <Skeleton className="h-11 flex-1" />
            <Skeleton className="h-11 w-11" />
          </div>
        </div>
      </PageContainer>
    )
  }

  // Session load error state
  if (selectedSessionId && isSessionError) {
    return (
      <PageContainer fullWidth className="flex flex-col h-[calc(100vh-4rem)] p-0">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-lg font-medium text-destructive">Failed to load conversation</p>
            <p className="text-sm text-muted-foreground">There was a problem loading this chat session</p>
            <Button
              variant="outline"
              onClick={() => refetchSession()}
              disabled={isFetchingSession}
            >
              {isFetchingSession ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          </div>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer fullWidth className="flex flex-col h-[calc(100vh-4rem)] p-0">
      <MessageList messages={messages} pendingMessage={pendingMessage} />

      {/* Send error banner */}
      {isSendError && (
        <div className="border-t border-destructive/50 bg-destructive/10 px-4 py-3">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <p className="text-sm text-destructive">
              Failed to send message: {sendError instanceof Error ? sendError.message : 'Unknown error'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        </div>
      )}

      <MessageInput
        onSend={handleSend}
        disabled={isSending}
        placeholder={isSending ? 'Sending...' : 'Type a message...'}
      />
    </PageContainer>
  )
}
