// Canvas2D interactive constellation dot-field background.
// Mouse + touch reactive, reduced-motion aware.
// Returns a cleanup function — call it on unmount.

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

const GAP    = 46
const RADIUS = 190
const DIM    = 0.18
const PULL   = 22
const ACCENT: [number, number, number] = [217, 240, 74]

// Pre-computed constant — all non-glowing dots share this color every frame
const DIM_COLOR = `rgba(255,255,255,${DIM})`

export const initHeroShader = (canvas: HTMLCanvasElement): () => void => {
  const ctx = canvas.getContext('2d', { alpha: true })!
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  let w = 0, h = 0, raf = 0
  let visible = true
  const t0 = performance.now()
  let px = -9999, py = -9999, tx = -9999, ty = -9999, active = false
  // Cached canvas offset — updated on resize, avoids getBoundingClientRect() per mouse event
  let canvasLeft = 0, canvasTop = 0
  let dots: Dot[] = []
  let vignette: CanvasGradient | null = null

  const build = () => {
    dots = []
    const cols = Math.ceil(w / GAP) + 1
    const rows = Math.ceil(h / GAP) + 1
    const offX = (w - (cols - 1) * GAP) / 2
    const offY = (h - (rows - 1) * GAP) / 2
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const bx = offX + i * GAP
        const by = offY + j * GAP
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

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    w = rect.width
    h = rect.height
    // Cache offset so setPointer never needs to call getBoundingClientRect()
    canvasLeft = rect.left
    canvasTop  = rect.top
    canvas.width  = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    // Rebuild cached vignette whenever dimensions change
    vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.9)
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(1, 'rgba(14,15,16,0.82)')
    build()
  }

  const setPointer = (cx: number, cy: number) => {
    tx = cx - canvasLeft
    ty = cy - canvasTop
    active = true
  }

  const onMove  = (e: MouseEvent) => setPointer(e.clientX, e.clientY)
  const onTouch = (e: TouchEvent) => { if (e.touches[0]) setPointer(e.touches[0].clientX, e.touches[0].clientY) }
  const onLeave = () => { active = false; tx = -9999; ty = -9999 }

  const draw = () => {
    const time = (performance.now() - t0) * 0.001
    if (px < -9000) { px = tx; py = ty }
    px += (tx - px) * 0.12
    py += (ty - py) * 0.12
    ctx.clearRect(0, 0, w, h)

    const r2 = RADIUS * RADIUS
    const litDots: Dot[] = []

    // Pass 1 — update all dot positions and glow values
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
          const f = 1 - dist / RADIUS
          target = f * f
          homeX -= (dx / dist) * f * PULL
          homeY -= (dy / dist) * f * PULL
        }
      }

      d.glow += (target - d.glow) * 0.14
      d.x = homeX
      d.y = homeY
      if (d.glow > 0.04) litDots.push(d)
    }

    // Pass 2 — halos for lit dots (drawn before dots so they sit underneath)
    for (let i = 0; i < litDots.length; i++) {
      const d = litDots[i]
      const g = d.glow
      const hr = (1.1 + g * 3.2) * (3 + g * 5)
      const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, hr)
      grad.addColorStop(0, `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${(0.28 * g).toFixed(3)})`)
      grad.addColorStop(1, `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},0)`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(d.x, d.y, hr, 0, Math.PI * 2)
      ctx.fill()
    }

    // Pass 3 — batch all dim dots into a single path + fill (1 draw call vs ~960)
    ctx.fillStyle = DIM_COLOR
    ctx.beginPath()
    for (let k = 0; k < dots.length; k++) {
      const d = dots[k]
      if (d.glow <= 0.04) {
        ctx.moveTo(d.x + 1.1, d.y)
        ctx.arc(d.x, d.y, 1.1, 0, Math.PI * 2)
      }
    }
    ctx.fill()

    // Pass 4 — individual fills for lit dots (accent-tinted, variable size)
    for (let i = 0; i < litDots.length; i++) {
      const d = litDots[i]
      const g = d.glow
      const cr = Math.round(255 + (ACCENT[0] - 255) * g)
      const cg = Math.round(255 + (ACCENT[1] - 255) * g)
      const cb = Math.round(255 + (ACCENT[2] - 255) * g)
      ctx.fillStyle = `rgba(${cr},${cg},${cb},${(DIM + g * (1 - DIM) * 0.92).toFixed(3)})`
      ctx.beginPath()
      ctx.arc(d.x, d.y, 1.1 + g * 3.2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Pass 5 — lines between lit dots within constellation range
    if (litDots.length > 1) {
      const maxLen = GAP * 1.9
      const maxLen2 = maxLen * maxLen
      for (let a = 0; a < litDots.length; a++) {
        for (let b = a + 1; b < litDots.length; b++) {
          const dx = litDots[a].x - litDots[b].x
          const dy = litDots[a].y - litDots[b].y
          const dist2 = dx * dx + dy * dy
          if (dist2 < maxLen2) {
            const closeness = 1 - Math.sqrt(dist2) / maxLen
            const alpha = closeness * Math.min(litDots[a].glow, litDots[b].glow) * 0.5
            if (alpha > 0.01) {
              ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${alpha.toFixed(3)})`
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(litDots[a].x, litDots[a].y)
              ctx.lineTo(litDots[b].x, litDots[b].y)
              ctx.stroke()
            }
          }
        }
      }
    }

    // Pass 6 — radial vignette (gradient cached on resize, 1 fillRect)
    if (vignette) {
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, w, h)
    }

    raf = visible ? requestAnimationFrame(draw) : 0
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible && raf === 0) raf = requestAnimationFrame(draw)
  }, { threshold: 0 })

  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMove)
  window.addEventListener('touchmove', onTouch, { passive: true })
  window.addEventListener('touchstart', onTouch, { passive: true })
  canvas.addEventListener('mouseleave', onLeave)
  io.observe(canvas)
  draw()

  return () => {
    cancelAnimationFrame(raf)
    io.disconnect()
    window.removeEventListener('resize', resize)
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('touchmove', onTouch)
    window.removeEventListener('touchstart', onTouch)
    canvas.removeEventListener('mouseleave', onLeave)
  }
}
