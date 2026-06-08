'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGame } from '@/context/GameContext'

export default function RevealScreen() {
  const { state, toggleAward, nextSong, isLoading } = useGame()
  const { players, songs, currentSongIndex, awardedThisRound, isTiebreaker, tiebreakerPlayerIds } = state

  const [visible, setVisible] = useState(false)
  const [currentSong] = useState(() => songs[currentSongIndex])

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 350)
    return () => clearTimeout(t)
  }, [])

  if (!currentSong) return null

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  return (
    <div className="min-h-screen bg-[#1c1c1e] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fc3c44]/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#fc3c44]/5 blur-[140px] pointer-events-none" />

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full max-w-4xl flex flex-col items-center gap-8"
          >
            {isTiebreaker && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-yellow-400 text-2xl font-black uppercase tracking-widest"
              >
                ⚡ Tiebreaker
              </motion.div>
            )}

            {/* Album art */}
            <motion.div
              initial={{ y: -60, opacity: 0, scale: 0.85 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="relative"
            >
              {currentSong.albumArt ? (
                <img
                  src={currentSong.albumArt}
                  alt={currentSong.album}
                  className="w-64 h-64 rounded-2xl object-cover shadow-2xl"
                />
              ) : (
                <div className="w-64 h-64 rounded-2xl bg-[#2c2c2e] flex items-center justify-center shadow-2xl">
                  <span className="text-6xl text-[#636366]">♪</span>
                </div>
              )}
              {/* Red glow ring */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-[#fc3c44]/40 to-transparent blur-md -z-10" />
            </motion.div>

            {/* Song info */}
            <div className="text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-5xl font-black text-white leading-tight mb-2"
              >
                {currentSong.title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-2xl text-[#8e8e93] font-medium"
              >
                {currentSong.artist}
                {currentSong.releaseYear ? ` · ${currentSong.releaseYear}` : ''}
              </motion.p>
            </div>

            {/* Award points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="w-full"
            >
              <p className="text-center text-[#636366] text-lg mb-4 font-medium">
                Tap everyone who got it right
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {sortedPlayers.map(player => {
                  const awarded    = awardedThisRound.includes(player.id)
                  const isTbPlayer = isTiebreaker && tiebreakerPlayerIds.includes(player.id)
                  return (
                    <button
                      key={player.id}
                      onClick={() => toggleAward(player.id)}
                      className={`rounded-xl px-4 py-4 flex flex-col items-center gap-1 transition-all border-2 ${
                        awarded
                          ? 'bg-green-700 border-green-500 text-white scale-105 shadow-lg shadow-green-900/40'
                          : isTbPlayer
                            ? 'bg-yellow-900/30 border-yellow-600 text-yellow-200 hover:bg-yellow-900/50'
                            : 'bg-[#2c2c2e] border-[#48484a] text-[#f2f2f7] hover:border-[#fc3c44]/50'
                      }`}
                    >
                      <span className="text-3xl font-black">{player.score}{awarded ? '+1' : ''}</span>
                      <span className="text-base font-semibold truncate w-full text-center">{player.name}</span>
                      {isTbPlayer && !awarded && (
                        <span className="text-xs text-yellow-400 font-medium">Tiebreaker</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>

            {/* Next Song */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              whileTap={{ scale: 0.97 }}
              onClick={nextSong}
              disabled={isLoading}
              className="px-16 py-5 rounded-2xl bg-gradient-to-r from-[#fc3c44] to-[#ff6b6b] text-white text-2xl font-black hover:from-[#e8353d] hover:to-[#ff5555] transition-all shadow-xl shadow-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Loading...' : 'NEXT SONG'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
