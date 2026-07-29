#!/usr/bin/env node
/**
 * One-command dev launcher: runs the backend (:3000) and frontend (:4000)
 * together with no external dependency. Use `npm run dev` from the repo root.
 *
 *   - Backend  → backend/  (nodemon + babel-node)  → http://localhost:3000
 *   - Frontend → frontend/ (vite)                  → http://localhost:4000
 *
 * Output from each process is prefixed [BE]/[FE]. Ctrl+C stops both.
 */
import { spawn } from 'node:child_process'
import process from 'node:process'

const isWin = process.platform === 'win32'
const npm = isWin ? 'npm.cmd' : 'npm'

const procs = [
  { name: 'BE', color: '\x1b[36m', cwd: 'backend' },
  { name: 'FE', color: '\x1b[32m', cwd: 'frontend' }
]

const RESET = '\x1b[0m'
const children = []

function prefix(name, color, line) {
  if (line.trim() === '') return
  process.stdout.write(`${color}[${name}]${RESET} ${line}\n`)
}

for (const p of procs) {
  const child = spawn(npm, ['run', 'dev'], {
    cwd: new URL(`./${p.cwd}/`, import.meta.url),
    shell: isWin, // needed so npm.cmd resolves on Windows
    env: process.env
  })
  child.stdout.on('data', d => String(d).split(/\r?\n/).forEach(l => prefix(p.name, p.color, l)))
  child.stderr.on('data', d => String(d).split(/\r?\n/).forEach(l => prefix(p.name, p.color, l)))
  child.on('exit', code => {
    prefix(p.name, p.color, `process exited with code ${code}`)
  })
  children.push(child)
}

function shutdown() {
  for (const c of children) {
    try { c.kill('SIGTERM') } catch { /* ignore */ }
  }
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

console.log('\x1b[1mD-Shiftify dev\x1b[0m — backend :3000 + frontend :4000 (Ctrl+C to stop)\n')
