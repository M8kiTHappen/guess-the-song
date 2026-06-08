'use client'

import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react'
import { useGame } from '@/context/GameContext'

interface AudioContextValue {
  isPlaying: boolean
  hasPlayed: boolean
  playClip: () => void   // 5-second limited clip (guess phase)
  stopAudio: () => void
}

const AudioCtx = createContext<AudioContextValue | null>(null)

export function useAudio() {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio must be used within AudioProvider')
  return ctx
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const { state } = useGame()
  const audioRef = useRef<HTMLAudioElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPlayed, setHasPlayed] = useState(false)

  const currentSong = state.songs[state.currentSongIndex]

  // Reset when a new song loads
  useEffect(() => {
    setIsPlaying(false)
    setHasPlayed(false)
    clearTimeout(timerRef.current)
    const audio = audioRef.current
    if (audio) { audio.pause(); audio.currentTime = 0 }
  }, [state.currentSongIndex])

  // On reveal: remove the 5-second limit and restart the full clip
  useEffect(() => {
    if (state.screen !== 'reveal') return
    const audio = audioRef.current
    if (!audio) return
    clearTimeout(timerRef.current)
    audio.currentTime = 0
    audio.play().catch(() => {})
    setIsPlaying(true)
  }, [state.screen])

  const playClip = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    clearTimeout(timerRef.current)
    audio.currentTime = 0
    audio.play()
    setIsPlaying(true)
    setHasPlayed(true)
    timerRef.current = setTimeout(() => {
      audio.pause()
      setIsPlaying(false)
    }, 5000)
  }, [])

  const stopAudio = useCallback(() => {
    clearTimeout(timerRef.current)
    audioRef.current?.pause()
    setIsPlaying(false)
  }, [])

  return (
    <AudioCtx.Provider value={{ isPlaying, hasPlayed, playClip, stopAudio }}>
      {currentSong && (
        <audio ref={audioRef} src={currentSong.previewUrl} preload="auto" />
      )}
      {children}
    </AudioCtx.Provider>
  )
}
