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

  const [players, setPlayers]   = useState<Player[]>([{ id: generateId(), name: '', score: 0 }])
  const [genre, setGenre]       = useState('')
  const [decade, setDecade]     = useState('')
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
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl"
      >
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black tracking-tight text-white mb-2">
            GUESS THE SONG
          </h1>
          <p className="text-zinc-400 text-xl">Pick your settings and get ready</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Players */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
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
                    className="flex-1 bg-zinc-800 text-white placeholder-zinc-500 rounded-xl px-4 py-3 text-lg outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  {players.length > 1 && (
                    <button
                      onClick={() => removePlayer(player.id)}
                      className="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-red-900 hover:text-red-300 transition-colors text-lg font-bold"
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
                className="w-full py-3 rounded-xl border-2 border-dashed border-zinc-700 text-zinc-500 hover:border-purple-500 hover:text-purple-400 transition-colors text-lg font-medium"
              >
                + Add Player
              </button>
            )}
          </div>

          {/* Settings */}
          <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800 space-y-6">
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
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
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
                        ? 'bg-purple-600 text-white'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
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
                <span className="text-4xl font-black text-purple-400">{songCount}</span>
              </div>
              <input
                type="range"
                min={5}
                max={25}
                value={songCount}
                onChange={e => setSongCount(Number(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-zinc-500 text-sm mt-1">
                <span>5</span><span>25</span>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {(nameError || error) && (
          <p className="text-center text-red-400 text-lg mt-4">{nameError || error}</p>
        )}

        {/* Start */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleStart}
          disabled={!canStart}
          className={`w-full mt-8 py-5 rounded-2xl text-2xl font-black tracking-wide transition-all ${
            canStart
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-900/40'
              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Loading songs...' : 'START GAME'}
        </motion.button>
      </motion.div>
    </div>
  )
}
