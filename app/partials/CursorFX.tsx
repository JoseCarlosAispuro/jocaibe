'use client'

import { useRef, useEffect } from 'react'

const CursorFX = () => {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduced) return

    document.body.classList.add('has-custom-cursor')

    let mx = window.innerWidth / 2, my = window.innerHeight / 2
    let rx = mx, ry = my
    let scale = 1, tScale = 1
    let raf = 0

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`
      }
      const hit = (e.target as Element).closest('[data-cursor]')
      if (hit) {
        tScale = 2.6
        const txt = hit.getAttribute('data-cursor')
        if (labelRef.current) labelRef.current.textContent = txt || ''
        ringRef.current?.classList.add('cur-active')
      } else {
        tScale = 1
        if (labelRef.current) labelRef.current.textContent = ''
        ringRef.current?.classList.remove('cur-active')
      }
    }
    const onDown = () => ringRef.current?.classList.add('cur-down')
    const onUp = () => ringRef.current?.classList.remove('cur-down')
    const onLeave = () => {
      if (dotRef.current) dotRef.current.style.opacity = '0'
      if (ringRef.current) ringRef.current.style.opacity = '0'
    }
    const onEnter = () => {
      if (dotRef.current) dotRef.current.style.opacity = '1'
      if (ringRef.current) ringRef.current.style.opacity = '1'
    }

    const loop = () => {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16
      scale += (tScale - scale) * 0.16
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%) scale(${scale})`
      }
      raf = requestAnimationFrame(loop)
    }
    loop()

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    return () => {
      cancelAnimationFrame(raf)
      document.body.classList.remove('has-custom-cursor')
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring">
        <span ref={labelRef} className="cursor-label" />
      </div>
    </>
  )
}

export default CursorFX
