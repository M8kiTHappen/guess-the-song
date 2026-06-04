'use client'

import { createContext, useContext, useReducer, useState, useCallback } from 'react'
import type { GameState, GameAction, Player, Song } from '@/types/game'

const initialState: GameState = {
  screen:               'setup',
  players:              [],
  genre:                '',
  decade:               '',
  songCount:            10,
  songs:                [],
  currentSongIndex:     0,
  awardedThisRound:     [],
  isTiebreaker:         false,
  tiebreakerPlayerIds:  [],
  totalSongsPlayed:     0,
  winner:               null,
  earlyWin:             false,
}

function applyAwards(players: Player[], awarded: string[]): Player[] {
  return players.map(p => ({
    ...p,
    score: awarded.includes(p.id) ? p.score + 1 : p.score,
  }))
}

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'GAME_STARTED':
      return {
        ...initialState,
        screen:    'playing',
        players:   action.players,
        genre:     action.genre,
        decade:    action.decade,
        songCount: action.songCount,
        songs:     action.songs,
      }

    case 'REVEAL':
      return { ...state, screen: 'reveal' }

    case 'TOGGLE_AWARD': {
      const awarded = state.awardedThisRound.includes(action.playerId)
        ? state.awardedThisRound.filter(id => id !== action.playerId)
        : [...state.awardedThisRound, action.playerId]
      return { ...state, awardedThisRound: awarded }
    }

    case 'NEXT_SONG': {
      const players  = applyAwards(state.players, state.awardedThisRound)
      const songs    = action.nextSong ? [...state.songs, action.nextSong] : state.songs
      return {
        ...state,
        screen:               'playing',
        players,
        songs,
        currentSongIndex:     state.currentSongIndex + 1,
        awardedThisRound:     [],
        isTiebreaker:         action.tiebreakerPlayerIds ? true : state.isTiebreaker,
        tiebreakerPlayerIds:  action.tiebreakerPlayerIds ?? state.tiebreakerPlayerIds,
        totalSongsPlayed:     state.totalSongsPlayed + 1,
      }
    }

    case 'GAME_OVER': {
      const players = applyAwards(state.players, state.awardedThisRound)
      return {
        ...state,
        screen:           'winner',
        players,
        awardedThisRound: [],
        winner:           action.winner,
        earlyWin:         action.earlyWin,
        totalSongsPlayed: state.totalSongsPlayed + 1,
      }
    }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

async function fetchSongs(genre: string, decade: string, count: number, exclude: string[] = []): Promise<Song[]> {
  const params = new URLSearchParams({ genre, decade, count: String(count) })
  if (exclude.length) params.set('exclude', exclude.join(','))
  const res = await fetch(`/api/songs?${params}`)
  if (!res.ok) throw new Error('Failed to fetch songs')
  return res.json()
}

interface GameContextValue {
  state:       GameState
  isLoading:   boolean
  error:       string | null
  startGame:   (players: Player[], genre: string, decade: string, songCount: number) => Promise<void>
  reveal:      () => void
  toggleAward: (playerId: string) => void
  nextSong:    () => Promise<void>
  reset:       () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch]   = useReducer(reducer, initialState)
  const [isLoading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const startGame = useCallback(async (
    players: Player[], genre: string, decade: string, songCount: number
  ) => {
    setLoading(true)
    setError(null)
    try {
      const songs = await fetchSongs(genre, decade, songCount)
      if (songs.length === 0) throw new Error('No songs found for that genre and decade.')
      dispatch({ type: 'GAME_STARTED', players, genre, decade, songCount, songs })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }, [])

  const reveal = useCallback(() => dispatch({ type: 'REVEAL' }), [])

  const toggleAward = useCallback((playerId: string) => {
    dispatch({ type: 'TOGGLE_AWARD', playerId })
  }, [])

  const nextSong = useCallback(async () => {
    const { players, songs, currentSongIndex, awardedThisRound, isTiebreaker,
            tiebreakerPlayerIds, genre, decade } = state

    const updatedPlayers = applyAwards(players, awardedThisRound)
    const nextIndex      = currentSongIndex + 1
    const playedIds      = songs.map(s => s.id)

    if (isTiebreaker) {
      const tbPlayers   = updatedPlayers.filter(p => tiebreakerPlayerIds.includes(p.id))
      const maxTbScore  = Math.max(...tbPlayers.map(p => p.score))
      const stillTied   = tbPlayers.filter(p => p.score === maxTbScore)

      if (stillTied.length === 1) {
        dispatch({ type: 'GAME_OVER', winner: stillTied[0], earlyWin: false })
      } else {
        setLoading(true)
        try {
          const [tbSong] = await fetchSongs(genre, decade, 1, playedIds)
          dispatch({ type: 'NEXT_SONG', nextSong: tbSong, tiebreakerPlayerIds })
        } catch { setError('Failed to fetch tiebreaker song.') }
        finally { setLoading(false) }
      }
      return
    }

    if (nextIndex >= songs.length) {
      const maxScore = Math.max(...updatedPlayers.map(p => p.score))
      const leaders  = updatedPlayers.filter(p => p.score === maxScore)

      if (leaders.length === 1) {
        dispatch({ type: 'GAME_OVER', winner: leaders[0], earlyWin: false })
      } else {
        setLoading(true)
        try {
          const [tbSong] = await fetchSongs(genre, decade, 1, playedIds)
          dispatch({ type: 'NEXT_SONG', nextSong: tbSong, tiebreakerPlayerIds: leaders.map(p => p.id) })
        } catch { setError('Failed to fetch tiebreaker song.') }
        finally { setLoading(false) }
      }
      return
    }

    // Check early termination
    const remaining = songs.length - nextIndex
    const maxScore  = Math.max(...updatedPlayers.map(p => p.score))
    const canWin    = updatedPlayers.filter(p => p.score + remaining >= maxScore)

    if (canWin.length === 1) {
      dispatch({ type: 'GAME_OVER', winner: canWin[0], earlyWin: true })
    } else {
      dispatch({ type: 'NEXT_SONG' })
    }
  }, [state])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return (
    <GameContext.Provider value={{ state, isLoading, error, startGame, reveal, toggleAward, nextSong, reset }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
