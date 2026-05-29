import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseClient'

// ─── GET /api/escalas ───────────────────────────────────────────────────────
export async function GET() {
  const db = supabaseAdmin()
  const { data, error } = await db
    .from('escalas')
    .select('*')
    .order('data_inicio', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Normaliza campos do banco (snake_case) para o formato que o front-end espera (camelCase)
  const entradas = (data ?? []).map(row => ({
    id:           row.id,
    colaboradores: row.colaboradores ?? [],
    supervisor:   row.supervisor ?? '',
    setor:        row.setor ?? '',
    dataInicio:   row.data_inicio ?? '',
    dataFim:      row.data_fim ?? '',
    horaInicio:   row.hora_inicio ?? '',
    horaFim:      row.hora_fim ?? '',
    tipo:         row.tipo ?? 'Tecnico',
    dataInsercao: row.data_insercao ? new Date(row.data_insercao).getTime() : null,
  }))

  return NextResponse.json({ entradas })
}

// ─── POST /api/escalas ──────────────────────────────────────────────────────
export async function POST(request) {
  const body = await request.json()
  const db = supabaseAdmin()

  const { data, error } = await db
    .from('escalas')
    .insert([{
      colaboradores: body.colaboradores ?? [],
      supervisor:    body.supervisor ?? '',
      setor:         body.setor ?? '',
      data_inicio:   body.dataInicio,
      data_fim:      body.dataFim,
      hora_inicio:   body.horaInicio ?? '08:00',
      hora_fim:      body.horaFim    ?? '17:00',
      tipo:          body.tipo       ?? 'Tecnico',
    }])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    entrada: {
      id:           data.id,
      colaboradores: data.colaboradores,
      supervisor:   data.supervisor,
      setor:        data.setor,
      dataInicio:   data.data_inicio,
      dataFim:      data.data_fim,
      horaInicio:   data.hora_inicio,
      horaFim:      data.hora_fim,
      tipo:         data.tipo,
      dataInsercao: data.data_insercao ? new Date(data.data_insercao).getTime() : null,
    }
  }, { status: 201 })
}

// ─── PUT /api/escalas?id=xxx ────────────────────────────────────────────────
export async function PUT(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const body = await request.json()
  const db = supabaseAdmin()

  const { data, error } = await db
    .from('escalas')
    .update({
      colaboradores: body.colaboradores ?? [],
      supervisor:    body.supervisor ?? '',
      setor:         body.setor ?? '',
      data_inicio:   body.dataInicio,
      data_fim:      body.dataFim,
      hora_inicio:   body.horaInicio ?? '08:00',
      hora_fim:      body.horaFim    ?? '17:00',
      tipo:          body.tipo       ?? 'Tecnico',
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    entrada: {
      id:           data.id,
      colaboradores: data.colaboradores,
      supervisor:   data.supervisor,
      setor:        data.setor,
      dataInicio:   data.data_inicio,
      dataFim:      data.data_fim,
      horaInicio:   data.hora_inicio,
      horaFim:      data.hora_fim,
      tipo:         data.tipo,
      dataInsercao: data.data_insercao ? new Date(data.data_insercao).getTime() : null,
    }
  })
}

// ─── DELETE /api/escalas?id=xxx ─────────────────────────────────────────────
export async function DELETE(request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const db = supabaseAdmin()
  const { error } = await db.from('escalas').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
