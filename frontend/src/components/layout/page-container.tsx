import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  fullWidth?: boolean
  className?: string
}

export function PageContainer({
  children,
  fullWidth = false,
  className,
}: PageContainerProps) {
  return (
    <main
      className={cn(
        "flex-1 overflow-auto p-6",
        !fullWidth && "max-w-5xl mx-auto",
        className
      )}
    >
      {children}
    </main>
  )
}
