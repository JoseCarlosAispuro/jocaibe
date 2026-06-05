// Canvas2D interactive dot-field background.
// Three modes: 'constellation' | 'spotlight' | 'kinetic'
// Mouse + touch reactive, reduced-motion aware.
// Returns a cleanup function — call it on unmount.

type Mode = 'constellation' | 'spotlight' | 'kinetic'

interface ShaderOpts {
  mode?: Mode
  accent?: [number, number, number]
  gap?: number
  radius?: number
}

interface Dot {
  bx: number
  by: number
  x: number
  y: number
  ph: number
  sp: number
  amp: number
  glow: number
}

const MODE_CFG: Record<Mode, { gap: number; radius: number; dim: number; pull: number; disc: number; lines: boolean }> = {
  constellation: { gap: 46, radius: 190, dim: 0.18, pull: 22, disc: 0,    lines: true  },
  spotlight:     { gap: 40, radius: 270, dim: 0.035, pull: 14, disc: 0.16, lines: true  },
  kinetic:       { gap: 64, radius: 150, dim: 0.10,  pull: 10, disc: 0,    lines: false },
}

export function initHeroShader(canvas: HTMLCanvasElement, opts: ShaderOpts = {}): () => void {
  const ctx = canvas.getContext('2d', { alpha: true })!
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const mode: Mode = opts.mode ?? 'constellation'
  const accent: [number, number, number] = opts.accent ?? [217, 240, 74]
  const cfg = MODE_CFG[mode]

  const gap       = opts.gap    ?? cfg.gap
  const radius    = opts.radius ?? cfg.radius
  const dim       = cfg.dim
  const pullK     = cfg.pull
  const discA     = cfg.disc
  const drawLines = cfg.lines

  let w = 0, h = 0, raf = 0
  const t0 = performance.now()
  let px = -9999, py = -9999, tx = -9999, ty = -9999, active = false
  let dots: Dot[] = []

  function build() {
    dots = []
    const cols = Math.ceil(w / gap) + 1
    const rows = Math.ceil(h / gap) + 1
    const offX = (w - (cols - 1) * gap) / 2
    const offY = (h - (rows - 1) * gap) / 2
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const bx = offX + i * gap
        const by = offY + j * gap
        dots.push({
          bx, by, x: bx, y: by,
          ph: Math.random() * Math.PI * 2,
          sp: 0.4 + Math.random() * 0.6,
          amp: 2 + Math.random() * 3,
          glow: 0,
        })
      }
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect()
    w = rect.width
    h = rect.height
    canvas.width  = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    build()
  }

  function setPointer(cx: number, cy: number) {
    const r = canvas.getBoundingClientRect()
    tx = cx - r.left
    ty = cy - r.top
    active = true
  }

  const onMove  = (e: MouseEvent) => setPointer(e.clientX, e.clientY)
  const onTouch = (e: TouchEvent) => { if (e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY) }
  const onLeave = () => { active = false; tx = -9999; ty = -9999 }

  function draw() {
    const time = (performance.now() - t0) * 0.001
    if (px < -9000) { px = tx; py = ty }
    px += (tx - px) * 0.12
    py += (ty - py) * 0.12
    ctx.clearRect(0, 0, w, h)

    // Soft accent light disc (spotlight mode)
    if (discA > 0 && active && px > -9000) {
      const lr = radius * 1.15
      const lg = ctx.createRadialGradient(px, py, 0, px, py, lr)
      lg.addColorStop(0, `rgba(${accent[0]},${accent[1]},${accent[2]},${discA})`)
      lg.addColorStop(1, `rgba(${accent[0]},${accent[1]},${accent[2]},0)`)
      ctx.fillStyle = lg
      ctx.beginPath()
      ctx.arc(px, py, lr, 0, Math.PI * 2)
      ctx.fill()
    }

    const r2 = radius * radius
    const lit: Dot[] = []

    for (let k = 0; k < dots.length; k++) {
      const d = dots[k]
      const ax = reduce ? 0 : Math.sin(time * d.sp + d.ph) * d.amp
      const ay = reduce ? 0 : Math.cos(time * d.sp * 0.9 + d.ph) * d.amp
      let homeX = d.bx + ax
      let homeY = d.by + ay
      let target = 0

      if (active) {
        const dx = homeX - px, dy = homeY - py
        const dist2 = dx * dx + dy * dy
        if (dist2 < r2) {
          const dist = Math.sqrt(dist2) || 0.0001
          const f = 1 - dist / radius
          target = f * f
          const pull = f * pullK
          homeX -= (dx / dist) * pull
          homeY -= (dy / dist) * pull
        }
      }

      d.glow += (target - d.glow) * 0.14
      d.x = homeX
      d.y = homeY
      const g = d.glow
      const size = 1.1 + g * 3.2
      const baseA = dim + g * (1 - dim) * 0.92

      if (g > 0.04) {
        const hr = size * (3 + g * 5)
        const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, hr)
        grad.addColorStop(0, `rgba(${accent[0]},${accent[1]},${accent[2]},${0.28 * g})`)
        grad.addColorStop(1, `rgba(${accent[0]},${accent[1]},${accent[2]},0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(d.x, d.y, hr, 0, Math.PI * 2)
        ctx.fill()
        lit.push(d)
      }

      const cr = Math.round(255 + (accent[0] - 255) * g)
      const cg = Math.round(255 + (accent[1] - 255) * g)
      const cb = Math.round(255 + (accent[2] - 255) * g)
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${baseA})`
      ctx.beginPath()
      ctx.arc(d.x, d.y, size, 0, Math.PI * 2)
      ctx.fill()
    }

    if (drawLines && lit.length > 1) {
      const maxLen = gap * 1.9
      const maxLen2 = maxLen * maxLen
      for (let a = 0; a < lit.length; a++) {
        for (let b = a + 1; b < lit.length; b++) {
          const dx = lit[a].x - lit[b].x
          const dy = lit[a].y - lit[b].y
          const dist2 = dx * dx + dy * dy
          if (dist2 < maxLen2) {
            const closeness = 1 - Math.sqrt(dist2) / maxLen
            const alpha = closeness * Math.min(lit[a].glow, lit[b].glow) * 0.5
            if (alpha > 0.01) {
              ctx.strokeStyle = `rgba(${accent[0]},${accent[1]},${accent[2]},${alpha})`
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(lit[a].x, lit[a].y)
              ctx.lineTo(lit[b].x, lit[b].y)
              ctx.stroke()
            }
          }
        }
      }
    }

    // Radial vignette
    const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.9)
    vg.addColorStop(0, 'rgba(0,0,0,0)')
    vg.addColorStop(1, mode === 'spotlight' ? 'rgba(14,15,16,0.95)' : 'rgba(14,15,16,0.82)')
    ctx.fillStyle = vg
    ctx.fillRect(0, 0, w, h)

    raf = requestAnimationFrame(draw)
  }

  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('touchmove', onTouch, { passive: true })
  window.addEventListener('touchstart', onTouch, { passive: true })
  canvas.addEventListener('mouseleave', onLeave)
  draw()

  return () => {
    cancelAnimationFrame(raf)
    window.removeEventListener('resize', resize)
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('touchmove', onTouch)
    window.removeEventListener('touchstart', onTouch)
    canvas.removeEventListener('mouseleave', onLeave)
  }
}
