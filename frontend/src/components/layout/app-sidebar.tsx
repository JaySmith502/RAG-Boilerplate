import { MessageSquare, Search, Upload, BarChart } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ChatSessionList } from "@/features/chat/components/ChatSessionList"

const navItems = [
  { title: "Chat", icon: MessageSquare, id: "chat" },
  { title: "Retrieval", icon: Search, id: "retrieval" },
  { title: "Ingestion", icon: Upload, id: "ingestion" },
  { title: "Evaluation", icon: BarChart, id: "evaluation" },
]

interface AppSidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  selectedSessionId: string | null
  onSelectSession: (sessionId: string | null) => void
}

export function AppSidebar({
  activeSection,
  onSectionChange,
  selectedSessionId,
  onSelectSession,
}: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeSection === item.id}
                    onClick={() => onSectionChange(item.id)}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {activeSection === 'chat' && (
          <ChatSessionList
            selectedSessionId={selectedSessionId}
            onSelectSession={onSelectSession}
          />
        )}
      </SidebarContent>
    </Sidebar>
  )
}
