/**
 * Read/write the colour tokens in the @theme block of src/styles/global.css.
 *
 * Used only by the dev-server middleware behind /__theme (see astro.config.mjs),
 * so this never runs in the Cloudflare runtime — real node:fs is available.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const CSS_PATH = fileURLToPath(new URL('../src/styles/global.css', import.meta.url))

const TOKEN_NAME = /^--color-[a-z0-9-]+$/
const HEX = /^#[0-9a-f]{6}$/i

/** Isolate the @theme { ... } block so we never rewrite anything outside it. */
function themeBlock(css) {
  const open = css.indexOf('@theme')
  if (open === -1) throw new Error('No @theme block in global.css')
  const braceStart = css.indexOf('{', open)
  let depth = 0
  for (let i = braceStart; i < css.length; i++) {
    if (css[i] === '{') depth++
    else if (css[i] === '}') {
      depth--
      if (depth === 0) return { start: braceStart, end: i, body: css.slice(braceStart, i) }
    }
  }
  throw new Error('Unterminated @theme block')
}

export async function readTokens() {
  const css = await readFile(CSS_PATH, 'utf8')
  const { body } = themeBlock(css)
  const tokens = []
  for (const m of body.matchAll(/(--color-[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
    const name = m[1]
    const value = m[2].trim()
    // group: --color-sand-50 -> "sand"
    const group = name.replace('--color-', '').split('-')[0]
    tokens.push({ name, value, group, label: name.replace('--color-', '') })
  }
  return tokens
}

/**
 * Replace token values in place. Only known token names and 6-digit hex values
 * are accepted — this writes to a source file, so nothing else gets through.
 */
export async function writeTokens(updates) {
  const css = await readFile(CSS_PATH, 'utf8')
  const { start, end, body } = themeBlock(css)

  const existing = new Set((await readTokens()).map((t) => t.name))
  const rejected = []
  let next = body
  let changed = 0

  for (const [name, value] of Object.entries(updates)) {
    if (!TOKEN_NAME.test(name) || !existing.has(name)) {
      rejected.push(`${name} (unknown token)`)
      continue
    }
    if (!HEX.test(value)) {
      rejected.push(`${name} (not a #rrggbb colour: ${value})`)
      continue
    }
    const re = new RegExp(`(${name}\\s*:\\s*)([^;]+)(;)`, 'i')
    if (!re.test(next)) {
      rejected.push(`${name} (not found in @theme)`)
      continue
    }
    next = next.replace(re, (_m, head, old, tail) => {
      if (old.trim().toLowerCase() !== value.toLowerCase()) changed++
      return head + value.toLowerCase() + tail
    })
  }

  if (changed > 0) {
    await writeFile(CSS_PATH, css.slice(0, start) + next + css.slice(end), 'utf8')
  }
  return { changed, rejected }
}
