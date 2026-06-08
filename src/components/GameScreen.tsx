'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/context/GameContext'
import { useAudio } from '@/context/AudioContext'

export default function GameScreen() {
  const { state, reveal, isLoading } = useGame()
  const { isPlaying, hasPlayed, playClip } = useAudio()
  const { players, songs, currentSongIndex, isTiebreaker, songCount, genre, decade } = state

  const [confirmReveal, setConfirmReveal] = useState(false)
  const currentSong = songs[currentSongIndex]

  useEffect(() => { setConfirmReveal(false) }, [currentSongIndex])

  const totalDisplayed = isTiebreaker
    ? `Tiebreaker #${currentSongIndex - songCount + 1}`
    : `Song ${currentSongIndex + 1} of ${songCount}`

  const genreLabel = genre === 'rap' ? 'Rap / Hip-Hop' : genre === 'pop' ? 'Pop' : 'R&B'

  if (!currentSong || isLoading) {
    return (
      <div className="min-h-screen bg-[#1c1c1e] flex items-center justify-center">
        <p className="text-white text-2xl animate-pulse">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1c1c1e] flex flex-col p-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#fc3c44]/8 blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="relative flex justify-between items-center mb-8">
        <span className="text-[#8e8e93] text-xl font-medium uppercase tracking-widest">
          {genreLabel} · {decade}
        </span>
        <span className={`text-2xl font-black ${isTiebreaker ? 'text-yellow-400' : 'text-white'}`}>
          {isTiebreaker && '⚡ '}{totalDisplayed}
        </span>
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center gap-10">
        {/* Audio Player Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#2c2c2e] border border-[#48484a] rounded-3xl p-12 flex flex-col items-center gap-8 w-full max-w-lg shadow-2xl"
        >
          {/* Waveform */}
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 rounded-full ${isPlaying ? 'bg-[#fc3c44]' : 'bg-[#48484a]'}`}
                animate={isPlaying ? { height: [8, Math.random() * 48 + 16, 8] } : { height: 8 }}
                transition={isPlaying ? {
                  duration: 0.4 + Math.random() * 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                } : {}}
              />
            ))}
          </div>

          <p className="text-[#8e8e93] text-xl font-medium">
            {isPlaying ? 'Listen carefully...' : hasPlayed ? 'Replay anytime' : 'Ready to play'}
          </p>

          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={playClip}
            disabled={isPlaying}
            className={`w-40 h-40 rounded-full text-4xl font-black transition-all shadow-2xl ${
              isPlaying
                ? 'bg-[#3a3a3c] text-[#636366] cursor-not-allowed'
                : 'bg-gradient-to-br from-[#fc3c44] to-[#ff6b6b] text-white hover:from-[#e8353d] hover:to-[#ff5555] shadow-red-900/40'
            }`}
          >
            {hasPlayed ? 'REPLAY' : 'PLAY'}
          </motion.button>
        </motion.div>

        {/* Scoreboard */}
        <div className="w-full max-w-lg">
          <h3 className="text-[#636366] text-lg font-semibold uppercase tracking-widest mb-3 text-center">
            Scoreboard
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[...players]
              .sort((a, b) => b.score - a.score)
              .map((player, i) => (
                <div
                  key={player.id}
                  className={`rounded-xl px-4 py-3 flex justify-between items-center border ${
                    i === 0
                      ? 'bg-[#fc3c44]/15 border-[#fc3c44]/40'
                      : 'bg-[#2c2c2e] border-[#48484a]'
                  }`}
                >
                  <span className="text-white text-lg font-semibold truncate">{player.name}</span>
                  <span className={`text-2xl font-black ml-2 ${i === 0 ? 'text-[#fc3c44]' : 'text-[#8e8e93]'}`}>
                    {player.score}
                  </span>
                </div>
              ))}
          </div>
        </div>

        {/* Reveal button */}
        <AnimatePresence mode="wait">
          {!confirmReveal ? (
            <motion.button
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setConfirmReveal(true)}
              className="px-16 py-5 rounded-2xl bg-[#2c2c2e] text-white text-2xl font-black hover:bg-[#3a3a3c] transition-colors border border-[#48484a]"
            >
              REVEAL ANSWER
            </motion.button>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex gap-4 items-center"
            >
              <span className="text-[#8e8e93] text-lg">Are you sure?</span>
              <button
                onClick={reveal}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#fc3c44] to-[#ff6b6b] text-white text-xl font-black hover:from-[#e8353d] hover:to-[#ff5555] transition-all"
              >
                Yes, Reveal
              </button>
              <button
                onClick={() => setConfirmReveal(false)}
                className="px-8 py-4 rounded-xl bg-[#3a3a3c] text-[#f2f2f7] text-xl font-semibold hover:bg-[#48484a] transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
