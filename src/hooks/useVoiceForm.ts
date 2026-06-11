import { useCallback, useEffect, useRef, useState } from 'react'
import _VapiImport from '@vapi-ai/web'
import { buildAssistantConfig } from '../utils/buildAssistantConfig'
import { AIModel, FormData, FormField, VoiceConfig, VoiceFormStatus } from '../types'

// Vite's CJS→ESM interop wraps the entire exports object as `.default` when
// the CJS module has __esModule:true (TypeScript pattern). Guard both paths:
// - normal bundler path: _VapiImport is the class itself (typeof === 'function')
// - Vite isNodeMode path: _VapiImport is the exports object, class is in .default
const Vapi = (
  typeof _VapiImport === 'function' ? _VapiImport : (_VapiImport as any).default
) as typeof _VapiImport

interface UseVoiceFormOptions {
  vapiKey: string
  fields: FormField[]
  assistantName: string
  firstMessage: string
  voice?: VoiceConfig
  model?: AIModel
  onComplete?: (data: FormData) => void
  onError?: (error: Error) => void
}

export function useVoiceForm({
  vapiKey,
  fields,
  assistantName,
  firstMessage,
  voice,
  model,
  onComplete,
  onError,
}: UseVoiceFormOptions) {
  const vapiRef = useRef<InstanceType<typeof _VapiImport> | null>(null)
  const [status, setStatus] = useState<VoiceFormStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // React StrictMode runs effects twice in dev. Destroy any previous instance
    // before creating a new one to avoid duplicate Krisp SDK loads.
    if (vapiRef.current) {
      vapiRef.current.stop().catch(() => {})
      vapiRef.current = null
    }

    const vapi = new Vapi(vapiKey)
    vapiRef.current = vapi

    vapi.on('call-start', () => {
      setStatus('active')
      setErrorMessage(null)
    })
    vapi.on('call-end', () => {
      setStatus((prev) => (prev === 'completed' ? 'completed' : 'idle'))
      setVolumeLevel(0)
    })
    vapi.on('volume-level', (level: number) => setVolumeLevel(level))

    vapi.on('message', (msg: any) => {
      if (msg?.type !== 'tool-calls') return
      const toolCallList: Array<{ function: { name: string; arguments: string | object } }> =
        msg.toolCallList ?? []
      for (const call of toolCallList) {
        if (call.function.name === 'submitForm') {
          try {
            const data: FormData =
              typeof call.function.arguments === 'string'
                ? JSON.parse(call.function.arguments)
                : (call.function.arguments as FormData)
            setStatus('completed')
            onComplete?.(data)
            vapi.stop()
          } catch {
            onError?.(new Error('Failed to parse form data from assistant.'))
          }
        }
      }
    })

    vapi.on('error', (err: any) => {
      setStatus('error')
      const msg = err?.error?.message ?? err?.message ?? 'Something went wrong. Please try again.'
      setErrorMessage(msg)
      onError?.(err instanceof Error ? err : new Error(msg))
    })

    return () => {
      vapiRef.current = null
      vapi.stop().catch(() => {})
    }
  }, [vapiKey])

  const start = useCallback(() => {
    if (!vapiRef.current) return
    setStatus('connecting')
    setErrorMessage(null)
    const config = buildAssistantConfig(fields, assistantName, firstMessage, voice, model)
    vapiRef.current.start(config as any)
  }, [fields, assistantName, firstMessage, voice, model])

  const stop = useCallback(() => {
    vapiRef.current?.stop()
    setStatus('idle')
    setErrorMessage(null)
  }, [])

  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return
    const next = !isMuted
    vapiRef.current.setMuted(next)
    setIsMuted(next)
  }, [isMuted])

  return { status, errorMessage, isMuted, volumeLevel, start, stop, toggleMute }
}
