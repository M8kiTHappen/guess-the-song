'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '@/context/GameContext'
import { GENRES, DECADES } from '@/types/game'
import type { Player } from '@/types/game'

function generateId() {
  return Math.random().toString(36).slice(2)
}

export default function SetupScreen() {
  const { startGame, isLoading, error } = useGame()

  const [players, setPlayers]     = useState<Player[]>([{ id: generateId(), name: '', score: 0 }])
  const [genre, setGenre]         = useState('')
  const [decade, setDecade]       = useState('')
  const [songCount, setSongCount] = useState(10)
  const [nameError, setNameError] = useState('')

  const addPlayer = () => {
    if (players.length >= 10) return
    setPlayers(prev => [...prev, { id: generateId(), name: '', score: 0 }])
  }

  const removePlayer = (id: string) => {
    if (players.length <= 1) return
    setPlayers(prev => prev.filter(p => p.id !== id))
  }

  const updateName = (id: string, name: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name } : p))
    setNameError('')
  }

  const handleStart = async () => {
    const named = players.filter(p => p.name.trim())
    if (named.length === 0) { setNameError('Add at least one player name.'); return }
    if (!genre)  { setNameError('Select a genre.'); return }
    if (!decade) { setNameError('Select a decade.'); return }
    await startGame(named.map(p => ({ ...p, name: p.name.trim() })), genre, decade, songCount)
  }

  const canStart = players.some(p => p.name.trim()) && genre && decade && !isLoading

  return (
    <div className="min-h-screen bg-[#1c1c1e] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#fc3c44]/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#fc3c44]/5 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl relative"
      >
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black tracking-tight text-white mb-2">
            GUESS THE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fc3c44] to-[#ff6b6b]">
              SONG
            </span>
          </h1>
          <p className="text-[#8e8e93] text-xl">Pick your settings and get ready</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Players */}
          <div className="bg-[#2c2c2e] rounded-2xl p-6 border border-[#48484a]">
            <h2 className="text-2xl font-bold text-white mb-4">Players</h2>
            <div className="space-y-3 mb-4">
              {players.map((player, i) => (
                <div key={player.id} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={`Player ${i + 1}`}
                    value={player.name}
                    onChange={e => updateName(player.id, e.target.value)}
                    maxLength={20}
                    className="flex-1 bg-[#3a3a3c] text-white placeholder-[#636366] rounded-xl px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-[#fc3c44]"
                  />
                  {players.length > 1 && (
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="px-4 py-3 rounded-xl bg-[#3a3a3c] text-[#8e8e93] hover:bg-red-900/40 hover:text-red-400 transition-colors text-lg font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            {players.length < 10 && (
              <button
                onClick={addPlayer}
                className="w-full py-3 rounded-xl border-2 border-dashed border-[#48484a] text-[#636366] hover:border-[#fc3c44] hover:text-[#fc3c44] transition-colors text-lg font-medium"
              >
                + Add Player
              </button>
            )}
          </div>

          {/* Settings */}
          <div className="bg-[#2c2c2e] rounded-2xl p-6 border border-[#48484a] space-y-6">
            {/* Genre */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Genre</h2>
              <div className="grid grid-cols-1 gap-2">
                {GENRES.map(g => (
                  <button
                    key={g.value}
                    onClick={() => setGenre(g.value)}
                    className={`py-3 px-4 rounded-xl text-lg font-semibold transition-all text-left ${
                      genre === g.value
                        ? 'bg-gradient-to-r from-[#fc3c44] to-[#ff6b6b] text-white shadow-lg shadow-red-900/30'
                        : 'bg-[#3a3a3c] text-[#f2f2f7] hover:bg-[#48484a]'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Decade */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Decade</h2>
              <div className="grid grid-cols-2 gap-2">
                {DECADES.map(d => (
                  <button
                    key={d.value}
                    onClick={() => setDecade(d.value)}
                    className={`py-3 rounded-xl text-lg font-semibold transition-all ${
                      decade === d.value
                        ? 'bg-gradient-to-r from-[#fc3c44] to-[#ff6b6b] text-white shadow-lg shadow-red-900/30'
                        : 'bg-[#3a3a3c] text-[#f2f2f7] hover:bg-[#48484a]'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Song Count */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-2xl font-bold text-white">Songs</h2>
                <span className="text-4xl font-black text-[#fc3c44]">{songCount}</span>
              </div>
              <input
                type="range"
                min={5}
                max={25}
                value={songCount}
                onChange={e => setSongCount(Number(e.target.value))}
                className="w-full accent-[#fc3c44]"
              />
              <div className="flex justify-between text-[#636366] text-sm mt-1">
                <span>5</span><span>25</span>
              </div>
            </div>
          </div>
        </div>

        {(nameError || error) && (
          <p className="text-center text-red-400 text-lg mt-4">{nameError || error}</p>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleStart}
          disabled={!canStart}
          className={`w-full mt-8 py-5 rounded-2xl text-2xl font-black tracking-wide transition-all ${
            canStart
              ? 'bg-gradient-to-r from-[#fc3c44] to-[#ff6b6b] text-white hover:from-[#e8353d] hover:to-[#ff5555] shadow-xl shadow-red-900/40'
              : 'bg-[#3a3a3c] text-[#636366] cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Loading songs...' : 'START GAME'}
        </motion.button>
      </motion.div>
    </div>
  )
}
