export type DocumentKind = 'course' | 'td' | 'exercise'
export type NoteKind = 'summary' | 'exercise' | 'explain'
export type Page = 'home' | 'courses' | 'exercises' | 'notes' | 'assistant' | 'favorites'

export interface StudyDocument {
  id: string
  title: string
  subject: string
  kind: DocumentKind
  filename: string
  mimeType: string
  size: number
  favorite: boolean
  createdAt: string
}

export interface StudyNote {
  id: string
  documentId: string | null
  title: string
  kind: NoteKind
  content: string
  prompt: string | null
  createdAt: string
  isPreview?: boolean
}

export interface ChatMessage {
  id: string
  documentId: string | null
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface Workspace {
  documents: StudyDocument[]
  notes: StudyNote[]
}

export const MAX_FILE_SIZE = 4 * 1024 * 1024
export const FILE_ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.docx,.txt,.md'

export const kindLabels: Record<DocumentKind, string> = {
  course: 'Cours', td: 'TD', exercise: 'Exercice',
}
