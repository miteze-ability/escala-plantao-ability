'use client'
import { useState, useEffect, useCallback } from 'react'

const COLUNAS = [
  { key: 're',          label: 'RE Ability', width: '100px' },
  { key: 'tt',          label: 'TT',         width: '100px' },
  { key: 'colaborador', label: 'Colaborador', width: '220px' },
  { key: 'gerente',     label: 'Gerente',     width: '200px' },
  { key: 'coordenador', label: 'Coordenador', width: '200px' },
  { key: 'supervisor',  label: 'Supervisor',  width: '200px' },
]

const LINHA_VAZIA = { re: '', tt: '', colaborador: '', gerente: '', coordenador: '', supervisor: '' }

export default function Colaboradores() {
  const [autenticado, setAutenticado]   = useState(false)
  const [senha, setSenha]               = useState('')
  const [erroSenha, setErroSenha]       = useState(false)
  const [linhas, setLinhas]             = useState([])
  const [editandoId, setEditandoId]     = useState(null)
  const [editForm, setEditForm]         = useState({})
  const [busca, setBusca]               = useState('')
  const [msg, setMsg]                   = useState({ texto: '', tipo: 'ok' })
  const [loading, setLoading]           = useState(true)
  const [salvando, setSalvando]         = useState(false)

  const mostrarMsg = (texto, tipo = 'ok') => {
    setMsg({ texto, tipo })
    setTimeout(() => setMsg({ texto: '', tipo: 'ok' }), 3000)
  }

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === '1') setAutenticado(true)
  }, [])

  // ── Carrega colaboradores do Supabase ────────────────────────────────────
  const carregarColaboradores = useCallback(async () => {
    try {
      const res  = await fetch('/api/colaboradores?full=1')
      const json = await res.json()
      setLinhas(json.linhas ?? [])
    } catch {
      mostrarMsg('Erro ao carregar colaboradores', 'erro')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!autenticado) return
    carregarColaboradores()
  }, [autenticado, carregarColaboradores])

  const login = () => {
    if (senha === 'ability2026') { sessionStorage.setItem('admin_auth', '1'); setAutenticado(true) }
    else { setErroSenha(true); setSenha('') }
  }

  // ── Adicionar linha nova (envia ao Supabase) ─────────────────────────────
  const adicionarLinha = () => {
    // Cria uma linha temporária com _id falso para edição inline
    const tempId = `temp_${Date.now()}`
    setLinhas(prev => [...prev, { ...LINHA_VAZIA, _id: tempId }])
    setEditandoId(tempId)
    setEditForm({ ...LINHA_VAZIA })
  }

  // ── Iniciar edição ───────────────────────────────────────────────────────
  const iniciarEdicao = (linha) => {
    setEditandoId(linha._id)
    setEditForm({ ...linha })
  }

  // ── Confirmar edição ─────────────────────────────────────────────────────
  const confirmarEdicao = async () => {
    setSalvando(true)
    try {
      const isNova = String(editandoId).startsWith('temp_')

      if (isNova) {
        // POST — cria no Supabase
        const res  = await fetch('/api/colaboradores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)

        // Substitui a linha temporária pelo registro real
        setLinhas(prev => prev.map(l =>
          l._id === editandoId ? { ...json.colaborador, _id: json.colaborador.id } : l
        ))
      } else {
        // PUT — atualiza no Supabase
        const res  = await fetch(`/api/colaboradores?id=${editandoId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editForm),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error)

        setLinhas(prev => prev.map(l =>
          l._id === editandoId ? { ...json.colaborador, _id: json.colaborador.id } : l
        ))
      }

      mostrarMsg('✓ Colaborador salvo!')
      setEditandoId(null)
    } catch (err) {
      mostrarMsg(`Erro: ${err.message}`, 'erro')
    } finally {
      setSalvando(false)
    }
  }

  // ── Cancelar edição ──────────────────────────────────────────────────────
  const cancelarEdicao = () => {
    // Remove a linha temporária se for nova
    if (String(editandoId).startsWith('temp_')) {
      setLinhas(prev => prev.filter(l => l._id !== editandoId))
    }
    setEditandoId(null)
  }

  // ── Excluir ──────────────────────────────────────────────────────────────
  const excluir = async (id) => {
    if (!confirm('Excluir este colaborador?')) return
    try {
      const res = await fetch(`/api/colaboradores?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao excluir')
      setLinhas(prev => prev.filter(l => l._id !== id))
      mostrarMsg('Colaborador removido.')
    } catch (err) {
      mostrarMsg(`Erro: ${err.message}`, 'erro')
    }
  }

  const linhasFiltradas = linhas.filter(l =>
    !busca || Object.values(l).some(v => String(v).toLowerCase().includes(busca.toLowerCase()))
  )

  // ── Login ────────────────────────────────────────────────────────────────
  if (!autenticado) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-1 h-8 bg-red-600 rounded-full" />
          <div>
            <h1 className="text-base font-bold text-white uppercase">Gestão de Colaboradores</h1>
            <p className="text-xs text-zinc-500">Ability · Vtal</p>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <input type="password" placeholder="Senha" value={senha}
            onChange={e => { setSenha(e.target.value); setErroSenha(false) }}
            onKeyDown={e => e.key === 'Enter' && login()}
            className={`bg-zinc-800 border rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none
              ${erroSenha ? 'border-red-500' : 'border-zinc-700 focus:border-red-500'}`} />
          {erroSenha && <p className="text-red-400 text-xs">Senha incorreta.</p>}
          <button onClick={login} className="bg-red-700 hover:bg-red-600 text-white font-semibold text-sm py-2 rounded-lg">Entrar</button>
          <a href="/admin" className="text-center text-xs text-zinc-600 hover:text-zinc-400">← Voltar</a>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans">

      {/* TOAST */}
      {msg.texto && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold
          ${msg.tipo === 'erro' ? 'bg-red-700 text-white' : 'bg-green-700 text-white'}`}>
          {msg.texto}
        </div>
      )}

      {/* HEADER */}
      <header className="bg-zinc-900 border-b border-red-800 px-6 py-4 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-1 h-10 bg-red-600 rounded-full" />
            <div>
              <h1 className="text-lg font-bold text-white uppercase tracking-wide">Gestão de Colaboradores</h1>
              <p className="text-xs text-zinc-400">{linhas.length} colaborador{linhas.length !== 1 ? 'es' : ''} cadastrado{linhas.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          <nav className="flex gap-2">
            <a href="/admin" className="text-xs border border-zinc-700 text-zinc-400 hover:text-white px-3 py-2 rounded-lg transition-colors">📋 Escala</a>
            <span className="text-xs border border-red-700 bg-red-700/20 text-red-300 px-3 py-2 rounded-lg">👥 Colaboradores</span>
            <a href="/" className="text-xs border border-zinc-700 text-zinc-400 hover:text-white px-3 py-2 rounded-lg transition-colors">👁 Visualização</a>
          </nav>
        </div>
      </header>

      {/* TOOLBAR */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-3 flex flex-wrap items-center gap-3">
        <input type="text" placeholder="🔍 Buscar colaborador..." value={busca}
          onChange={e => setBusca(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-zinc-100 text-xs rounded px-3 py-1.5 focus:outline-none focus:border-red-500 w-64" />
        <button onClick={adicionarLinha}
          disabled={!!editandoId}
          className="ml-auto text-xs bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-1.5 rounded-lg transition-colors">
          + Novo Colaborador
        </button>
      </div>

      {/* TABELA */}
      <main className="px-6 py-6">
        {loading && <p className="text-zinc-500 text-center py-16 animate-pulse">Carregando colaboradores...</p>}

        {!loading && (
          <div className="overflow-x-auto rounded-lg border border-zinc-800 shadow-lg">
            <table className="text-xs w-full" style={{minWidth: '1000px'}}>
              <thead>
                <tr className="bg-zinc-800">
                  <th className="px-3 py-3 text-left text-zinc-400 font-bold uppercase tracking-wide w-8">#</th>
                  {COLUNAS.map(c => (
                    <th key={c.key} style={{width: c.width}}
                      className="px-3 py-3 text-left text-zinc-400 font-bold uppercase tracking-wide" translate="no">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-center text-zinc-400 font-bold uppercase tracking-wide w-28">Ações</th>
                </tr>
              </thead>
              <tbody>
                {linhasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={COLUNAS.length + 2} className="text-center py-12 text-zinc-600">
                      {busca ? 'Nenhum resultado para a busca.' : 'Nenhum colaborador cadastrado. Clique em "+ Novo Colaborador".'}
                    </td>
                  </tr>
                )}

                {linhasFiltradas.map((linha, idx) => {
                  const emEdicao = editandoId === linha._id
                  return (
                    <tr key={linha._id}
                      className={`border-t border-zinc-800 transition-colors
                        ${emEdicao ? 'bg-zinc-700' : idx % 2 === 0 ? 'bg-zinc-900 hover:bg-zinc-800/60' : 'bg-zinc-950 hover:bg-zinc-800/60'}`}>

                      <td className="px-3 py-2 text-zinc-600 text-center select-none">{idx + 1}</td>

                      {emEdicao ? (
                        <>
                          {COLUNAS.map(col => (
                            <td key={col.key} className="px-2 py-1.5">
                              <input
                                autoFocus={col.key === 'colaborador'}
                                type="text"
                                value={editForm[col.key] ?? ''}
                                onChange={e => setEditForm(f => ({...f, [col.key]: e.target.value}))}
                                onKeyDown={e => { if (e.key === 'Enter') confirmarEdicao(); if (e.key === 'Escape') cancelarEdicao() }}
                                className="w-full bg-zinc-800 border border-zinc-600 text-zinc-100 text-xs rounded px-2 py-1 focus:outline-none focus:border-red-500"
                                placeholder={col.label}
                              />
                            </td>
                          ))}
                          <td className="px-2 py-1.5 text-center whitespace-nowrap">
                            <button onClick={confirmarEdicao} disabled={salvando}
                              className="text-xs bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white px-2 py-1 rounded mr-1 transition-colors flex items-center gap-1 inline-flex">
                              {salvando ? <span className="animate-spin">⟳</span> : '✓'} OK
                            </button>
                            <button onClick={cancelarEdicao}
                              className="text-xs bg-zinc-600 hover:bg-zinc-500 text-white px-2 py-1 rounded transition-colors">
                              ✕
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          {COLUNAS.map(col => (
                            <td key={col.key} className="px-3 py-2.5 text-zinc-300 truncate max-w-0" style={{maxWidth: col.width}}>
                              {col.key === 're' || col.key === 'tt'
                                ? <span className="font-mono text-zinc-400">{linha[col.key] || '—'}</span>
                                : col.key === 'colaborador'
                                ? <span className="font-semibold text-white">{linha[col.key] || '—'}</span>
                                : <span>{linha[col.key] || '—'}</span>}
                            </td>
                          ))}
                          <td className="px-2 py-2.5 text-center whitespace-nowrap">
                            <button onClick={() => iniciarEdicao(linha)}
                              className="text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 px-3 py-1 rounded mr-1.5 transition-colors">
                              ✏️ Editar
                            </button>
                            <button onClick={() => excluir(linha._id)}
                              className="text-xs text-red-700 hover:text-red-400 transition-colors px-1">
                              🗑️
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && linhas.length > 0 && (
          <p className="text-xs text-zinc-600 mt-3">
            {busca ? `${linhasFiltradas.length} de ${linhas.length} resultado(s)` : `${linhas.length} colaborador(es) · Dados salvos no Supabase automaticamente.`}
          </p>
        )}
      </main>
    </div>
  )
}
