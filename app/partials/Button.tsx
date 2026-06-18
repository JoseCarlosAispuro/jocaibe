'use client'

import RightArrow from '@/app/icons/RightArrow'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useLenis } from 'lenis/react'
import { useMagnetic } from '@/app/hooks/useMagnetic'

const MotionLink = motion.create(Link)

const BASE_CLASS =
    'inline-flex items-center gap-4 border border-(--fg-0) bg-(--fg-0) text-(--bg-0) rounded-full font-(--font-mono) text-[13px] tracking-[0.06em] uppercase font-medium transition-[background,border-color] duration-[220ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:bg-(--accent) hover:border-(--accent) shrink-0 px-7 py-[18px]'

interface ButtonProps {
    label: string
    cursor?: string
}

interface ButtonLinkProps extends ButtonProps {
    variant: 'link'
    href: string
}

interface ButtonScrollProps extends ButtonProps {
    variant: 'scroll'
    target: string // e.g. '#projects'
}

interface ButtonModalProps extends ButtonProps {
    variant: 'modal'
    onClick: () => void
}

type Props = ButtonLinkProps | ButtonScrollProps | ButtonModalProps

const Button = (props: Props) => {
    const lenis = useLenis()
    const { ref: magnetRef, style: magnetStyle } = useMagnetic(0.4)

    if (props.variant === 'scroll') {
        const { label, cursor, target } = props

        const handleClick = () => {
            const el = document.querySelector(target)
            if (!el) return
            lenis
                ? lenis.scrollTo(el as HTMLElement)
                : el.scrollIntoView({ behavior: 'smooth' })
        }

        return (
            <motion.button
                ref={magnetRef as React.Ref<HTMLButtonElement>}
                style={magnetStyle}
                onClick={handleClick}
                data-cursor={cursor}
                className={BASE_CLASS}
            >
                {label}
                <RightArrow />
            </motion.button>
        )
    }

    if (props.variant === 'modal') {
        const { label, cursor, onClick } = props

        return (
            <motion.button
                ref={magnetRef as React.Ref<HTMLButtonElement>}
                style={magnetStyle}
                onClick={onClick}
                data-cursor={cursor}
                className={BASE_CLASS}
            >
                {label}
                <RightArrow />
            </motion.button>
        )
    }

    const { label, cursor, href } = props

    return (
        <MotionLink
            ref={magnetRef as React.Ref<HTMLAnchorElement>}
            style={magnetStyle}
            href={href}
            data-cursor={cursor}
            className={BASE_CLASS}
        >
            {label}
            <RightArrow />
        </MotionLink>
    )
}

export default Button
