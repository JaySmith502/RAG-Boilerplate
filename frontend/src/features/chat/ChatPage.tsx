import { PageContainer } from "@/components/layout/page-container"

interface ChatPageProps {
  selectedSessionId: string | null
  onSelectSession: (sessionId: string | null) => void
}

export function ChatPage({ selectedSessionId, onSelectSession: _onSelectSession }: ChatPageProps) {
  return (
    <PageContainer fullWidth>
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <h2 className="text-2xl font-semibold mb-2">Chat</h2>
        <p className="text-muted-foreground">
          {selectedSessionId ? `Session: ${selectedSessionId}` : 'New Chat - Start typing below'}
        </p>
      </div>
    </PageContainer>
  )
}
