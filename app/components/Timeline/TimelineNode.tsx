import {useReveal} from "@/app/hooks/useReveal";
import {Role} from "./index";

const TimelineNode = ({
                          role,
                          idx,
                          lit,
                          registerDot,
                      }: {
    role: Role
    idx: number
    lit: boolean
    registerDot: (el: HTMLSpanElement | null) => void
}) => {
    const ref = useReveal(idx * 120)

    return (
        <div
            ref={ref as React.RefObject<HTMLDivElement>}
            className="grid gap-[clamp(24px,4vw,64px)] pt-12 pb-12 border-b border-(--border) relative"
            style={{ gridTemplateColumns: 'clamp(40px,8vw,72px) 1fr' }}
        >
            {/* Node dot */}
            <div className="relative pt-2">
        <span
            ref={registerDot}
            className="absolute top-[14px] w-[14px] h-[14px] rounded-full border-2 border-(--accent) transition-[background,box-shadow] duration-[320ms] ease-[cubic-bezier(0.2,0.7,0.2,1)]"
            style={{
                left: 'calc(clamp(20px, 4vw, 36px) - 7px)',
                background: lit ? 'var(--accent)' : 'var(--bg-0)',
                boxShadow: lit
                    ? '0 0 0 6px var(--bg-0), 0 0 16px var(--accent)'
                    : '0 0 0 6px var(--bg-0)',
            }}
        />
            </div>

            {/* Content */}
            <div className="grid grid-cols-12 gap-6">
                {/* Left col — meta */}
                <div className="col-span-4">
                    <div className="mono text-(--accent) mb-2">{role.period}</div>
                    <h3 className="[font-family:var(--font-display)] [font-size:var(--fs-h3)] font-semibold tracking-[-0.02em] leading-[1.15] text-(--fg-0)">
                        {role.company}
                    </h3>
                    <div className="text-[14px] text-(--fg-2) mt-1">{role.role}</div>
                    <div className="mono mt-3 text-(--fg-3)">{role.location}</div>
                </div>

                {/* Middle col — bullets */}
                <div className="col-span-6">
                    <ul className="flex flex-col gap-3">
                        {role.bullets.map((bullet, i) => (
                            <li key={i} className="flex gap-3 text-[15px] text-(--fg-1) leading-[1.55]">
                                <span className="w-[14px] h-px mt-3 bg-(--fg-3) shrink-0" />
                                <span>{bullet}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Right col — stack tags */}
                <div className="col-span-2 flex flex-wrap gap-1.5 content-start">
                    {role.stack.map((tag) => (
                        <span
                            key={tag}
                            className="mono text-[10px] text-(--fg-2) px-2 py-1 border border-(--border) rounded-[4px]"
                        >
              {tag}
            </span>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default TimelineNode
