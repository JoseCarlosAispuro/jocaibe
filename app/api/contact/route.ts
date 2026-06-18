import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend     = new Resend(process.env.RESEND_API_KEY)
const TO_ADDRESS = process.env.TO_ADDRESS
const FROM       = 'Portfolio Contact <no-reply@jocaibe.com>'

export async function POST(request: Request) {
  if (!TO_ADDRESS) {
    console.error('TO_ADDRESS env variable is not set')
    return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 })
  }

  const body = await request.json().catch(() => null)
  const { name, email, message } = body ?? {}

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from:    FROM,
      to:      TO_ADDRESS,
      replyTo: email,
      subject: `New message from ${name}`,
      text:    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Resend error:', err)
    return NextResponse.json({ error: 'Failed to send. Please try again.' }, { status: 500 })
  }
}
