import { useState, useCallback, useRef } from 'react'

/**
 * Procedural Web Audio API sound generator.
 * Zero audio files required — synthesizes cyber chimes and hums in real time.
 */
export function useSoundEffects() {
  const [soundEnabled, setSoundEnabled] = useState(false)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx()
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  const playClick = useCallback(() => {
    if (!soundEnabled) return
    try {
      const ctx = getAudioContext()
      if (!ctx) return

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(659.25, ctx.currentTime) // E5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08) // A5 note

      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.1)
    } catch {
      // AudioContext unavailable or blocked by browser policy
    }
  }, [soundEnabled, getAudioContext])

  const playOpen = useCallback(() => {
    if (!soundEnabled) return
    try {
      const ctx = getAudioContext()
      if (!ctx) return

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(329.63, ctx.currentTime) // E4
      osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.18) // D5

      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.22)
    } catch {
      // AudioContext unavailable
    }
  }, [soundEnabled, getAudioContext])

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev
      if (next) {
        getAudioContext()
      }
      return next
    })
  }, [getAudioContext])

  return {
    soundEnabled,
    toggleSound,
    playClick,
    playOpen,
  }
}
