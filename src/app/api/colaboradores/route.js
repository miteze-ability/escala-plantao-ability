import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import * as XLSX from 'xlsx'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const full = searchParams.get('full') === '1'

  try {
    let filePath = path.join(process.cwd(), 'data', 'Equipe Ability.xlsx')
    if (!fs.existsSync(filePath)) {
      filePath = path.join(process.cwd(), '..', 'Equipe Ability.xlsx')
    }

    const buffer = fs.readFileSync(filePath)
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(sheet)

    if (full) {
      // Retorna todas as linhas com todos os campos
      const linhas = data.map(r => ({
        re:          String(r['RE Ability'] ?? ''),
        tt:          String(r['TT'] ?? ''),
        colaborador: String(r['Colaborador'] ?? ''),
        gerente:     String(r['Gerente'] ?? ''),
        coordenador: String(r['Coordenador'] ?? ''),
        supervisor:  String(r['Supervisor'] ?? ''),
      })).filter(l => l.colaborador)
      return NextResponse.json({ linhas })
    }

    const colaboradores = [...new Set(data.map(r => r['Colaborador']).filter(Boolean))].sort()
    const supervisores  = [...new Set(data.map(r => r['Supervisor']).filter(Boolean))].sort()
    const reMap = {}
    data.forEach(r => { if (r['Colaborador'] && r['RE Ability']) reMap[r['Colaborador']] = r['RE Ability'] })

    return NextResponse.json({ colaboradores, supervisores, reMap })
  } catch (e) {
    if (full) return NextResponse.json({ linhas: [] }, { status: 200 })
    return NextResponse.json({ colaboradores: [], supervisores: [], reMap: {}, error: e.message }, { status: 200 })
  }
}
