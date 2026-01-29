import { toast } from 'sonner'

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator?.clipboard) {
    toast.error('Clipboard not supported in this browser')
    return false
  }

  try {
    await navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
    return true
  } catch (error) {
    console.error('Clipboard error:', error)
    toast.error('Failed to copy to clipboard')
    return false
  }
}
