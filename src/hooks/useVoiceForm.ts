import { useCallback, useEffect, useRef, useState } from 'react'
import Vapi from '@vapi-ai/web'
import { buildAssistantConfig } from '../utils/buildAssistantConfig'
import { FormData, FormField, VoiceFormStatus } from '../types'

interface UseVoiceFormOptions {
  vapiKey: string
  fields: FormField[]
  assistantName: string
  firstMessage: string
  onComplete?: (data: FormData) => void
  onError?: (error: Error) => void
}

export function useVoiceForm({
  vapiKey,
  fields,
  assistantName,
  firstMessage,
  onComplete,
  onError,
}: UseVoiceFormOptions) {
  const vapiRef = useRef<Vapi | null>(null)
  const [status, setStatus] = useState<VoiceFormStatus>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)

  useEffect(() => {
    const vapi = new Vapi(vapiKey)
    vapiRef.current = vapi

    vapi.on('call-start', () => setStatus('active'))
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

    vapi.on('error', (err: Error) => {
      setStatus('error')
      onError?.(err)
    })

    return () => {
      vapi.stop()
    }
  }, [vapiKey])

  const start = useCallback(() => {
    if (!vapiRef.current) return
    setStatus('connecting')
    const config = buildAssistantConfig(fields, assistantName, firstMessage)
    vapiRef.current.start(config as any)
  }, [fields, assistantName, firstMessage])

  const stop = useCallback(() => {
    vapiRef.current?.stop()
    setStatus('idle')
  }, [])

  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return
    const next = !isMuted
    vapiRef.current.setMuted(next)
    setIsMuted(next)
  }, [isMuted])

  return { status, isMuted, volumeLevel, start, stop, toggleMute }
}
