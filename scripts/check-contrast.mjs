#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// jocaibe color contrast checker — WCAG 2.1 AA/AAA compliance
//
// Usage:
//   node scripts/check-contrast.mjs                      # default CSS path
//   node scripts/check-contrast.mjs app/styles/globals.css
//
// Exit 0 = all required pairs pass AA
// Exit 1 = one or more pairs fail
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'fs'
import { resolve, relative } from 'path'

// ── Terminal colors ───────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  red:    '\x1b[31m',
  yellow: '\x1b[33m',
  green:  '\x1b[32m',
  cyan:   '\x1b[36m',
  white:  '\x1b[37m',
}
const bold  = s => `${C.bold}${s}${C.reset}`
const dim   = s => `${C.dim}${s}${C.reset}`
const red   = s => `${C.red}${s}${C.reset}`
const yel   = s => `${C.yellow}${s}${C.reset}`
const grn   = s => `${C.green}${s}${C.reset}`
const cyan  = s => `${C.cyan}${s}${C.reset}`

// ── WCAG math ─────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  const n = parseInt(hex.slice(0, 6), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function toLinear(c8) {
  const c = c8 / 255
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function relativeLuminance([r, g, b]) {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hexToRgb(hex1))
  const l2 = relativeLuminance(hexToRgb(hex2))
  const [lo, hi] = l1 < l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * @param {'normal'|'large'|'ui'} type
 *   normal — body text (<18px regular, <14px bold): AA=4.5, AAA=7
 *   large  — large text (≥18px regular or ≥14px bold): AA=3, AAA=4.5
 *   ui     — UI components, icons, borders: AA=3, no AAA
 */
function wcagLevel(ratio, type = 'normal') {
  if (type === 'normal') {
    if (ratio >= 7)   return 'AAA'
    if (ratio >= 4.5) return 'AA'
    if (ratio >= 3)   return 'AA-large'  // passes large-text AA only
    return 'FAIL'
  }
  if (type === 'large') {
    if (ratio >= 4.5) return 'AAA'
    if (ratio >= 3)   return 'AA'
    return 'FAIL'
  }
  if (type === 'ui') {
    if (ratio >= 3) return 'AA'
    return 'FAIL'
  }
}

// ── CSS token parser ──────────────────────────────────────────────────────────
function parseHexTokens(css) {
  const tokens = {}
  // Match: --token-name: #hex3 or #hex6 (skip rgba, vars, etc.)
  const re = /--([a-zA-Z0-9-]+)\s*:\s*(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})\b/g
  let m
  while ((m = re.exec(css)) !== null) {
    // Only keep the first occurrence (base :root values, not variant overrides)
    const key = `--${m[1]}`
    if (!tokens[key]) tokens[key] = m[2].toUpperCase()
  }
  return tokens
}

// ── Test matrix ───────────────────────────────────────────────────────────────
// Defines every pair we care about and what WCAG criterion applies.
// type: 'normal' | 'large' | 'ui'
// required: whether a failure here is a blocking error (true) or advisory (false)
const PAIRS = [
  // ── Foreground text on backgrounds ─────────────────────────────────────────
  // fg-0/fg-1 are primary text — must pass normal AA everywhere
  { fg: '--fg-0', bg: '--bg-0', type: 'normal', required: true,  note: 'primary text, main bg' },
  { fg: '--fg-0', bg: '--bg-1', type: 'normal', required: true,  note: 'primary text, card bg' },
  { fg: '--fg-0', bg: '--bg-2', type: 'normal', required: true,  note: 'primary text, raised surface' },
  { fg: '--fg-0', bg: '--bg-3', type: 'normal', required: true,  note: 'primary text, elevated surface' },
  { fg: '--fg-1', bg: '--bg-0', type: 'normal', required: true,  note: 'body text, main bg' },
  { fg: '--fg-1', bg: '--bg-1', type: 'normal', required: true,  note: 'body text, card bg' },
  { fg: '--fg-1', bg: '--bg-2', type: 'normal', required: true,  note: 'body text, raised surface' },
  { fg: '--fg-1', bg: '--bg-3', type: 'normal', required: true,  note: 'body text, elevated surface' },

  // fg-2 is secondary text — must pass normal AA on main surfaces
  { fg: '--fg-2', bg: '--bg-0', type: 'normal', required: true,  note: 'secondary text, main bg' },
  { fg: '--fg-2', bg: '--bg-1', type: 'normal', required: true,  note: 'secondary text, card bg' },
  { fg: '--fg-2', bg: '--bg-2', type: 'normal', required: false, note: 'secondary text, raised (decorative-ok)' },
  { fg: '--fg-2', bg: '--bg-3', type: 'normal', required: false, note: 'secondary text, elevated (decorative-ok)' },

  // fg-3/fg-4 are muted / placeholder / decorative — only UI component rule (3:1)
  { fg: '--fg-3', bg: '--bg-0', type: 'ui',     required: true,  note: 'muted text / placeholder' },
  { fg: '--fg-3', bg: '--bg-1', type: 'ui',     required: false, note: 'muted text / placeholder on card' },
  { fg: '--fg-4', bg: '--bg-0', type: 'ui',     required: false, note: 'disabled / decorative only' },

  // ── Accent as foreground text ───────────────────────────────────────────────
  { fg: '--accent',      bg: '--bg-0', type: 'normal', required: true,  note: 'accent links/labels, main bg' },
  { fg: '--accent',      bg: '--bg-1', type: 'normal', required: true,  note: 'accent links/labels, card bg' },
  { fg: '--accent',      bg: '--bg-2', type: 'normal', required: false, note: 'accent text, raised' },
  { fg: '--accent-soft', bg: '--bg-0', type: 'normal', required: false, note: 'accent-soft text, main bg' },
  { fg: '--danger',      bg: '--bg-0', type: 'normal', required: true,  note: 'error messages' },
  { fg: '--success',     bg: '--bg-0', type: 'normal', required: true,  note: 'success messages' },
  { fg: '--highlight',   bg: '--bg-0', type: 'normal', required: false, note: 'highlight text' },

  // ── Accent as background (inverted — e.g. CTA buttons) ─────────────────────
  { fg: '--bg-0',  bg: '--accent',      type: 'normal', required: true,  note: 'dark text on accent button' },
  { fg: '--fg-0',  bg: '--accent',      type: 'normal', required: false, note: 'light text on accent button' },
  { fg: '--bg-0',  bg: '--accent-soft', type: 'normal', required: false, note: 'dark text on accent-soft' },
  { fg: '--fg-0',  bg: '--danger',      type: 'normal', required: false, note: 'light text on danger badge' },
  { fg: '--bg-0',  bg: '--danger',      type: 'normal', required: false, note: 'dark text on danger badge' },
  { fg: '--bg-0',  bg: '--success',     type: 'normal', required: false, note: 'dark text on success badge' },

  // ── Background layers — UI component rule (3:1) ─────────────────────────────
  // These matter for visible borders and layer differentiation
  { fg: '--bg-1', bg: '--bg-0', type: 'ui', required: false, note: 'card on main — UI layer contrast' },
  { fg: '--bg-2', bg: '--bg-0', type: 'ui', required: false, note: 'raised on main — UI layer contrast' },
  { fg: '--bg-3', bg: '--bg-0', type: 'ui', required: false, note: 'elevated on main — UI layer contrast' },
  { fg: '--bg-2', bg: '--bg-1', type: 'ui', required: false, note: 'raised on card — UI layer contrast' },
  { fg: '--bg-3', bg: '--bg-1', type: 'ui', required: false, note: 'elevated on card — UI layer contrast' },
]

// ── Run ───────────────────────────────────────────────────────────────────────
const cssArg = process.argv[2]
const cssPath = resolve(cssArg ?? 'app/styles/globals.css')
let css
try {
  css = readFileSync(cssPath, 'utf8')
} catch {
  console.error(red(`Cannot read CSS file: ${cssPath}`))
  process.exit(1)
}

const tokens = parseHexTokens(css)

// Validate all referenced tokens exist
const missing = new Set()
PAIRS.forEach(({ fg, bg }) => {
  if (!tokens[fg]) missing.add(fg)
  if (!tokens[bg]) missing.add(bg)
})
if (missing.size > 0) {
  console.error(red(`Missing tokens in ${cssPath}:`))
  missing.forEach(t => console.error(`  ${t}`))
  process.exit(1)
}

// Compute results
const results = PAIRS.map(pair => {
  const { fg, bg, type, required, note } = pair
  const fgHex = tokens[fg]
  const bgHex = tokens[bg]
  const ratio = contrastRatio(fgHex, bgHex)
  const level = wcagLevel(ratio, type)
  const pass  = level !== 'FAIL' && !(type === 'normal' && level === 'AA-large' && required)
  return { ...pair, fgHex, bgHex, ratio, level, pass }
})

// ── Output ────────────────────────────────────────────────────────────────────
const REL = relative(process.cwd(), cssPath)
console.log(`\n${bold('jocaibe — WCAG 2.1 color contrast report')}`)
console.log(dim(`CSS source: ${REL}\n`))

// Group by section
const sections = [
  { title: 'Foreground text on backgrounds',      filter: r => r.fg.startsWith('--fg') },
  { title: 'Accent / semantic as text',           filter: r => ['--accent','--accent-soft','--danger','--success','--highlight'].includes(r.fg) && r.bg.startsWith('--bg') },
  { title: 'Accent / semantic as background',     filter: r => !r.fg.startsWith('--fg') && !r.fg.startsWith('--bg') || (r.fg === '--fg-0' && !r.bg.startsWith('--bg')) || (r.fg === '--bg-0' && !r.bg.startsWith('--bg')) },
  { title: 'Background-on-background (UI layers)',filter: r => r.fg.startsWith('--bg') && r.bg.startsWith('--bg') },
]

// Simple section split by order in PAIRS
const fgBgPairs      = results.filter(r => r.fg.startsWith('--fg'))
const accentAsFg     = results.filter(r => !r.fg.startsWith('--fg') && !r.fg.startsWith('--bg') && r.bg.startsWith('--bg'))
const accentAsBg     = results.filter(r => !r.fg.startsWith('--fg') && r.bg.startsWith('--accent') || r.bg === '--danger' || r.bg === '--success')
const invertedBtn    = results.filter(r => (r.fg === '--bg-0' || r.fg === '--fg-0') && !r.bg.startsWith('--bg'))
const bgOnBg         = results.filter(r => r.fg.startsWith('--bg') && r.bg.startsWith('--bg'))

const printSection = (title, rows) => {
  if (!rows.length) return
  console.log(`${bold(title)}`)
  console.log('─'.repeat(92))
  console.log(
    dim('PAIR'.padEnd(42)) +
    dim('HEX FG  / HEX BG'.padEnd(22)) +
    dim('RATIO'.padStart(7)) +
    '  ' +
    dim('LEVEL'.padEnd(9)) +
    dim('NOTE')
  )
  console.log('─'.repeat(92))

  rows.forEach(({ fg, bg, fgHex, bgHex, ratio, level, type, required, pass }) => {
    const pair   = `${fg} on ${bg}`.padEnd(42)
    const hexes  = `${fgHex} / ${bgHex}`.padEnd(22)
    const ratioS = `${ratio.toFixed(2)}:1`.padStart(7)
    const typeTag= dim(`[${type}]`.padEnd(8))

    const badge =
      level === 'FAIL'     ? red(bold('✗ FAIL   ')) :
      level === 'AA-large' ? yel(bold('⚠ AA-lg  ')) :
      level === 'AA'       ? grn(bold('✔ AA     ')) :
      level === 'AAA'      ? grn(bold('✔ AAA    ')) : ''

    const reqTag = required && !pass ? red(' ← REQUIRED') : ''

    console.log(`${pair}${hexes}${ratioS}  ${badge}${typeTag}${reqTag}`)
  })
  console.log()
}

printSection('1. Foreground text on backgrounds', fgBgPairs)
printSection('2. Accent / semantic colors as text', accentAsFg)
printSection('3. Inverted (accent/semantic as background)', invertedBtn)
printSection('4. Background-on-background UI layers', bgOnBg)

// ── Summary ───────────────────────────────────────────────────────────────────
const failures  = results.filter(r => !r.pass && r.required)
const warnings  = results.filter(r => !r.pass && !r.required)
const allPassed = results.filter(r => r.pass)

console.log('═'.repeat(92))
console.log(
  grn(`  ✔ ${allPassed.length} pairs pass`) + '   ' +
  (warnings.length  ? yel(`⚠ ${warnings.length} advisory`) : dim(`⚠ 0 advisory`)) + '   ' +
  (failures.length  ? red(bold(`✗ ${failures.length} required failures`)) : grn(`✗ 0 failures`))
)

if (failures.length > 0) {
  console.log(`\n${red(bold('Required failures (must fix):'))}`)
  failures.forEach(r => {
    console.log(`  ${red('✗')} ${r.fg} on ${r.bg}  ${dim(r.fgHex + ' / ' + r.bgHex)}  ${r.ratio.toFixed(2)}:1  — ${r.note}`)
  })
}

if (warnings.length > 0) {
  console.log(`\n${yel('Advisory (review usage context):')}`)
  warnings.forEach(r => {
    console.log(`  ${yel('⚠')} ${r.fg} on ${r.bg}  ${dim(r.fgHex + ' / ' + r.bgHex)}  ${r.ratio.toFixed(2)}:1  — ${r.note}`)
  })
}

console.log()
process.exit(failures.length > 0 ? 1 : 0)
