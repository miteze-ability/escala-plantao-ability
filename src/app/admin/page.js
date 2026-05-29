'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

// ─── Senha de acesso ───────────────────────────────────────────────────────
const SENHA_ADMIN = 'ability2026'

const FERIADOS = [
  '2026-01-01','2026-04-21','2026-05-01','2026-09-07',
  '2026-10-12','2026-11-02','2026-11-15','2026-11-20','2026-12-25',
  '2026-02-16','2026-02-17','2026-02-18','2026-04-03','2026-06-04',
]

const SETORES    = ['CLD','Fibra Óptica','Implantação','Dados']
const LOCALIDADES = ['Capital','Interior','Escritório']
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
               'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const SETOR_BADGE = {
  'CLD':          'bg-red-700',
  'Fibra Óptica': 'bg-orange-700',
  'Implantação':  'bg-yellow-700',
  'Dados':        'bg-green-800',
}

const HORAS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0')
  const m = i % 2 === 0 ? '00' : '30'
  return `${h}:${m}`
})

const EMPTY_FORM = {
  colaboradores: [], supervisor: '', setor: 'CLD',
  dataInicio: '', dataFim: '',
  horaInicio: '08:00', horaFim: '17:00',
  localidade: 'Capital',
}

function pad(n) { return String(n).padStart(2, '0') }
function formatDate(d) {
  if (!d) return ''
  const [y, m, day] = d.split('-')
  return `${pad(day)}/${pad(m)}/${y}`
}
function formatDatetime(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
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

// ─── Multi-select colaboradores ──────────────────────────────────────────
function MultiSelect({ lista, selecionados, onChange }) {
  const [aberto, setAberto] = useState(false)
  const [busca, setBusca] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setAberto(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const filtrados = lista.filter(c => c.toLowerCase().includes(busca.toLowerCase()))
  const toggle = (n) => onChange(selecionados.includes(n) ? selecionados.filter(x => x !== n) : [...selecionados, n])

  return (
    <div ref={ref} className="relative w-full">
      <div onClick={() => setAberto(v => !v)}
        className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm cursor-pointer flex items-center justify-between min-h-[38px]">
        {selecionados.length === 0
          ? <span className="text-zinc-500">— Selecione colaboradores —</span>
          : <span className="text-zinc-100 font-medium">{selecionados.length} selecionado{selecionados.length > 1 ? 's' : ''}</span>}
        <span className="text-zinc-500 ml-2">{aberto ? '▲' : '▼'}</span>
      </div>
      {selecionados.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selecionados.map(n => (
            <span key={n} className="bg-red-800 text-red-100 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
              {n}
              <button type="button" onClick={() => toggle(n)} className="hover:text-white ml-0.5">×</button>
            </span>
          ))}
        </div>
      )}
      {aberto && (
        <div className="absolute z-50 mt-1 w-full bg-zinc-800 border border-zinc-600 rounded-lg shadow-2xl">
          <div className="px-3 pt-3 pb-2 border-b border-zinc-700">
            <input autoFocus type="text" placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)}
              onClick={e => e.stopPropagation()}
              className="w-full bg-zinc-900 border border-zinc-600 text-zinc-100 text-sm rounded px-3 py-1.5 focus:outline-none focus:border-red-500" />
          </div>
          <div className="px-3 py-2 flex gap-3 border-b border-zinc-700">
            <button type="button" onClick={() => onChange(filtrados)} className="text-xs text-red-400 hover:text-red-300">Todos ({filtrados.length})</button>
            {selecionados.length > 0 && <button type="button" onClick={() => onChange([])} className="text-xs text-zinc-500 hover:text-zinc-300">Limpar</button>}
          </div>
          <div className="overflow-y-auto max-h-56">
            {filtrados.map(n => (
              <label key={n} className="flex items-center gap-3 px-3 py-2 hover:bg-zinc-700 cursor-pointer" onClick={e => e.stopPropagation()}>
                <input type="checkbox" checked={selecionados.includes(n)} onChange={() => toggle(n)} className="accent-red-600 w-4 h-4 shrink-0" />
                <span className="text-sm text-zinc-100">{n}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tela de senha ────────────────────────────────────────────────────────
function TelaLogin({ onLogin }) {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(false)
  const [mostrar, setMostrar] = useState(false)

  const tentar = () => {
    if (senha === SENHA_ADMIN) { onLogin(); setErro(false) }
    else { setErro(true); setSenha('') }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-1 h-8 bg-red-600 rounded-full" />
          <div>
            <h1 className="text-base font-bold text-white uppercase tracking-wide">Área de Gestão</h1>
            <p className="text-xs text-zinc-500">Escala de Plantão · Ability Vtal</p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-zinc-400 uppercase tracking-wide">Senha de Acesso</label>
            <div className="relative">
              <input
                type={mostrar ? 'text' : 'password'}
                value={senha}
                onChange={e => { setSenha(e.target.value); setErro(false) }}
                onKeyDown={e => e.key === 'Enter' && tentar()}
                placeholder="••••••••"
                className={`w-full bg-zinc-800 border rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none pr-10
                  ${erro ? 'border-red-500' : 'border-zinc-700 focus:border-red-500'}`}
              />
              <button type="button" onClick={() => setMostrar(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 text-xs">
                {mostrar ? '🙈' : '👁️'}
              </button>
            </div>
            {erro && <p className="text-red-400 text-xs">Senha incorreta. Tente novamente.</p>}
          </div>

          <button onClick={tentar}
            className="bg-red-700 hover:bg-red-600 text-white font-semibold text-sm py-2 rounded-lg transition-colors w-full">
            Entrar
          </button>

          <a href="/" className="text-center text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            ← Voltar para visualização
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Toast de feedback ─────────────────────────────────────────────────────
function Toast({ msg, tipo }) {
  if (!msg) return null
  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all
      ${tipo === 'erro' ? 'bg-red-700 text-white' : 'bg-green-700 text-white'}`}>
      {msg}
    </div>
  )
}

// ─── Admin principal ──────────────────────────────────────────────────────
export default function Admin() {
  const [autenticado, setAutenticado]   = useState(false)
  const [colaboradores, setColaboradores] = useState([])
  const [supervisores, setSupervisores]   = useState([])
  const [entradas, setEntradas]           = useState([])
  const [form, setForm]                   = useState(EMPTY_FORM)
  const [editId, setEditId]               = useState(null)
  const [modalAberto, setModalAberto]     = useState(false)
  const [filtroSetor, setFiltroSetor]     = useState('Todos')
  const [filtroMes, setFiltroMes]         = useState('')
  const [loading, setLoading]             = useState(true)
  const [salvando, setSalvando]           = useState(false)
  const [toast, setToast]                 = useState({ msg: '', tipo: 'ok' })

  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ msg, tipo })
    setTimeout(() => setToast({ msg: '', tipo: 'ok' }), 3000)
  }

  // Verifica sessão salva
  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === '1') setAutenticado(true)
  }, [])

  // ── Carrega dados do Supabase ────────────────────────────────────────────
  const carregarDados = useCallback(async () => {
    try {
      const [resEscalas, resColabs] = await Promise.all([
        fetch('/api/escalas'),
        fetch('/api/colaboradores'),
      ])
      const { entradas: ent }              = await resEscalas.json()
      const { colaboradores: cols, supervisores: sups } = await resColabs.json()
      setEntradas(ent ?? [])
      setColaboradores(cols ?? [])
      setSupervisores(sups ?? [])
    } catch {
      mostrarToast('Erro ao carregar dados do servidor', 'erro')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!autenticado) return
    carregarDados()
  }, [autenticado, carregarDados])

  const login  = () => { sessionStorage.setItem('admin_auth', '1'); setAutenticado(true) }
  const logout = () => { sessionStorage.removeItem('admin_auth'); setAutenticado(false) }

  const abrirNovo   = () => { setForm(EMPTY_FORM); setEditId(null); setModalAberto(true) }
  const abrirEditar = (e) => {
    const cols = e.colaboradores ?? (e.colaborador ? [e.colaborador] : [])
    setForm({ ...e, colaboradores: cols })
    setEditId(e.id)
    setModalAberto(true)
  }
  const fecharModal = () => { setModalAberto(false); setEditId(null) }

  // ── Submeter (criar ou editar) ───────────────────────────────────────────
  const submeter = async () => {
    if (!form.colaboradores.length || !form.dataInicio || !form.dataFim) return
    setSalvando(true)
    try {
      const isEdit = editId !== null
      const url    = isEdit ? `/api/escalas?id=${editId}` : '/api/escalas'
      const method = isEdit ? 'PUT' : 'POST'

      const res  = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()

      if (!res.ok) throw new Error(json.error || 'Erro desconhecido')

      // Atualiza a lista local
      if (isEdit) {
        setEntradas(prev => prev.map(e => e.id === editId ? json.entrada : e))
      } else {
        setEntradas(prev => [...prev, json.entrada])
      }

      mostrarToast(isEdit ? '✓ Plantão atualizado!' : '✓ Plantão cadastrado!')
      fecharModal()
    } catch (err) {
      mostrarToast(`Erro: ${err.message}`, 'erro')
    } finally {
      setSalvando(false)
    }
  }

  // ── Excluir ──────────────────────────────────────────────────────────────
  const excluir = async (id) => {
    if (!confirm('Excluir este plantão?')) return
    try {
      const res = await fetch(`/api/escalas?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao excluir')
      setEntradas(prev => prev.filter(e => e.id !== id))
      mostrarToast('Plantão excluído.')
    } catch (err) {
      mostrarToast(`Erro: ${err.message}`, 'erro')
    }
  }

  if (!autenticado) return <TelaLogin onLogin={login} />

  const entradasFiltradas = entradas.filter(e => {
    const porSetor = filtroSetor === 'Todos' || e.setor === filtroSetor
    const porMes   = !filtroMes || (e.dataInicio && e.dataInicio.startsWith(`2026-${filtroMes}`))
    return porSetor && porMes
  }).sort((a, b) => a.dataInicio.localeCompare(b.dataInicio))

  const totalColabs = entradasFiltradas.reduce((acc, e) => {
    return acc + (e.colaboradores ?? (e.colaborador ? [e.colaborador] : [])).length
  }, 0)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">
      <Toast msg={toast.msg} tipo={toast.tipo} />

      {/* HEADER */}
      <header className="bg-zinc-900 border-b border-red-800 px-6 py-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-1 h-10 bg-red-600 rounded-full" />
            <div>
              <h1 className="text-lg font-bold text-white uppercase tracking-wide">Gestão de Escala</h1>
              <p className="text-xs text-zinc-400">Área administrativa · Ability Vtal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-4 text-center">
              <div><p className="text-xl font-bold text-white">{entradas.length}</p><p className="text-xs text-zinc-500">Plantões</p></div>
              <div className="w-px bg-zinc-700" />
              <div><p className="text-xl font-bold text-white">{totalColabs}</p><p className="text-xs text-zinc-500">Em escala</p></div>
            </div>
            <button onClick={abrirNovo}
              className="bg-red-700 hover:bg-red-600 text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors whitespace-nowrap">
              + Novo Plantão
            </button>
            <div className="flex gap-2">
              <a href="/admin/colaboradores" className="text-xs text-zinc-400 hover:text-white border border-zinc-700 px-3 py-2 rounded-lg transition-colors">
                👥 Colaboradores
              </a>
              <a href="/" className="text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-700 px-3 py-2 rounded-lg transition-colors">
                👁 Visualização
              </a>
              <button onClick={logout} className="text-xs text-zinc-500 hover:text-red-400 border border-zinc-700 px-3 py-2 rounded-lg transition-colors">
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* FILTROS */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex flex-wrap gap-3 items-center">
        <select className={sel} style={{width:'auto'}} value={filtroSetor} onChange={e => setFiltroSetor(e.target.value)}>
          <option value="Todos">Todos os Setores</option>
          {SETORES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select className={sel} style={{width:'auto'}} value={filtroMes} onChange={e => setFiltroMes(e.target.value)}>
          <option value="">Todos os Meses</option>
          {MESES.map((m, i) => <option key={m} value={String(i+1).padStart(2,'0')}>{m}</option>)}
        </select>
        <span className="text-xs text-zinc-600 ml-auto">
          {entradasFiltradas.length} registro{entradasFiltradas.length !== 1 ? 's' : ''} exibido{entradasFiltradas.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* TABELA */}
      <main className="px-6 py-6">
        {loading && <p className="text-zinc-500 text-center py-16 animate-pulse">Carregando dados do servidor...</p>}

        {!loading && entradasFiltradas.length === 0 && (
          <div className="text-center py-16 text-zinc-600">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-lg font-semibold">Nenhum plantão cadastrado</p>
            <p className="text-sm mt-1">Clique em &quot;+ Novo Plantão&quot; para começar</p>
          </div>
        )}

        {!loading && entradasFiltradas.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-zinc-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-800 text-zinc-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Setor</th>
                  <th className="px-4 py-3 text-left">Colaboradores</th>
                  <th className="px-4 py-3 text-left">Supervisor</th>
                  <th className="px-4 py-3 text-left">Início</th>
                  <th className="px-4 py-3 text-left">Fim</th>
                  <th className="px-4 py-3 text-left">Horário</th>
                  <th className="px-4 py-3 text-left">Localidade</th>
                  <th className="px-4 py-3 text-left text-zinc-600">Inserido em</th>
                  <th className="px-4 py-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {entradasFiltradas.map((e, idx) => {
                  const isFeriado = FERIADOS.includes(e.dataInicio)
                  const cols = e.colaboradores ?? (e.colaborador ? [e.colaborador] : [])
                  return (
                    <tr key={e.id}
                      className={`border-t border-zinc-800 hover:bg-zinc-800/50 transition-colors
                        ${idx % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-950'}
                        ${isFeriado ? 'border-l-2 border-l-red-500' : ''}`}>
                      <td className="px-4 py-3">
                        <span className={`${SETOR_BADGE[e.setor] ?? 'bg-zinc-700'} text-xs px-2 py-0.5 rounded font-medium text-white`}>
                          {e.setor}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          {cols.map((c, i) => <span key={i} className="text-white font-medium text-xs">• {c}</span>)}
                          {cols.length > 1 && <span className="text-zinc-500 text-xs">{cols.length} colaboradores</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-300 text-xs">{e.supervisor}</td>
                      <td className="px-4 py-3 text-zinc-300 font-mono text-xs">
                        {formatDate(e.dataInicio)}
                        {isFeriado && <span className="ml-1 text-red-400">★</span>}
                      </td>
                      <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{formatDate(e.dataFim)}</td>
                      <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{e.horaInicio} – {e.horaFim}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium
                          ${e.localidade === 'Capital'  ? 'bg-blue-900 text-blue-300' :
                            e.localidade === 'Interior' ? 'bg-green-900 text-green-300' :
                            'bg-zinc-700 text-zinc-300'}`}>
                          {e.localidade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-600 text-xs whitespace-nowrap">
                        {formatDatetime(e.dataInsercao)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button onClick={() => abrirEditar(e)} className="text-zinc-400 hover:text-white text-xs mr-3 transition-colors">✏️ Editar</button>
                        <button onClick={() => excluir(e.id)} className="text-red-700 hover:text-red-400 text-xs transition-colors">🗑️ Excluir</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {entradasFiltradas.length > 0 && (
          <p className="text-xs text-zinc-700 mt-3">★ Feriado nacional</p>
        )}
      </main>

      {/* MODAL */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-2xl shadow-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-base font-bold text-white uppercase tracking-wide">
                {editId ? 'Editar Plantão' : 'Novo Plantão'}
              </h2>
              <button onClick={fecharModal} className="text-zinc-500 hover:text-white text-xl leading-none">×</button>
            </div>

            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className={lbl}>Setor</label>
                <select className={sel} value={form.setor} onChange={e => setForm(f => ({...f, setor: e.target.value}))}>
                  {SETORES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={lbl}>Localidade de Atendimento</label>
                <select className={sel} value={form.localidade} onChange={e => setForm(f => ({...f, localidade: e.target.value}))}>
                  {LOCALIDADES.map(l => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className={lbl}>
                  Colaboradores *
                  {form.colaboradores.length > 0 && (
                    <span className="ml-2 bg-red-700 text-white text-xs px-2 py-0.5 rounded-full">
                      {form.colaboradores.length} selecionado{form.colaboradores.length > 1 ? 's' : ''}
                    </span>
                  )}
                </label>
                <MultiSelect lista={colaboradores} selecionados={form.colaboradores}
                  onChange={cols => setForm(f => ({...f, colaboradores: cols}))} />
              </div>
              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className={lbl}>Supervisor</label>
                <select className={sel} value={form.supervisor} onChange={e => setForm(f => ({...f, supervisor: e.target.value}))}>
                  <option value="">— Selecione —</option>
                  {supervisores.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={lbl}>Data Início *</label>
                <input type="date" className={sel} value={form.dataInicio}
                  onChange={e => setForm(f => ({...f, dataInicio: e.target.value}))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={lbl}>Data Fim *</label>
                <input type="date" className={sel} value={form.dataFim}
                  onChange={e => setForm(f => ({...f, dataFim: e.target.value}))} />
              </div>
              <div className="flex flex-col gap-1">
                <label className={lbl}>Hora Início</label>
                <select className={sel} value={form.horaInicio} onChange={e => setForm(f => ({...f, horaInicio: e.target.value}))}>
                  {HORAS.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className={lbl}>Hora Fim</label>
                <select className={sel} value={form.horaFim} onChange={e => setForm(f => ({...f, horaFim: e.target.value}))}>
                  {HORAS.map(h => <option key={h}>{h}</option>)}
                </select>
              </div>

              {/* Data de inserção — só exibe */}
              <div className="flex flex-col gap-1 sm:col-span-2 bg-zinc-800/50 rounded-lg px-3 py-2 border border-zinc-700/50">
                <label className="text-xs text-zinc-600 uppercase tracking-wide">Data de Inserção (automática)</label>
                <p className="text-zinc-500 text-sm font-mono">
                  {editId
                    ? formatDatetime(entradas.find(e => e.id === editId)?.dataInsercao)
                    : formatDatetime(Date.now())}
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-zinc-800 flex justify-end gap-3">
              <button onClick={fecharModal} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Cancelar</button>
              <button onClick={submeter}
                disabled={!form.colaboradores.length || !form.dataInicio || !form.dataFim || salvando}
                className="bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
                {salvando ? <span className="animate-spin">⟳</span> : null}
                {editId ? 'Salvar Alterações' : 'Cadastrar Plantão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const sel = "bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm rounded px-3 py-2 focus:outline-none focus:border-red-500 w-full"
const lbl = "text-xs text-zinc-400 uppercase tracking-wide flex items-center gap-1"
