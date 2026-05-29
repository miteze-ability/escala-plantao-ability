'use client'
import { useState, useEffect } from 'react'

const FERIADOS = [
  '2026-01-01','2026-04-21','2026-05-01','2026-09-07',
  '2026-10-12','2026-11-02','2026-11-15','2026-11-20','2026-12-25',
  '2026-02-16','2026-02-17','2026-02-18','2026-04-03','2026-06-04',
]

const SETORES = ['CLD','Fibra Óptica','Dados','Implantação']

const SETOR_CONFIG = {
  'CLD':          { cor: '#dc2626', borda: '#7f1d1d', icone: '🖥️',  desc: 'Escritório · Monitoramento' },
  'Fibra Óptica': { cor: '#f97316', borda: '#7c2d12', icone: '🔧',  desc: 'Campo · Manutenção de Falhas' },
  'Implantação':  { cor: '#eab308', borda: '#713f12', icone: '🏗️',  desc: 'Campo · Novas Redes' },
  'Dados':        { cor: '#22c55e', borda: '#14532d', icone: '📡',  desc: 'Campo · Configuração e Reparos' },
}

function calcularHoras(entrada) {
  if (!entrada.horaInicio || !entrada.horaFim || !entrada.dataInicio) return 0
  const inicio = new Date(`${entrada.dataInicio}T${entrada.horaInicio}:00`)
  const fimData = entrada.dataFim || entrada.dataInicio
  const fim    = new Date(`${fimData}T${entrada.horaFim}:00`)
  let diffMs = fim - inicio
  // Se fim <= início significa que virou a meia-noite no mesmo dia (ex: 22:00→06:00)
  if (diffMs <= 0) diffMs += 24 * 60 * 60 * 1000
  return diffMs / (1000 * 60 * 60)
}

function formatHoras(total) {
  const h = Math.floor(total)
  const m = Math.round((total - h) * 60)
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function pad(n) { return String(n).padStart(2, '0') }
function formatDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${pad(day)}/${pad(m)}/${y}`
}
function hoje() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
}
function dentroDoIntervalo(entrada, de, ate) {
  if (!de && !ate) return true
  const ini = entrada.dataInicio
  const fim = entrada.dataFim || entrada.dataInicio
  if (de && ate) return ini <= ate && fim >= de
  if (de) return fim >= de
  if (ate) return ini <= ate
  return true
}

function CardPlantao({ entrada }) {
  const cols = entrada.colaboradores ?? (entrada.colaborador ? [entrada.colaborador] : [])
  const isFeriado = FERIADOS.includes(entrada.dataInicio)
  const cfg = SETOR_CONFIG[entrada.setor] ?? SETOR_CONFIG['CLD']

  return (
    <div className="rounded-lg border p-4 flex flex-col gap-3 text-sm"
      style={{ background: 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)', borderColor: cfg.borda }}>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
          ${entrada.localidade === 'Capital'  ? 'bg-blue-900 text-blue-200' :
            entrada.localidade === 'Interior' ? 'bg-green-900 text-green-200' :
            'bg-zinc-700 text-zinc-300'}`}>
          {entrada.localidade}
        </span>
        {isFeriado && <span className="text-red-400 text-xs font-semibold">★ Feriado</span>}
      </div>

      <div>
        <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
          {cols.length > 1 ? `${cols.length} Colaboradores` : 'Colaborador'}
        </p>
        <div className="flex flex-col gap-0.5">
          {cols.map((c, i) => (
            <span key={i} className="text-white font-semibold text-sm leading-5">• {c}</span>
          ))}
        </div>
      </div>

      {entrada.supervisor && (
        <div>
          <p className="text-xs text-zinc-400 uppercase tracking-wide mb-0.5">Supervisor</p>
          <p className="text-zinc-200 font-medium">{entrada.supervisor}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 pt-1 border-t" style={{ borderColor: cfg.borda }}>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide" translate="no">Data Plantão Início</p>
          <p className="text-zinc-200 font-mono text-sm">{formatDate(entrada.dataInicio)}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wide" translate="no">Data Plantão Fim</p>
          <p className="text-zinc-200 font-mono text-sm">{formatDate(entrada.dataFim)}</p>
        </div>
        <div className="col-span-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wide" translate="no">Horário Plantão</p>
          <p className="text-zinc-200 font-mono text-sm">{entrada.horaInicio} → {entrada.horaFim}</p>
        </div>
      </div>
    </div>
  )
}

function ColunaSetor({ setor, entradas }) {
  const cfg = SETOR_CONFIG[setor]
  const totalColabs = entradas.reduce((acc, e) => {
    const c = e.colaboradores ?? (e.colaborador ? [e.colaborador] : [])
    return acc + c.length
  }, 0)
  const totalHorasSetor = entradas.reduce((acc, e) => {
    const nColabs = (e.colaboradores ?? (e.colaborador ? [e.colaborador] : [])).length
    return acc + calcularHoras(e) * nColabs
  }, 0)

  return (
    <div className="flex flex-col min-w-0">
      <div className="rounded-t-xl px-4 py-3 mb-3" style={{ background: 'linear-gradient(135deg, #09090b 0%, #52525b 100%)', borderBottom: `3px solid ${cfg.cor}` }}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">{cfg.icone}</span>
            <div>
              <h2 className="font-bold text-white text-sm uppercase tracking-wide">{setor}</h2>
              <p className="text-xs text-zinc-300">{cfg.desc}</p>
            </div>
          </div>
          {totalHorasSetor > 0 && (
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-white leading-tight" translate="no">{formatHoras(totalHorasSetor)}</p>
              <p className="text-xs text-zinc-300" translate="no">em plantão</p>
            </div>
          )}
        </div>
        <div className="mt-2 flex gap-3 text-xs">
          <span className="bg-black/40 text-white font-medium px-2 py-0.5 rounded-full" translate="no">
            {entradas.length} {entradas.length === 1 ? 'plantão' : 'plantões'}
          </span>
          <span className="bg-black/40 text-white font-medium px-2 py-0.5 rounded-full" translate="no">
            {totalColabs} {totalColabs === 1 ? 'colaborador' : 'colaboradores'}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {entradas.length === 0 && (
          <div className="rounded-lg border border-zinc-600 px-4 py-6 text-center" style={{background:'linear-gradient(135deg,#27272a,#52525b)'}}>
            <p className="text-zinc-300 text-sm">Nenhum plantão no período</p>
          </div>
        )}
        {entradas.map(e => <CardPlantao key={e.id} entrada={e} />)}
      </div>
    </div>
  )
}

// ─── Tabela de técnicos ───────────────────────────────────────────────────
function TabelaTecnicos({ tecnicos, reMap }) {
  const [filtroSetor, setFiltroSetor] = useState('Todos')
  const [ordemDias, setOrdemDias] = useState('desc')

  const BADGE = {
    'CLD': 'bg-red-700', 'Fibra Óptica': 'bg-orange-700',
    'Dados': 'bg-green-800', 'Implantação': 'bg-yellow-700',
  }

  const lista = tecnicos
    .filter(t => filtroSetor === 'Todos' || t.setor === filtroSetor)
    .sort((a, b) => ordemDias === 'desc' ? b.dias - a.dias : a.dias - b.dias)

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <span className="w-1 h-6 bg-red-600 rounded-full shrink-0" />
        <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-800" translate="no">
          Técnicos em Plantão · {lista.length} {lista.length === 1 ? 'colaborador' : 'colaboradores'}
        </h2>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-zinc-500" translate="no">Setor:</span>
          <select
            value={filtroSetor}
            onChange={e => setFiltroSetor(e.target.value)}
            className="bg-white border border-zinc-300 text-zinc-700 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-red-500 shadow-sm"
          >
            <option value="Todos">Todos</option>
            {SETORES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-300 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr style={{background: 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)'}}>
              <th className="px-4 py-3 text-left text-white font-bold text-xs uppercase tracking-wide" translate="no">Técnico</th>
              <th className="px-4 py-3 text-left text-white font-bold text-xs uppercase tracking-wide" translate="no">RE</th>
              <th className="px-4 py-3 text-left text-white font-bold text-xs uppercase tracking-wide" translate="no">Setor</th>
              <th className="px-4 py-3 text-left text-white font-bold text-xs uppercase tracking-wide" translate="no">Zona</th>
              <th
                className="px-4 py-3 text-left text-white font-bold text-xs uppercase tracking-wide cursor-pointer select-none whitespace-nowrap"
                translate="no"
                onClick={() => setOrdemDias(o => o === 'desc' ? 'asc' : 'desc')}
              >
                <span className="flex items-center gap-1">
                  Dias no Período
                  <span className="text-base leading-none">{ordemDias === 'desc' ? '↓' : '↑'}</span>
                </span>
              </th>
              <th className="px-4 py-3 text-left text-white font-bold text-xs uppercase tracking-wide" translate="no">Obs</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-zinc-400 text-xs bg-white">Nenhum técnico neste setor.</td></tr>
            )}
            {lista.map((t, idx) => (
              <tr key={t.nome}
                className={`border-t border-zinc-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50'} hover:bg-zinc-100 transition-colors`}>
                <td className="px-4 py-2.5 font-semibold text-zinc-800 text-xs">{t.nome}</td>
                <td className="px-4 py-2.5 text-zinc-500 font-mono text-xs">{reMap[t.nome] ?? '—'}</td>
                <td className="px-4 py-2.5">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium text-white ${BADGE[t.setor] ?? 'bg-zinc-600'}`}>
                    {t.setor}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-zinc-600 text-xs">{t.localidade}</td>
                <td className="px-4 py-2.5 text-center">
                  <span className="inline-block bg-zinc-800 text-white font-bold text-xs px-3 py-0.5 rounded-full" translate="no">
                    {t.dias}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-zinc-500 text-xs">{t.obs}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function Home() {
  const [entradas, setEntradas] = useState([])
  const [filtroDe, setFiltroDe] = useState('')
  const [filtroAte, setFiltroAte] = useState('')
  const [reMap, setReMap] = useState({})

  useEffect(() => {
    // Carrega plantões
    try { const s = localStorage.getItem('escala_entradas'); if (s) setEntradas(JSON.parse(s)) } catch {}

    // Carrega reMap de colaboradores
    try {
      const s = localStorage.getItem('escala_colaboradores')
      if (s) {
        const lista = JSON.parse(s)
        const map = {}
        lista.forEach(l => { if (l.colaborador && l.re) map[l.colaborador] = l.re })
        setReMap(map)
      } else {
        // Fallback API (xlsx)
        fetch('/api/colaboradores').then(r => r.json()).then(d => setReMap(d.reMap || {})).catch(() => {})
      }
    } catch {}

    // Atualiza quando admin salvar em outra aba
    const onStorage = (e) => {
      if (e.key === 'escala_entradas') {
        try { setEntradas(JSON.parse(e.newValue || '[]')) } catch {}
      }
      if (e.key === 'escala_colaboradores') {
        try {
          const lista = JSON.parse(e.newValue || '[]')
          const map = {}
          lista.forEach(l => { if (l.colaborador && l.re) map[l.colaborador] = l.re })
          setReMap(map)
        } catch {}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const hoje_str = hoje()
  const entradasFiltradas = entradas.filter(e => dentroDoIntervalo(e, filtroDe, filtroAte))

  const porSetor = SETORES.reduce((acc, s) => {
    acc[s] = entradasFiltradas
      .filter(e => e.setor === s)
      .sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))
    return acc
  }, {})

  const totalGeral = entradasFiltradas.reduce((acc, e) => {
    const c = e.colaboradores ?? (e.colaborador ? [e.colaborador] : [])
    return acc + c.length
  }, 0)

  const totalHoras = entradasFiltradas.reduce((acc, e) => {
    const nColabs = (e.colaboradores ?? (e.colaborador ? [e.colaborador] : [])).length
    return acc + calcularHoras(e) * nColabs
  }, 0)

  const filtroAtivo = filtroDe || filtroAte

  // ── Monta linhas da tabela de técnicos ──────────────────────────────────
  const tabelaTecnicos = (() => {
    const mapa = {} // nome → { setor, localidade, dias, obs[] }
    entradasFiltradas.forEach(e => {
      const cols = e.colaboradores ?? (e.colaborador ? [e.colaborador] : [])
      // calcula quantos dias este plantão ocupa no período filtrado
      const dIni = new Date((filtroDe && e.dataInicio < filtroDe ? filtroDe : e.dataInicio) + 'T00:00:00')
      const dFim = new Date((filtroAte && (e.dataFim||e.dataInicio) > filtroAte ? filtroAte : (e.dataFim||e.dataInicio)) + 'T00:00:00')
      const dias = Math.max(1, Math.round((dFim - dIni) / 86400000) + 1)
      const obs = `${formatDate(e.dataInicio)}${e.dataFim && e.dataFim !== e.dataInicio ? ' a ' + formatDate(e.dataFim) : ''} ${e.horaInicio}–${e.horaFim}`
      cols.forEach(nome => {
        if (!mapa[nome]) mapa[nome] = { setor: e.setor, localidade: e.localidade, dias: 0, obsList: [] }
        mapa[nome].dias += dias
        mapa[nome].obsList.push(obs)
      })
    })
    return Object.entries(mapa)
      .map(([nome, v]) => ({ nome, ...v, obs: v.obsList.join(' | ') }))
      .sort((a, b) => a.nome.localeCompare(b.nome))
  })()

  return (
    <div className="min-h-screen bg-zinc-200 text-zinc-100 font-sans">

      {/* HEADER */}
      <header className="border-b border-zinc-300 px-6 py-4 shadow-sm" style={{background: 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)'}}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-1 h-10 bg-red-600 rounded-full inline-block" />
            <div>
              <h1 className="text-lg font-bold tracking-wide text-white uppercase leading-tight">
                Escala de Plantão
              </h1>
              <p className="text-xs text-zinc-400">Operação Ability · Vtal · 24h</p>
            </div>
          </div>

          <div className="flex gap-5 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{entradasFiltradas.length}</p>
              <p className="text-xs text-zinc-300 font-medium" translate="no">Escalas</p>
            </div>
            <div className="w-px bg-zinc-600" />
            <div>
              <p className="text-2xl font-bold text-white">{totalGeral}</p>
              <p className="text-xs text-zinc-300 font-medium" translate="no">Em Escala</p>
            </div>
            <div className="w-px bg-zinc-600" />
            <div>
              <p className="text-2xl font-bold text-white">{SETORES.length}</p>
              <p className="text-xs text-zinc-300 font-medium" translate="no">Setores</p>
            </div>
            <div className="w-px bg-zinc-600" />
            <div>
              <p className="text-2xl font-bold text-white">{formatHoras(totalHoras)}</p>
              <p className="text-xs text-zinc-300 font-medium" translate="no">Total de Horas</p>
            </div>
          </div>

          <a href="/admin" className="text-xs text-zinc-400 hover:text-white border border-zinc-600 px-3 py-1.5 rounded-lg transition-colors" translate="no">
            ⚙ Gerenciar
          </a>
        </div>
      </header>

      {/* FILTRO DE DATA */}
      <div className="border-b border-zinc-300 px-6 py-3" style={{background: 'linear-gradient(135deg, #27272a 0%, #52525b 100%)'}}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-zinc-200 uppercase tracking-wide font-bold">📅 Período:</span>

          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-300 font-medium">De</label>
            <input type="date" value={filtroDe} onChange={e => setFiltroDe(e.target.value)}
              className="bg-zinc-700 border border-zinc-600 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-red-500" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-zinc-300 font-medium">Até</label>
            <input type="date" value={filtroAte} onChange={e => setFiltroAte(e.target.value)}
              className="bg-zinc-700 border border-zinc-600 text-white text-sm rounded px-3 py-1.5 focus:outline-none focus:border-red-500" />
          </div>

          {filtroAtivo && (
            <button onClick={() => { setFiltroDe(''); setFiltroAte('') }}
              className="text-xs text-red-300 hover:text-red-200 font-medium transition-colors">
              ✕ Limpar filtro
            </button>
          )}

          <div className="flex gap-2 ml-2">
            {[
              { label: 'Hoje', de: hoje_str, ate: hoje_str },
              { label: 'Esta semana',
                de: (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` })(),
                ate: (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 6); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` })() },
              { label: 'Este mês',
                de: `${new Date().getFullYear()}-${pad(new Date().getMonth()+1)}-01`,
                ate: (() => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(new Date(d.getFullYear(), d.getMonth()+1, 0).getDate())}` })() },
            ].map(a => (
              <button key={a.label} onClick={() => { setFiltroDe(a.de); setFiltroAte(a.ate) }}
                className={`text-xs px-3 py-1 rounded-full border transition-colors font-medium
                  ${filtroDe === a.de && filtroAte === a.ate
                    ? 'bg-red-700 border-red-600 text-white'
                    : 'border-zinc-500 text-zinc-200 hover:border-zinc-300 hover:text-white'}`}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GRID DE SETORES */}
      <main className="px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {SETORES.map(s => (
            <ColunaSetor key={s} setor={s} entradas={porSetor[s]} />
          ))}
        </div>

        {entradas.length === 0 && (
          <div className="text-center mt-16">
            <p className="text-zinc-600 text-lg">Nenhum plantão cadastrado.</p>
            <p className="text-zinc-700 text-sm mt-1">Acesse <a href="/admin" className="text-red-600 underline">Gerenciar</a> para inserir plantões.</p>
          </div>
        )}

        {/* ── TABELA DE TÉCNICOS ── */}
        {tabelaTecnicos.length > 0 && (
          <TabelaTecnicos tecnicos={tabelaTecnicos} reMap={reMap} />
        )}
      </main>
    </div>
  )
}
