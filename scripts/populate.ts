import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const GENRES = [
  { label: 'rap',  itunesGenreId: 18,  searchTerms: ['hip hop', 'rap', 'trap', 'drill'] },
  { label: 'pop',  itunesGenreId: 14,  searchTerms: ['pop', 'dance pop', 'teen pop'] },
  { label: 'rnb',  itunesGenreId: 15,  searchTerms: ['r&b', 'soul', 'neo soul', 'contemporary r&b'] },
]

const DECADES = [
  { label: '1990s', start: 1990, end: 1999 },
  { label: '2000s', start: 2000, end: 2009 },
  { label: '2010s', start: 2010, end: 2019 },
  { label: '2020s', start: 2020, end: 2029 },
]

function isLatinScript(text: string): boolean {
  return !/[ᄀ-ᇿ぀-ヿ㐀-鿿가-퟿؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/.test(text)
}

const TARGET_PER_COMBO = 500

interface ItunesTrack {
  trackId: number
  trackName: string
  artistName: string
  collectionName: string
  artworkUrl100: string
  previewUrl: string
  primaryGenreName: string
  releaseDate: string
  trackTimeMillis: number
}

async function fetchItunesTracks(
  searchTerm: string,
  genreId: number,
  limit = 200
): Promise<ItunesTrack[]> {
  const params = new URLSearchParams({
    term:    searchTerm,
    media:   'music',
    entity:  'song',
    genreId: String(genreId),
    limit:   String(limit),
    country: 'US',
    lang:    'en_us',
  })

  const res = await fetch(`https://itunes.apple.com/search?${params}`)
  const data = await res.json()
  return data.results ?? []
}

async function populate() {
  for (const genre of GENRES) {
    for (const decade of DECADES) {
      console.log(`\nFetching ${genre.label} / ${decade.label}...`)

      const seen = new Set<number>()
      const allTracks: ItunesTrack[] = []

      for (const term of genre.searchTerms) {
        const tracks = await fetchItunesTracks(term, genre.itunesGenreId)

        for (const track of tracks) {
          if (seen.has(track.trackId)) continue
          if (!track.previewUrl) continue
          if (!track.releaseDate) continue
          if (!isLatinScript(track.trackName) || !isLatinScript(track.artistName)) continue

          const year = new Date(track.releaseDate).getFullYear()
          if (year < decade.start || year > decade.end) continue

          seen.add(track.trackId)
          allTracks.push(track)
        }

        // Respect iTunes rate limits
        await new Promise(r => setTimeout(r, 300))
      }

      console.log(`  ${allTracks.length} songs found with preview URLs`)

      const rows = allTracks.slice(0, TARGET_PER_COMBO).map(t => ({
        spotify_id:   String(t.trackId),   // reusing column for iTunes track ID
        title:        t.trackName,
        artist:       t.artistName,
        album:        t.collectionName,
        album_art:    t.artworkUrl100.replace('100x100', '600x600'),
        preview_url:  t.previewUrl,
        genre:        genre.label,
        decade:       decade.label,
        release_year: new Date(t.releaseDate).getFullYear(),
        popularity:   null,
      }))

      if (rows.length === 0) {
        console.log(`  No songs found, skipping.`)
        continue
      }

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
