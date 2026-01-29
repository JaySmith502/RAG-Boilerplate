import { useState } from "react"
import { ThemeProvider } from "@/providers/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"
import { ChatPage } from "@/features/chat/ChatPage"
import { RetrievalPage } from "@/features/retrieval/RetrievalPage"
import { IngestionPage } from "@/features/ingestion/IngestionPage"
import { EvaluationPage } from "@/features/evaluation/EvaluationPage"
import { Toaster } from "@/components/ui/sonner"

function AppContent() {
  const [activeSection, setActiveSection] = useState("chat")

  const renderPage = () => {
    switch (activeSection) {
      case "chat":
        return <ChatPage />
      case "retrieval":
        return <RetrievalPage />
      case "ingestion":
        return <IngestionPage />
      case "evaluation":
        return <EvaluationPage />
      default:
        return <ChatPage />
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <div className="flex flex-1 flex-col">
          <Header />
          {renderPage()}
        </div>
      </div>
      <Toaster position="bottom-right" />
    </SidebarProvider>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AppContent />
    </ThemeProvider>
  )
}

export default App
