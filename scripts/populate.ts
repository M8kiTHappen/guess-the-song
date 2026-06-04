import * as dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Artist roster ────────────────────────────────────────────────────────────
// genre is the bucket the artist's songs go into regardless of release decade.
// Decade is assigned automatically from each song's release year.

const ARTISTS: { name: string; genre: 'rap' | 'pop' | 'rnb' }[] = [
  // Rap / Hip-Hop
  { name: '2Pac',                genre: 'rap' },
  { name: 'The Notorious B.I.G.', genre: 'rap' },
  { name: 'Jay-Z',               genre: 'rap' },
  { name: 'Eminem',              genre: 'rap' },
  { name: 'Kanye West',          genre: 'rap' },
  { name: 'Lil Wayne',           genre: 'rap' },
  { name: 'Snoop Dogg',          genre: 'rap' },
  { name: '50 Cent',             genre: 'rap' },
  { name: 'Nicki Minaj',         genre: 'rap' },
  { name: 'Cardi B',             genre: 'rap' },
  { name: 'Lil Baby',            genre: 'rap' },
  { name: '21 Savage',           genre: 'rap' },
  { name: 'Wiz Khalifa',         genre: 'rap' },
  { name: 'Rick Ross',           genre: 'rap' },
  { name: 'Post Malone',         genre: 'rap' },
  { name: 'Drake',               genre: 'rap' },
  { name: 'J. Cole',             genre: 'rap' },
  { name: 'Kendrick Lamar',      genre: 'rap' },
  { name: 'Lil Uzi Vert',        genre: 'rap' },
  { name: 'Travis Scott',        genre: 'rap' },
  { name: 'Gunna',               genre: 'rap' },
  { name: 'Young Thug',          genre: 'rap' },
  { name: 'NBA YoungBoy',        genre: 'rap' },
  { name: 'Future',              genre: 'rap' },
  { name: 'Migos',               genre: 'rap' },

  // Pop
  { name: 'Taylor Swift',        genre: 'pop' },
  { name: 'Ariana Grande',       genre: 'pop' },
  { name: 'Ed Sheeran',          genre: 'pop' },
  { name: 'Justin Bieber',       genre: 'pop' },
  { name: 'Rihanna',             genre: 'pop' },
  { name: 'Beyoncé',             genre: 'pop' },
  { name: 'Katy Perry',          genre: 'pop' },
  { name: 'Lady Gaga',           genre: 'pop' },
  { name: 'Britney Spears',      genre: 'pop' },
  { name: 'Justin Timberlake',   genre: 'pop' },
  { name: 'Adele',               genre: 'pop' },
  { name: 'Mariah Carey',        genre: 'pop' },
  { name: 'Bruno Mars',          genre: 'pop' },
  { name: 'Olivia Rodrigo',      genre: 'pop' },
  { name: 'Dua Lipa',            genre: 'pop' },
  { name: 'Billie Eilish',       genre: 'pop' },
  { name: 'Selena Gomez',        genre: 'pop' },
  { name: 'Christina Aguilera',  genre: 'pop' },
  { name: 'Backstreet Boys',     genre: 'pop' },
  { name: 'Pink',                genre: 'pop' },

  // R&B
  { name: 'The Weeknd',          genre: 'rnb' },
  { name: 'SZA',                 genre: 'rnb' },
  { name: 'Usher',               genre: 'rnb' },
  { name: 'Alicia Keys',         genre: 'rnb' },
  { name: 'Mary J. Blige',       genre: 'rnb' },
  { name: 'John Legend',         genre: 'rnb' },
  { name: 'Aaliyah',             genre: 'rnb' },
  { name: 'TLC',                 genre: 'rnb' },
  { name: 'Whitney Houston',     genre: 'rnb' },
  { name: 'Janet Jackson',       genre: 'rnb' },
  { name: 'H.E.R.',              genre: 'rnb' },
  { name: 'Chris Brown',         genre: 'rnb' },
  { name: 'Ne-Yo',               genre: 'rnb' },
  { name: 'Boyz II Men',         genre: 'rnb' },
  { name: 'Bryson Tiller',       genre: 'rnb' },
  { name: 'Summer Walker',       genre: 'rnb' },
  { name: 'Miguel',              genre: 'rnb' },
  { name: 'Jhené Aiko',          genre: 'rnb' },
  { name: 'Ciara',               genre: 'rnb' },
  { name: 'Missy Elliott',       genre: 'rnb' },
]

const DECADES = [
  { label: '1990s', start: 1990, end: 1999 },
  { label: '2000s', start: 2000, end: 2009 },
  { label: '2010s', start: 2010, end: 2019 },
  { label: '2020s', start: 2020, end: 2029 },
]

const MIN_DURATION_MS = 90_000

function isLatinScript(text: string): boolean {
  return !/[ᄀ-ᇿ぀-ヿ㐀-鿿가-퟿؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/.test(text)
}

const BLOCKED_PHRASES = [
  'type beat', 'type-beat', 'instrumental', 'beat tape', 'free beat',
  'hip hop beat', 'rap beat', 'trap beat', 'drill beat', 'boom bap',
  'sound kit', 'sample pack', 'loop kit',
]

function isRealSong(title: string): boolean {
  const lower = title.toLowerCase()
  return !BLOCKED_PHRASES.some(p => lower.includes(p))
}

function decadeFor(year: number): string | null {
  const decade = DECADES.find(d => year >= d.start && year <= d.end)
  return decade?.label ?? null
}

interface ItunesTrack {
  trackId:         number
  trackName:       string
  artistName:      string
  collectionName:  string
  artworkUrl100:   string
  previewUrl:      string | null
  releaseDate:     string
  trackTimeMillis: number
  wrapperType:     string
  kind:            string
}

function trunc(s: string, max = 250): string {
  return s?.length > max ? s.slice(0, max) : s
}

async function searchItunes(term: string, useArtistAttribute: boolean): Promise<ItunesTrack[]> {
  const params = new URLSearchParams({
    term,
    media:   'music',
    entity:  'song',
    limit:   '200',
    country: 'US',
    lang:    'en_us',
  })
  if (useArtistAttribute) params.set('attribute', 'artistTerm')
  const res  = await fetch(`https://itunes.apple.com/search?${params}`)
  const data = await res.json()
  return (data.results ?? []).filter((r: ItunesTrack) => r.wrapperType === 'track' && r.kind === 'song')
}

async function fetchArtistSongs(artistName: string): Promise<ItunesTrack[]> {
  // Try with artistTerm attribute first for precision
  let results = await searchItunes(artistName, true)

  // Fall back to general search filtered by artist name (catches iTunes quirks)
  if (results.length === 0) {
    const fallback = await searchItunes(artistName, false)
    const lower    = artistName.toLowerCase()
    results = fallback.filter(t => t.artistName?.toLowerCase().includes(lower))
  }

  return results
}

async function populate() {
  console.log('Clearing existing songs...')
  const { error: clearError } = await supabase
    .from('songs')
    .delete()
    .not('id', 'is', null)

  if (clearError) {
    console.error('Failed to clear:', clearError.message)
    process.exit(1)
  }
  console.log('Cleared.\n')

  // Track inserted IDs globally to avoid cross-artist duplicates
  const insertedTrackIds = new Set<number>()

  for (const artist of ARTISTS) {
    process.stdout.write(`Fetching ${artist.name}...`)

    const tracks = await fetchArtistSongs(artist.name)

    // Group valid tracks by decade
    const byDecade: Record<string, typeof tracks> = {}

    for (const track of tracks) {
      if (insertedTrackIds.has(track.trackId))              continue
      if (!track.previewUrl)                                continue
      if ((track.trackTimeMillis ?? 0) < MIN_DURATION_MS)  continue
      if (!isLatinScript(track.trackName))                  continue
      if (!isLatinScript(track.artistName))                 continue
      if (!isRealSong(track.trackName))                     continue
      if (!track.releaseDate)                               continue

      const year   = new Date(track.releaseDate).getFullYear()
      const decade = decadeFor(year)
      if (!decade) continue

      if (!byDecade[decade]) byDecade[decade] = []
      byDecade[decade].push(track)
    }

    const totalQualifying = Object.values(byDecade).reduce((s, a) => s + a.length, 0)
    console.log(` ${totalQualifying} songs across ${Object.keys(byDecade).length} decades`)

    for (const [decade, decadeTracks] of Object.entries(byDecade)) {
      const rows = decadeTracks.map(t => ({
        spotify_id:   String(t.trackId),
        title:        trunc(t.trackName),
        artist:       trunc(t.artistName),
        album:        trunc(t.collectionName),
        album_art:    t.artworkUrl100.replace('100x100', '600x600'),
        preview_url:  t.previewUrl!,
        genre:        artist.genre,
        decade,
        release_year: new Date(t.releaseDate).getFullYear(),
        popularity:   null,
      }))

      const { error } = await supabase
        .from('songs')
        .upsert(rows, { onConflict: 'spotify_id' })

      if (error) {
        console.error(`  Error inserting ${artist.name} / ${decade}:`, error.message)
      } else {
        rows.forEach(r => insertedTrackIds.add(Number(r.spotify_id)))
      }
    }

    // Respect iTunes rate limits
    await new Promise(r => setTimeout(r, 400))
  }

  console.log('\n─── Summary ───────────────────────────────')
  for (const genre of ['rap', 'pop', 'rnb']) {
    for (const decade of DECADES) {
      const { count } = await supabase
        .from('songs')
        .select('*', { count: 'exact', head: true })
        .eq('genre', genre)
        .eq('decade', decade.label)
      console.log(`  ${genre} / ${decade.label}: ${count ?? 0}`)
    }
  }
  console.log('\nDone.')
}

populate().catch(console.error)
