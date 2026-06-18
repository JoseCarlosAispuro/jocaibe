'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Close from '@/app/icons/Close'
import { EASE } from '@/app/lib/constants'

type Status = 'idle' | 'sending' | 'success' | 'error'

const Field = ({
  label,
  id,
  error,
  children,
}: {
  label: string
  id: string
  error?: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-[6px]">
    <label htmlFor={id} className="mono text-[10px] text-(--fg-3)">{label}</label>
    {children}
    <AnimatePresence>
      {error && (
        <motion.span
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className="mono text-[10px] text-(--danger)"
        >
          {error}
        </motion.span>
      )}
    </AnimatePresence>
  </div>
)

const inputClass =
  'w-full rounded border border-(--border) bg-(--bg-2) px-4 py-3 text-[15px] text-(--fg-0) outline-none placeholder:text-(--fg-4) transition-[border-color] duration-[180ms] focus:border-(--accent) resize-none'

interface ContactModalProps {
  onClose: () => void
}

const ContactModal = ({ onClose }: ContactModalProps) => {
  const [form, setForm]     = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>('idle')
  const firstInputRef       = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    // Move focus to first input when modal opens
    const frame = requestAnimationFrame(() => firstInputRef.current?.focus())
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const set = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(f => ({ ...f, [field]: e.target.value }))
    if (errors[field]) setErrors(err => { const next = { ...err }; delete next[field]; return next })
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!form.name.trim())    next.name    = 'Name is required.'
    if (!form.email.trim())   next.email   = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email.'
    if (!form.message.trim()) next.message = 'Message is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setStatus('sending')
    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStatus('success')
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to send. Please try again.' })
      setStatus('idle')
    }
  }

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Contact form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: 'linear' }}
      className="fixed inset-0 z-[100] flex items-end justify-center overflow-y-auto p-0 backdrop-blur-[16px] bg-[color-mix(in_oklab,var(--bg-0)_82%,transparent)] md:items-center md:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0,      opacity: 1 }}
        exit={{ y: '100%',    opacity: 0 }}
        transition={{
          y:       { type: 'spring', stiffness: 380, damping: 40, mass: 0.9 },
          opacity: { duration: 0.22, ease: 'linear' },
        }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[560px] overflow-hidden border-t border-(--border) bg-(--bg-1) rounded-t-2xl md:rounded-xl md:border"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-(--border)">
          <div>
            <div className="mono mb-1 text-[10px] text-(--accent)">Get in touch</div>
            <h2 className="font-(--font-display) text-[22px] font-medium tracking-[-0.02em] text-(--fg-0)">
              Send a message
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close contact form"
            className="flex size-9 items-center justify-center rounded-full border border-(--border-strong) text-(--fg-2) transition-colors duration-[160ms] hover:border-(--fg-3) hover:text-(--fg-0)"
          >
            <Close size={12} />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-7">
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: EASE }}
                className="flex flex-col items-center gap-4 py-8 text-center"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-(--accent)">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" stroke="var(--bg-0)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <div>
                  <div className="font-(--font-display) mb-1 text-[20px] font-medium text-(--fg-0)">Message sent</div>
                  <div className="text-[14px] text-(--fg-2)">I'll get back to you within 24 hours.</div>
                </div>
                <button
                  onClick={onClose}
                  className="mt-2 mono text-[11px] tracking-[0.08em] text-(--accent)"
                >
                  CLOSE ↓
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                noValidate
                className="flex flex-col gap-5"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Field label="NAME" id="contact-name" error={errors.name}>
                  <input
                    id="contact-name"
                    ref={firstInputRef}
                    type="text"
                    placeholder="Your name"
                    value={form.name}
                    onChange={set('name')}
                    aria-required="true"
                    aria-invalid={!!errors.name}
                    className={inputClass}
                    disabled={status === 'sending'}
                  />
                </Field>

                <Field label="EMAIL" id="contact-email" error={errors.email}>
                  <input
                    id="contact-email"
                    type="text"
                    inputMode="email"
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={set('email')}
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    className={inputClass}
                    disabled={status === 'sending'}
                  />
                </Field>

                <Field label="MESSAGE" id="contact-message" error={errors.message}>
                  <textarea
                    id="contact-message"
                    placeholder="Tell me about your project…"
                    value={form.message}
                    onChange={set('message')}
                    rows={5}
                    aria-required="true"
                    aria-invalid={!!errors.message}
                    className={inputClass}
                    disabled={status === 'sending'}
                  />
                </Field>

                {errors.submit && (
                  <span role="alert" className="mono text-[10px] text-(--danger)">{errors.submit}</span>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="mt-1 flex items-center justify-center gap-3 rounded-full bg-(--accent) py-[18px] font-(--font-mono) text-[13px] font-medium tracking-[0.08em] uppercase text-(--bg-0) transition-opacity duration-[160ms] disabled:opacity-60"
                >
                  {status === 'sending' ? (
                    <>
                      <svg aria-hidden="true" className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="12"/>
                      </svg>
                      Sending…
                    </>
                  ) : (
                    <>
                      Send message
                      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ContactModal
