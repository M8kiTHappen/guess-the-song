import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const genre   = searchParams.get('genre')
  const decade  = searchParams.get('decade')
  const count   = parseInt(searchParams.get('count') || '10')
  const exclude = searchParams.get('exclude')?.split(',').filter(Boolean) ?? []

  if (!genre || !decade) {
    return NextResponse.json({ error: 'genre and decade are required' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase
    .from('songs')
    .select('id, title, artist, album, album_art, preview_url, release_year')
    .eq('genre', genre)
    .eq('decade', decade)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const available = (data ?? [])
    .filter(s => !exclude.includes(s.id) && isLatinScript(s.title) && isLatinScript(s.artist) && isRealSong(s.title))
    .sort(() => Math.random() - 0.5)
    .slice(0, count)

  return NextResponse.json(available.map(s => ({
    id:          s.id,
    title:       s.title,
    artist:      s.artist,
    album:       s.album,
    albumArt:    s.album_art,
    previewUrl:  s.preview_url,
    releaseYear: s.release_year,
  })))
}
