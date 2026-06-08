import React from 'react'
import { useVoiceForm } from '../hooks/useVoiceForm'
import { VoiceFormAgentProps } from '../types'

export function VoiceFormAgent({
  vapiKey,
  fields,
  onComplete,
  onError,
  assistantName = 'Form Assistant',
  firstMessage = "Hi! I'll help you fill out this form. Let's get started.",
  buttonLabel = 'Start Voice Form',
  stopLabel = 'Stop',
  className,
}: VoiceFormAgentProps) {
  const { status, isMuted, volumeLevel, start, stop, toggleMute } = useVoiceForm({
    vapiKey,
    fields,
    assistantName,
    firstMessage,
    onComplete,
    onError,
  })

  const isActive = status === 'active'
  const isConnecting = status === 'connecting'
  const isCompleted = status === 'completed'

  const barCount = 5
  const bars = Array.from({ length: barCount })

  return (
    <div
      className={className}
      style={styles.wrapper}
      data-voice-form-status={status}
    >
      {(isActive || isConnecting) && (
        <div style={styles.visualizer}>
          {bars.map((_, i) => {
            const height = isActive
              ? Math.max(4, Math.round(volumeLevel * 40 * Math.sin((i + 1) * 0.8)))
              : 4
            return (
              <div
                key={i}
                style={{
                  ...styles.bar,
                  height,
                  opacity: isConnecting ? 0.4 : 1,
                  transition: 'height 80ms ease',
                }}
              />
            )
          })}
        </div>
      )}

      {isCompleted ? (
        <div style={styles.completedBadge}>
          <span style={styles.checkmark}>✓</span>
          Form submitted
        </div>
      ) : isActive || isConnecting ? (
        <div style={styles.controls}>
          <button
            onClick={toggleMute}
            style={styles.muteButton}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🎙️'}
          </button>
          <button onClick={stop} style={styles.stopButton} disabled={isConnecting}>
            {isConnecting ? 'Connecting…' : stopLabel}
          </button>
        </div>
      ) : (
        <button onClick={start} style={styles.startButton}>
          🎙️ {buttonLabel}
        </button>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    fontFamily: 'inherit',
  },
  visualizer: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    height: 40,
  },
  bar: {
    width: 4,
    borderRadius: 2,
    background: '#6366f1',
    minHeight: 4,
  },
  controls: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
  },
  startButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    borderRadius: 8,
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  stopButton: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#fff',
    color: '#374151',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  muteButton: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    background: '#fff',
    fontSize: 16,
    cursor: 'pointer',
  },
  completedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 8,
    background: '#f0fdf4',
    color: '#15803d',
    fontSize: 14,
    fontWeight: 600,
    border: '1px solid #bbf7d0',
  },
  checkmark: {
    fontSize: 16,
  },
}
