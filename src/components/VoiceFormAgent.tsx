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
  voice,
  model,
  buttonLabel = 'Start voice form',
  stopLabel = 'Stop',
  className,
  startButtonClassName,
  stopButtonClassName,
  muteButtonClassName,
  startButtonStyle,
  stopButtonStyle,
  accentColor = '#000000',
}: VoiceFormAgentProps) {
  const { status, errorMessage, isMuted, volumeLevel, start, stop, toggleMute } = useVoiceForm({
    vapiKey,
    fields,
    assistantName,
    firstMessage,
    voice,
    model,
    onComplete,
    onError,
  })

  const isActive = status === 'active'
  const isConnecting = status === 'connecting'
  const isCompleted = status === 'completed'
  const isError = status === 'error'

  const bars = Array.from({ length: 5 })

  return (
    <div className={className} style={styles.wrapper} data-voice-form-status={status}>

      {(isActive || isConnecting) && (
        <div style={styles.visualizer}>
          {bars.map((_, i) => {
            const height = isActive
              ? Math.max(3, Math.round(volumeLevel * 36 * Math.sin((i + 1) * 0.8)))
              : 3
            return (
              <div
                key={i}
                style={{
                  ...styles.bar,
                  height,
                  background: accentColor,
                  opacity: isConnecting ? 0.3 : 0.8,
                  transition: 'height 80ms ease',
                }}
              />
            )
          })}
        </div>
      )}

      {isCompleted ? (
        <div style={styles.completedBadge}>
          <span>✓</span> Submitted
        </div>
      ) : isActive || isConnecting ? (
        <div style={styles.controls}>
          <button
            onClick={toggleMute}
            style={styles.iconButton}
            className={muteButtonClassName}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? '🔇' : '🎙'}
          </button>
          <button
            onClick={stop}
            style={{ ...styles.stopButton, ...stopButtonStyle }}
            className={stopButtonClassName}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting…' : stopLabel}
          </button>
        </div>
      ) : (
        <>
          {isError && errorMessage && (
            <p style={styles.error}>{errorMessage}</p>
          )}
          <button
            onClick={start}
            style={{
              ...styles.startButton,
              background: accentColor,
              ...startButtonStyle,
            }}
            className={startButtonClassName}
          >
            🎙 {buttonLabel}
          </button>
        </>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 10,
    fontFamily: 'inherit',
  },
  visualizer: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    height: 32,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    minHeight: 3,
  },
  controls: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  startButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 18px',
    borderRadius: 6,
    border: 'none',
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.01em',
  },
  stopButton: {
    padding: '7px 14px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    background: 'transparent',
    color: '#374151',
    fontSize: 13,
    cursor: 'pointer',
  },
  iconButton: {
    padding: '7px 10px',
    borderRadius: 6,
    border: '1px solid #d1d5db',
    background: 'transparent',
    fontSize: 15,
    cursor: 'pointer',
    lineHeight: 1,
  },
  completedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '7px 14px',
    borderRadius: 6,
    background: '#f0fdf4',
    color: '#15803d',
    fontSize: 13,
    fontWeight: 500,
    border: '1px solid #bbf7d0',
  },
  error: {
    margin: 0,
    fontSize: 12,
    color: '#dc2626',
    maxWidth: 280,
    textAlign: 'center',
  },
}
