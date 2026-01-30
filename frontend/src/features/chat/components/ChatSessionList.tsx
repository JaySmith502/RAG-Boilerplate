import { Plus } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupAction,
} from '@/components/ui/sidebar'
import { useSessions } from '../hooks/useSessions'
import type { Session } from '@/types/api'

interface ChatSessionListProps {
  selectedSessionId: string | null
  onSelectSession: (sessionId: string | null) => void
}

export function ChatSessionList({
  selectedSessionId,
  onSelectSession,
}: ChatSessionListProps) {
  const { data, isLoading, isError } = useSessions()

  const handleNewChat = () => {
    onSelectSession(null) // null indicates new chat
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  }

  const getSessionTitle = (session: Session) => {
    // Use first user message as title, or fallback
    const firstUserMessage = session.messages.find(m => m.role === 'user')
    if (firstUserMessage) {
      return firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '')
    }
    return `Chat ${formatDate(session.created_at)}`
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Chat History</SidebarGroupLabel>
      <SidebarGroupAction onClick={handleNewChat} title="New Chat">
        <Plus className="h-4 w-4" />
      </SidebarGroupAction>
      <SidebarGroupContent>
        {isLoading ? (
          <div className="space-y-2 px-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <div className="px-2 py-4 text-sm text-muted-foreground">
            Failed to load sessions
          </div>
        ) : !data?.sessions.length ? (
          <div className="px-2 py-4 text-sm text-muted-foreground">
            No conversations yet
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <SidebarMenu>
              {data.sessions.map((session) => (
                <SidebarMenuItem key={session.session_id}>
                  <SidebarMenuButton
                    isActive={selectedSessionId === session.session_id}
                    onClick={() => onSelectSession(session.session_id)}
                    className="flex flex-col items-start gap-0.5 h-auto py-2 transition-colors"
                  >
                    <span className="truncate w-full text-left">
                      {getSessionTitle(session)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(session.updated_at)}
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </ScrollArea>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
