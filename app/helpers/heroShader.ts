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
  const fine   = window.matchMedia('(pointer: fine)').matches

  let w = 0, h = 0, raf = 0
  let visible = true
  const t0 = performance.now()
  let px = -9999, py = -9999, tx = -9999, ty = -9999, active = false
  // Cached canvas offset — updated on resize, avoids getBoundingClientRect() per mouse event
  let canvasLeft = 0, canvasTop = 0
  let dots: Dot[] = []
  let vignette: CanvasGradient | null = null
  // Mobile ghost cursor: lerped center that shifts to the last tap position
  let ghostCX = -1, ghostCY = -1   // -1 = not yet initialised (set on first draw)
  // Tap destination — non-null while constellation is travelling to a tapped point
  let tapDest: [number, number] | null = null
  // Time reference for Lissajous — reset once constellation arrives at tap point
  let tapTimeRef = -1

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
  const onLeave = () => { active = false; tx = -9999; ty = -9999 }
  const onTap = (e: TouchEvent) => {
    const t = e.touches[0] ?? e.changedTouches[0]
    if (!t) return
    const rect = canvas.getBoundingClientRect()
    const x = t.clientX - rect.left
    const y = t.clientY - rect.top
    // Begin travel phase: constellation lerps to tap point, idle starts on arrival
    tapDest = [x, y]
  }

  const draw = () => {
    const time = (performance.now() - t0) * 0.001

    // Mobile: ghost cursor wanders on a Lissajous path centred on the last tap
    // (defaults to canvas centre). On tap the centre smoothly shifts there.
    if (!fine) {
      if (ghostCX < 0) { ghostCX = w * 0.5; ghostCY = h * 0.5 }

      if (tapDest) {
        // Phase 1 — travel: hold tx/ty at the tap point so px/py lerps there
        tx = tapDest[0]
        ty = tapDest[1]
        // Arrive check: once px/py is within 3px, switch to idle
        const adx = px - tapDest[0]
        const ady = py - tapDest[1]
        if (px > -9000 && adx * adx + ady * ady < 9) {
          ghostCX  = tapDest[0]
          ghostCY  = tapDest[1]
          tapDest  = null
          tapTimeRef = time   // Idle starts from arrival — all sin terms = 0
        }
      } else {
        // Phase 2 — idle: Lissajous orbit around ghostCX/ghostCY
        if (tapTimeRef < 0) tapTimeRef = time
        const elapsed = time - tapTimeRef
        tx = ghostCX + Math.sin(elapsed * 0.22) * w * 0.28 + Math.sin(elapsed * 0.07) * w * 0.10
        ty = ghostCY + Math.sin(elapsed * 0.17) * h * 0.28 + Math.sin(elapsed * 0.09) * h * 0.10
      }
      active = true
    }

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

  // Keep canvas offset in sync with scroll (it's cached on resize only)
  const onScroll = () => {
    const rect = canvas.getBoundingClientRect()
    canvasLeft = rect.left
    canvasTop  = rect.top
  }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible && raf === 0) {
      // Snap px/py so the cursor doesn't slide from its old position to the
      // new Lissajous point — time kept advancing while RAF was paused
      px = -9999
      py = -9999
      raf = requestAnimationFrame(draw)
    }
  }, { threshold: 0 })

  resize()
  window.addEventListener('resize', resize)
  window.addEventListener('scroll', onScroll, { passive: true })
  if (fine) {
    window.addEventListener('mousemove', onMove)
    canvas.addEventListener('mouseleave', onLeave)
  } else {
    // Reset ghost centre on resize so it re-seeds from new canvas dimensions
    const onResizeMobile = () => { ghostCX = -1; ghostCY = -1; tapDest = null; tapTimeRef = -1 }
    window.addEventListener('resize', onResizeMobile)
    window.addEventListener('touchstart', onTap, { passive: true })
  }
  io.observe(canvas)
  draw()

  return () => {
    cancelAnimationFrame(raf)
    io.disconnect()
    window.removeEventListener('resize', resize)
    window.removeEventListener('scroll', onScroll)
    if (fine) {
      window.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('mouseleave', onLeave)
    } else {
      window.removeEventListener('touchstart', onTap)
    }
  }
}
