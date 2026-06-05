import {useReveal} from "@/app/hooks/useReveal";

const TimelineCurrent = ({
                             period,
                             label,
                             lit,
                             registerDot,
                         }: {
    period: string
    label: string
    lit: boolean
    registerDot: (el: HTMLSpanElement | null) => void
}) => {
    const ref = useReveal(200)

    return (
        <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className="grid pt-12 relative"
            style={{ gridTemplateColumns: 'clamp(40px,8vw,72px) 1fr', gap: 'clamp(24px,4vw,64px)' }}
        >
            <div className="relative">
        <span
            ref={registerDot}
            suppressHydrationWarning
            className="absolute top-2 w-4 h-4 rounded-full bg-(--accent) outline-[6px] outline-solid outline-(--bg-0) transition-opacity duration-[320ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{
                left: 'calc(clamp(20px, 4vw, 36px) - 8px)',
                ['--beat-glow' as string]: 'var(--accent)',
                animation: lit ? 'heartbeat 1.8s ease-in-out infinite' : 'none',
                opacity: lit ? 1 : 0.4,
            }}
        />
            </div>
            <div>
                <div className="mono text-(--accent)">{period}</div>
                <div className="text-[20px] [font-family:var(--font-display)] text-(--fg-0) mt-1">{label}</div>
            </div>
        </div>
    )
}

export default TimelineCurrent
