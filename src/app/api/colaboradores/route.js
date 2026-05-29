import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

// ─── GET /api/colaboradores ─────────────────────────────────────────────────
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const full = searchParams.get('full') === '1'
  const db   = supabaseAdmin()

  const { data, error } = await db
    .from('colaboradores')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    const vazio = full
      ? { linhas: [] }
      : { colaboradores: [], supervisores: [], reMap: {}, error: error.message }
    return NextResponse.json(vazio, { status: 200 })
  }

  const rows = data ?? []

  if (full) {
    const linhas = rows
      .filter(r => r.colaborador)
      .map(r => ({
        _id:         r.id,
        re:          String(r.re          ?? ''),
        tt:          String(r.tt          ?? ''),
        colaborador: String(r.colaborador ?? ''),
        localidade:  String(r.localidade  ?? ''),
        gerente:     String(r.gerente     ?? ''),
        coordenador: String(r.coordenador ?? ''),
        supervisor:  String(r.supervisor  ?? ''),
      }))
    return NextResponse.json({ linhas })
  }

  const colaboradores = [...new Set(rows.map(r => r.colaborador).filter(Boolean))].sort()
  const supervisores  = [...new Set(rows.map(r => r.supervisor ).filter(Boolean))].sort()
  const reMap = {}
  const locMap = {}
  rows.forEach(r => { 
    if (r.colaborador) {
      if (r.re) reMap[r.colaborador] = r.re 
      if (r.localidade) locMap[r.colaborador] = r.localidade
    }
  })

  return NextResponse.json({ colaboradores, supervisores, reMap, locMap })
}

// ─── POST /api/colaboradores ─────────────────────────────────────────────────
export async function POST(request) {
  const body = await request.json()
  const db   = supabaseAdmin()

  const { data, error } = await db
    .from('colaboradores')
    .insert([{
      re:          body.re          ?? '',
      tt:          body.tt          ?? '',
      colaborador: body.colaborador ?? '',
      localidade:  body.localidade  ?? '',
      gerente:     body.gerente     ?? '',
      coordenador: body.coordenador ?? '',
      supervisor:  body.supervisor  ?? '',
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ colaborador: { ...data, _id: data.id } }, { status: 201 })
}

// ─── PUT /api/colaboradores?id=xxx ───────────────────────────────────────────
export async function PUT(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const body = await request.json()
  const db   = supabaseAdmin()

  const { data, error } = await db
    .from('colaboradores')
    .update({
      re:          body.re          ?? '',
      tt:          body.tt          ?? '',
      colaborador: body.colaborador ?? '',
      localidade:  body.localidade  ?? '',
      gerente:     body.gerente     ?? '',
      coordenador: body.coordenador ?? '',
      supervisor:  body.supervisor  ?? '',
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ colaborador: { ...data, _id: data.id } })
}

// ─── DELETE /api/colaboradores?id=xxx ────────────────────────────────────────
export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const db = supabaseAdmin()
  const { error } = await db.from('colaboradores').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
