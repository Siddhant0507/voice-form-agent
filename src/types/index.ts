export type FieldType = 'text' | 'email' | 'phone' | 'number' | 'textarea'

export interface FormField {
  id: string
  label: string
  type?: FieldType
  required?: boolean
}

export type FormData = Record<string, string>

export type VoiceFormStatus =
  | 'idle'
  | 'connecting'
  | 'active'
  | 'completed'
  | 'error'

export interface VoiceFormAgentProps {
  vapiKey: string
  fields: FormField[]
  onComplete?: (data: FormData) => void
  onError?: (error: Error) => void
  assistantName?: string
  firstMessage?: string
  buttonLabel?: string
  stopLabel?: string
  className?: string
}
