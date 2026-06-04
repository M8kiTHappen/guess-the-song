import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GENRES = [
  { label: 'rap',  spotifyGenre: 'hip-hop' },
  { label: 'pop',  spotifyGenre: 'pop'     },
  { label: 'rnb',  spotifyGenre: 'r-n-b'   },
]

const DECADES = [
  { label: '1990s', years: '1990-1999' },
  { label: '2000s', years: '2000-2009' },
  { label: '2010s', years: '2010-2019' },
  { label: '2020s', years: '2020-2029' },
]

const TARGET_PER_COMBO = 500
const FETCH_PER_COMBO  = 700  // fetch more to compensate for missing preview_urls
const PAGE_SIZE        = 50

async function getSpotifyToken(): Promise<string> {
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  return data.access_token
}

async function fetchSongs(
  token: string,
  genre: string,
  years: string,
  offset: number
): Promise<SpotifyTrack[]> {
  const params = new URLSearchParams({
    q:      `genre:${genre} year:${years}`,
    type:   'track',
    limit:  String(PAGE_SIZE),
    offset: String(offset),
  })
  const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await res.json()
  return data.tracks?.items ?? []
}

interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: { name: string; images: { url: string }[] }
  preview_url: string | null
  popularity: number
  album_release_date: string
}

async function populate() {
  const token = await getSpotifyToken()

  for (const genre of GENRES) {
    for (const decade of DECADES) {
      console.log(`\nFetching ${genre.label} / ${decade.label}...`)

      const allTracks: SpotifyTrack[] = []
      const pages = Math.ceil(FETCH_PER_COMBO / PAGE_SIZE)

      for (let page = 0; page < pages; page++) {
        const offset = page * PAGE_SIZE
        const tracks = await fetchSongs(token, genre.spotifyGenre, decade.years, offset)
        allTracks.push(...tracks)
        // Respect Spotify rate limits
        await new Promise(r => setTimeout(r, 200))
      }

      const withPreviews = allTracks
        .filter(t => t.preview_url)
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, TARGET_PER_COMBO)

      console.log(`  ${withPreviews.length} songs with preview URLs (from ${allTracks.length} fetched)`)

      const rows = withPreviews.map(t => ({
        spotify_id:   t.id,
        title:        t.name,
        artist:       t.artists[0]?.name ?? 'Unknown',
        album:        t.album.name,
        album_art:    t.album.images[0]?.url ?? null,
        preview_url:  t.preview_url!,
        genre:        genre.label,
        decade:       decade.label,
        release_year: parseInt(t.album_release_date?.split('-')[0] ?? '0'),
        popularity:   t.popularity,
      }))

      const { error } = await supabase
        .from('songs')
        .upsert(rows, { onConflict: 'spotify_id' })

      if (error) {
        console.error(`  Error inserting ${genre.label}/${decade.label}:`, error.message)
      } else {
        console.log(`  Inserted/updated ${rows.length} songs`)
      }
    }
  }

  console.log('\nDone.')
}

populate().catch(console.error)
