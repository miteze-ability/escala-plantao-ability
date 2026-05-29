/**
 * Script de importação: Equipe Ability.xlsx → Supabase (tabela colaboradores)
 * Rodar com: node scripts/importar-colaboradores.mjs
 */

import { createClient } from '@supabase/supabase-js'
import * as XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Configuração Supabase ──────────────────────────────────────────────────
const SUPABASE_URL         = 'https://dgbdjewwrmbzlatrwfpa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnYmRqZXd3cm1iemxhdHJ3ZnBhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDA1NjQyMSwiZXhwIjoyMDk1NjMyNDIxfQ.sxRCEoQOLlUiIetmD4fdAiTW6jfknpTX841VTNvA0Ok'

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

// ── Lê o Excel ────────────────────────────────────────────────────────────
const excelPath = path.resolve(__dirname, '..', '..', 'Equipe Ability.xlsx')
console.log(`📂 Lendo arquivo: ${excelPath}`)

if (!fs.existsSync(excelPath)) {
  console.error('❌ Arquivo Excel não encontrado em:', excelPath)
  process.exit(1)
}

const buffer   = fs.readFileSync(excelPath)
const workbook = XLSX.read(buffer, { type: 'buffer' })
const sheet    = workbook.Sheets[workbook.SheetNames[0]]
const data     = XLSX.utils.sheet_to_json(sheet)

console.log(`✅ ${data.length} linhas encontradas no Excel`)

// ── Monta os registros ────────────────────────────────────────────────────
const registros = data
  .filter(r => r['Colaborador'])  // só linhas com nome
  .map(r => ({
    re:          String(r['RE Ability'] ?? '').trim(),
    tt:          String(r['TT']          ?? '').trim(),
    colaborador: String(r['Colaborador'] ?? '').trim(),
    gerente:     String(r['Gerente']     ?? '').trim(),
    coordenador: String(r['Coordenador'] ?? '').trim(),
    supervisor:  String(r['Supervisor']  ?? '').trim(),
  }))

console.log(`📋 ${registros.length} colaboradores válidos para importar`)

// ── Limpa a tabela antes de importar (evita duplicatas) ───────────────────
console.log('🧹 Limpando tabela colaboradores (DELETE sem filtro)...')
// Usar delete sem filtro — no Supabase com RLS desabilitado funciona passando um filtro sempre-verdadeiro
const { error: deleteError } = await db.from('colaboradores').delete().gte('id', 1)
if (deleteError) {
  console.warn(`⚠️  Aviso ao limpar: ${deleteError.message}`)
  console.log('ℹ️  Continuando a inserção mesmo assim...')
} else {
  console.log('✅ Tabela limpa!')
}

// ── Insere em lotes de 50 ─────────────────────────────────────────────────
const LOTE = 50
let inseridos = 0

for (let i = 0; i < registros.length; i += LOTE) {
  const lote = registros.slice(i, i + LOTE)
  const { error } = await db.from('colaboradores').insert(lote)

  if (error) {
    console.error(`❌ Erro ao inserir lote ${i}–${i + LOTE}:`, error.message)
    process.exit(1)
  }

  inseridos += lote.length
  process.stdout.write(`\r⏳ Importando... ${inseridos}/${registros.length}`)
}

console.log(`\n\n🎉 Importação concluída! ${inseridos} colaboradores inseridos no Supabase.`)
