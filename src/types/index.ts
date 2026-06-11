import type React from 'react'

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

export type VoiceConfig =
  | { provider: 'openai'; voiceId: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' }
  | { provider: '11labs'; voiceId: 'burt' | 'marissa' | 'andrea' | 'sarah' | 'phillip' | 'steve' | 'joseph' | 'myra' | 'paula' | 'ryan' | 'drew' | 'paul' | 'mrb' | 'matilda' | 'mark' | string }

export type AIModel =
  | 'gpt-4o-mini'
  | 'gpt-4o'
  | 'gpt-4.1'
  | 'gpt-4.1-mini'
  | 'gpt-4.1-nano'
  | 'gpt-3.5-turbo'
  | string

export interface VoiceFormAgentProps {
  vapiKey: string
  fields: FormField[]
  onComplete?: (data: FormData) => void
  onError?: (error: Error) => void
  assistantName?: string
  firstMessage?: string
  voice?: VoiceConfig
  model?: AIModel
  buttonLabel?: string
  stopLabel?: string
  className?: string
  /** CSS class applied to the start button */
  startButtonClassName?: string
  /** CSS class applied to the stop button */
  stopButtonClassName?: string
  /** CSS class applied to the mute button */
  muteButtonClassName?: string
  /** Override inline styles on the start button */
  startButtonStyle?: React.CSSProperties
  /** Override inline styles on the stop button */
  stopButtonStyle?: React.CSSProperties
  /** Accent color used for the start button and visualizer bars (default: #000) */
  accentColor?: string
}
