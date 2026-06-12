import {motion} from "motion/react";

export interface ContactLink {
    label: string
    value: string
    href: string | null
    cta?: boolean
}

const ContactRow = ({label, value, cta, href}: ContactLink) => {
    return (
        <motion.a
            href={href || '#'}
            initial="rest"
            whileHover="hover"
            className="flex items-baseline gap-6 justify-between pb-4 border-b border-(--border)"
        >
            <span className="mono">{label}</span>
            <motion.span
                variants={{
                    rest: {color: 'var(--fg-0)'},
                    hover: {color: 'var(--accent)'},
                }}
                transition={{duration: 0.22}}
                className={`text-[17px] ${cta ? 'font-(--font-mono)' : 'font-(--font-body)'}`}
            >
                {value} {cta ? '↓' : '↗'}
            </motion.span>
        </motion.a>
    )
}

export default ContactRow
