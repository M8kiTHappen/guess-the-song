export interface Player {
  id: string
  name: string
  score: number
}

export interface Song {
  id: string
  title: string
  artist: string
  album: string
  albumArt: string
  previewUrl: string
  releaseYear: number
}

export type Screen = 'setup' | 'playing' | 'reveal' | 'winner'

export interface GameState {
  screen: Screen
  players: Player[]
  genre: string
  decade: string
  songCount: number
  songs: Song[]
  currentSongIndex: number
  awardedThisRound: string[]
  isTiebreaker: boolean
  tiebreakerPlayerIds: string[]
  totalSongsPlayed: number
  winner: Player | null
  earlyWin: boolean
}

export type GameAction =
  | { type: 'GAME_STARTED'; players: Player[]; genre: string; decade: string; songCount: number; songs: Song[] }
  | { type: 'REVEAL' }
  | { type: 'TOGGLE_AWARD'; playerId: string }
  | { type: 'NEXT_SONG'; nextSong?: Song; tiebreakerPlayerIds?: string[] }
  | { type: 'GAME_OVER'; winner: Player; earlyWin: boolean }
  | { type: 'RESET' }

export const GENRES = [
  { label: 'Rap / Hip-Hop', value: 'rap' },
  { label: 'Pop',           value: 'pop' },
  { label: 'R&B',           value: 'rnb' },
] as const

export const DECADES = [
  { label: '1990s', value: '1990s' },
  { label: '2000s', value: '2000s' },
  { label: '2010s', value: '2010s' },
  { label: '2020s', value: '2020s' },
] as const
