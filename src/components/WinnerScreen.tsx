'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useGame } from '@/context/GameContext'

export default function WinnerScreen() {
  const { state, reset } = useGame()
  const { winner, players, genre, decade, totalSongsPlayed, songCount, earlyWin } = state

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  useEffect(() => {
    // Initial burst
    confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } })

    // Follow-up bursts from sides
    const t1 = setTimeout(() => confetti({ particleCount: 100, angle: 60,  spread: 55, origin: { x: 0 } }), 400)
    const t2 = setTimeout(() => confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1 } }), 700)
    const t3 = setTimeout(() => confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } }), 1200)

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const genreLabel = genre === 'rap' ? 'Rap / Hip-Hop' : genre === 'pop' ? 'Pop' : 'R&B'
  const songsLabel = earlyWin
    ? `Game ended after ${totalSongsPlayed} of ${songCount} songs`
    : `${totalSongsPlayed} songs played`

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/20 via-transparent to-pink-950/20 pointer-events-none" />

      <div className="relative w-full max-w-3xl flex flex-col items-center gap-10">
        {/* Winner announcement */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.1 }}
          className="text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-zinc-400 text-2xl font-semibold uppercase tracking-[0.3em] mb-4"
          >
            {earlyWin ? 'Unbeatable — Game Over!' : 'Champion'}
          </motion.p>

          <motion.h1
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 150, damping: 18 }}
            className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 leading-none mb-4"
          >
            {winner?.name}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-zinc-500 text-xl"
          >
            {genreLabel} · {decade} · {songsLabel}
          </motion.p>
        </motion.div>

        {/* Final leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-zinc-400 uppercase tracking-widest">Final Scores</h2>
          </div>
          <div className="divide-y divide-zinc-800">
            {sortedPlayers.map((player, i) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.08 }}
                className={`flex items-center justify-between px-6 py-4 ${
                  i === 0 ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/20' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className={`text-2xl font-black w-8 ${
                    i === 0 ? 'text-yellow-400' : i === 1 ? 'text-zinc-400' : i === 2 ? 'text-orange-600' : 'text-zinc-600'
                  }`}>
                    {i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `${i + 1}th`}
                  </span>
                  <span className="text-white text-2xl font-bold">{player.name}</span>
                </div>
                <span className={`text-3xl font-black ${i === 0 ? 'text-purple-300' : 'text-zinc-400'}`}>
                  {player.score}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex gap-4 w-full"
        >
          <button
            onClick={reset}
            className="flex-1 py-5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-black hover:from-purple-500 hover:to-pink-500 transition-all shadow-lg shadow-purple-900/40"
          >
            PLAY AGAIN
          </button>
          <button
            onClick={reset}
            className="flex-1 py-5 rounded-2xl bg-zinc-800 text-zinc-300 text-xl font-bold hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            NEW GAME
          </button>
        </motion.div>
      </div>
    </div>
  )
}
