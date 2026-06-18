const BrandWordmark = () => (
  <span className="inline-flex items-baseline font-(--font-display) text-[23px] font-medium text-(--fg-0) tracking-[-0.04em] leading-none whitespace-nowrap">
    <span>joca</span>
    {/* Custom "i" — stem + accent tittle pixel */}
    <span className="inline-block relative align-baseline w-[2px] h-[12px] mx-px">
      <span className="absolute bottom-0 left-0 w-[2px] h-[12px] bg-(--fg-0) rounded-[1px]" />
      <span className="absolute left-1/2 -translate-x-1/2 bottom-[14px] w-[3px] h-[3px] bg-(--accent) rounded-[2px] shadow-[0_0_3px_1px_var(--accent)]" />
    </span>
    <span>be</span>
  </span>
)

export default BrandWordmark
