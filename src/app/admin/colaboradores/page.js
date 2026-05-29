'use client'
import { useState, useEffect } from 'react'

const COLUNAS = [
  { key: 're',          label: 'RE Ability', width: '100px' },
  { key: 'tt',          label: 'TT',         width: '100px' },
  { key: 'colaborador', label: 'Colaborador', width: '220px' },
  { key: 'gerente',     label: 'Gerente',     width: '200px' },
  { key: 'coordenador', label: 'Coordenador', width: '200px' },
  { key: 'supervisor',  label: 'Supervisor',  width: '200px' },
]

const LINHA_VAZIA = { re: '', tt: '', colaborador: '', gerente: '', coordenador: '', supervisor: '' }
function novoId() { return Date.now() + Math.random() }

export default function Colaboradores() {
  const [autenticado, setAutenticado] = useState(false)
  const [senha, setSenha] = useState('')
  const [erroSenha, setErroSenha] = useState(false)
  const [linhas, setLinhas] = useState([])
  const [editandoId, setEditandoId] = useState(null)   // id da linha em edição
  const [editForm, setEditForm] = useState({})          // valores temporários
  const [busca, setBusca] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === '1') setAutenticado(true)
  }, [])

  useEffect(() => {
    if (!autenticado) return
    try {
      const s = localStorage.getItem('escala_colaboradores')
      if (s) { const p = JSON.parse(s); if (p.length > 0) { setLinhas(p); return } }
    } catch {}
  }, [autenticado])

  const login = () => {
    if (senha === 'ability2026') { sessionStorage.setItem('admin_auth', '1'); setAutenticado(true) }
    else { setErroSenha(true); setSenha('') }
  }

  const salvarStorage = (lista) => {
    try { localStorage.setItem('escala_colaboradores', JSON.stringify(lista)) } catch {}
  }

  const mostrarMsg = (texto) => { setMsg(texto); setTimeout(() => setMsg(''), 3000) }

  // ── Adicionar linha ──────────────────────────────────────────────────────
  const adicionarLinha = () => {
    const nova = { ...LINHA_VAZIA, _id: novoId() }
    const novas = [...linhas, nova]
    setLinhas(novas)
    setEditandoId(nova._id)
    setEditForm({ ...LINHA_VAZIA })
  }

  // ── Iniciar edição ───────────────────────────────────────────────────────
  const iniciarEdicao = (linha) => {
    setEditandoId(linha._id)
    setEditForm({ ...linha })
  }

  // ── Confirmar edição ─────────────────────────────────────────────────────
  const confirmarEdicao = () => {
    const novas = linhas.map(l => l._id === editandoId ? { ...editForm, _id: editandoId } : l)
    setLinhas(novas)
    salvarStorage(novas)
    setEditandoId(null)
    mostrarMsg('✓ Colaborador salvo!')
  }

  // ── Cancelar edição ──────────────────────────────────────────────────────
  const cancelarEdicao = () => {
    // Se a linha estava vazia (nova), remove
    const linha = linhas.find(l => l._id === editandoId)
    if (linha && !linha.colaborador && !linha.re) {
      setLinhas(linhas.filter(l => l._id !== editandoId))
    }
    setEditandoId(null)
  }

  // ── Excluir ──────────────────────────────────────────────────────────────
  const excluir = (id) => {
    if (!confirm('Excluir este colaborador?')) return
    const novas = linhas.filter(l => l._id !== id)
    setLinhas(novas)
    salvarStorage(novas)
    mostrarMsg('Colaborador removido.')
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
        {msg && <span className="text-xs text-green-400 font-medium">{msg}</span>}
        <button onClick={adicionarLinha}
          className="ml-auto text-xs bg-red-700 hover:bg-red-600 text-white font-semibold px-4 py-1.5 rounded-lg transition-colors">
          + Novo Colaborador
        </button>
      </div>

      {/* TABELA */}
      <main className="px-6 py-6">
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
                      // ── Modo edição: inputs ───────────────────────────────
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
                          <button onClick={confirmarEdicao}
                            className="text-xs bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded mr-1 transition-colors">
                            ✓ OK
                          </button>
                          <button onClick={cancelarEdicao}
                            className="text-xs bg-zinc-600 hover:bg-zinc-500 text-white px-2 py-1 rounded transition-colors">
                            ✕
                          </button>
                        </td>
                      </>
                    ) : (
                      // ── Modo leitura ──────────────────────────────────────
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

        {linhas.length > 0 && (
          <p className="text-xs text-zinc-600 mt-3">
            {busca ? `${linhasFiltradas.length} de ${linhas.length} resultado(s)` : `${linhas.length} colaborador(es) · As alterações são salvas automaticamente ao confirmar cada linha.`}
          </p>
        )}
      </main>
    </div>
  )
}
