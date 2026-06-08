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

  // Reset confirm state when song changes
  useEffect(() => { setConfirmReveal(false) }, [currentSongIndex])

  const totalDisplayed = isTiebreaker
    ? `Tiebreaker #${currentSongIndex - songCount + 1}`
    : `Song ${currentSongIndex + 1} of ${songCount}`

  const genreLabel = genre === 'rap' ? 'Rap / Hip-Hop' : genre === 'pop' ? 'Pop' : 'R&B'

  if (!currentSong || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-white text-2xl animate-pulse">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <span className="text-zinc-400 text-xl font-medium uppercase tracking-widest">
          {genreLabel} · {decade}
        </span>
        <span className={`text-2xl font-black ${isTiebreaker ? 'text-yellow-400' : 'text-white'}`}>
          {isTiebreaker && '⚡ '}{totalDisplayed}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-10">
        {/* Audio Player */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 flex flex-col items-center gap-8 w-full max-w-lg"
        >
          {/* Waveform indicator */}
          <div className="flex items-end gap-1 h-16">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className={`w-2 rounded-full ${isPlaying ? 'bg-purple-500' : 'bg-zinc-700'}`}
                animate={isPlaying ? { height: [8, Math.random() * 48 + 16, 8] } : { height: 8 }}
                transition={isPlaying ? {
                  duration: 0.4 + Math.random() * 0.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                } : {}}
              />
            ))}
          </div>

          <p className="text-zinc-400 text-xl font-medium">
            {isPlaying ? 'Listen carefully...' : hasPlayed ? 'Replay anytime' : 'Ready to play'}
          </p>

          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={playClip}
            disabled={isPlaying}
            className={`w-40 h-40 rounded-full text-4xl font-black transition-all shadow-2xl ${
              isPlaying
                ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                : 'bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
            }`}
          >
            {hasPlayed ? 'REPLAY' : 'PLAY'}
          </motion.button>
        </motion.div>

        {/* Scoreboard */}
        <div className="w-full max-w-lg">
          <h3 className="text-zinc-500 text-lg font-semibold uppercase tracking-widest mb-3 text-center">
            Scoreboard
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[...players]
              .sort((a, b) => b.score - a.score)
              .map((player, i) => (
                <div
                  key={player.id}
                  className={`rounded-xl px-4 py-3 flex justify-between items-center ${
                    i === 0 ? 'bg-purple-900/40 border border-purple-700' : 'bg-zinc-900 border border-zinc-800'
                  }`}
                >
                  <span className="text-white text-lg font-semibold truncate">{player.name}</span>
                  <span className={`text-2xl font-black ml-2 ${i === 0 ? 'text-purple-300' : 'text-zinc-300'}`}>
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
              className="px-16 py-5 rounded-2xl bg-zinc-800 text-white text-2xl font-black hover:bg-zinc-700 transition-colors border border-zinc-700"
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
              <span className="text-zinc-400 text-lg">Are you sure?</span>
              <button
                onClick={reveal}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-black hover:from-purple-500 hover:to-pink-500 transition-all"
              >
                Yes, Reveal
              </button>
              <button
                onClick={() => setConfirmReveal(false)}
                className="px-8 py-4 rounded-xl bg-zinc-800 text-zinc-300 text-xl font-semibold hover:bg-zinc-700 transition-colors"
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
