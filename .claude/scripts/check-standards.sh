#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# jocaibe standards checker
# Usage:
#   check-standards.sh [file1 file2 ...]   — check specific files
#   check-standards.sh                      — check all git-staged files
# Exit 0 = pass, exit 1 = violations found
# ─────────────────────────────────────────────────────────────────────────────

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BOLD='\033[1m'
RESET='\033[0m'

FAILED=0
WARNINGS=0

error()   { echo -e "${RED}${BOLD}  ✗ ERROR${RESET}   $1"; FAILED=1; }
warn()    { echo -e "${YELLOW}${BOLD}  ⚠ WARN${RESET}    $1"; WARNINGS=$((WARNINGS+1)); }
section() { echo -e "\n${BOLD}$1${RESET}"; }

# ── Resolve file list ─────────────────────────────────────────────────────────
if [ $# -gt 0 ]; then
  FILES=("$@")
else
  mapfile -t FILES < <(git diff --cached --name-only --diff-filter=ACM 2>/dev/null | grep -E '\.(tsx?|css|scss|sass)$')
fi

if [ ${#FILES[@]} -eq 0 ]; then
  echo -e "${GREEN}✔ No relevant staged files to check.${RESET}"
  exit 0
fi

echo -e "${BOLD}jocaibe standards check — ${#FILES[@]} file(s)${RESET}"

# ─────────────────────────────────────────────────────────────────────────────
# TS / TSX checks
# ─────────────────────────────────────────────────────────────────────────────
TS_FILES=()
for f in "${FILES[@]}"; do
  [[ "$f" == *.ts || "$f" == *.tsx ]] && TS_FILES+=("$f")
done

if [ ${#TS_FILES[@]} -gt 0 ]; then
  section "TypeScript / TSX"

  for FILE in "${TS_FILES[@]}"; do
    [ -f "$FILE" ] || continue

    # 1. Inline EASE constant — must come from @/app/lib/constants
    if grep -qE "const EASE\s*=\s*\[0\.2" "$FILE"; then
      error "$FILE — inline \`EASE\` constant. Import from \`@/app/lib/constants\` instead."
    fi

    # 2. Inline HEARTBEAT constants
    if grep -qE "const HEARTBEAT_(SCALE|TIMES)\s*=" "$FILE"; then
      error "$FILE — inline \`HEARTBEAT_*\` constant. Import from \`@/app/lib/constants\` instead."
    fi

    # 3. Native scroll listener — should use Lenis
    if grep -qE "addEventListener\(['\"]scroll['\"]" "$FILE"; then
      error "$FILE — native \`scroll\` event listener. Use \`useLenis()\` instead."
    fi

    # 4. window.scrollY — should come from Lenis callback
    if grep -qE "window\.scrollY" "$FILE"; then
      warn "$FILE — \`window.scrollY\` found. Prefer reading scroll position from the Lenis callback."
    fi

    # 5. Scrolling via window.lenis — doesn't exist, use useLenis()
    if grep -qE "window\.lenis" "$FILE"; then
      error "$FILE — \`window.lenis\` does not exist. Use \`const lenis = useLenis()\` instead."
    fi

    # 6. getBoundingClientRect inside requestAnimationFrame — perf issue
    # Heuristic: both strings in same file is a warning; can't easily detect nesting
    if grep -qE "getBoundingClientRect" "$FILE" && grep -qE "requestAnimationFrame" "$FILE"; then
      warn "$FILE — \`getBoundingClientRect\` + \`requestAnimationFrame\` both present. Ensure positions are cached outside the RAF loop (measure on mount/resize, not every frame)."
    fi

    # 7. Duplicate inline SVGs — icon should live in app/icons/
    SVG_COUNT=$(grep -c "<svg" "$FILE" 2>/dev/null); SVG_COUNT=${SVG_COUNT:-0}
    if [ "$SVG_COUNT" -gt 1 ]; then
      warn "$FILE — ${SVG_COUNT} inline \`<svg\` elements. Extract repeated icons to \`app/icons/\` and import the component."
    fi

    # 8. overflow-x: hidden inside className (should be clip)
    if grep -qE "overflow-x-hidden" "$FILE"; then
      error "$FILE — \`overflow-x-hidden\` Tailwind class. Use \`overflow-x-clip\` to preserve \`position: sticky\`."
    fi

    # 9. Clickable div/article without keyboard handler
    if grep -qE "onClick=\{" "$FILE" && grep -qE "<(div|article|span)" "$FILE"; then
      if ! grep -qE "onKeyDown|role=['\"]button['\"]|tabIndex" "$FILE"; then
        warn "$FILE — clickable non-button element detected without \`onKeyDown\`, \`role=\"button\"\`, or \`tabIndex\`. Add keyboard accessibility."
      fi
    fi

    # 10. Dialog without aria-label
    if grep -qE 'role="dialog"' "$FILE" && ! grep -qE 'aria-label=' "$FILE"; then
      error "$FILE — \`role=\"dialog\"\` without \`aria-label\`. Add a descriptive \`aria-label\`."
    fi

    # 11. Icon-only buttons without aria-label
    if grep -qE "<(button|motion\.button)" "$FILE"; then
      # Rough check: button contains svg but no aria-label
      if grep -qE "<svg" "$FILE" && ! grep -qE "aria-label=" "$FILE"; then
        warn "$FILE — button(s) with SVG content found but no \`aria-label\` detected in file. Verify all icon-only buttons have \`aria-label\`."
      fi
    fi

    # 12. Images without alt text
    if grep -qE "<img" "$FILE" && ! grep -qE 'alt=' "$FILE"; then
      error "$FILE — \`<img\` element without \`alt\` attribute."
    fi

    # 13. CSS transition on overflow-x: hidden (should be clip)
    if grep -qE '"[^"]*overflow-x-hidden[^"]*"' "$FILE"; then
      error "$FILE — \`overflow-x-hidden\` in className string. Use \`overflow-x-clip\`."
    fi

    # 14. Native resize listener — should route through useViewport
    # Allow it in useViewport.ts itself (the one true listener)
    BASENAME=$(basename "$FILE")
    if grep -qE "addEventListener\(['\"]resize['\"]" "$FILE" && [ "$BASENAME" != "useViewport.ts" ]; then
      error "$FILE — \`addEventListener('resize')\` detected. Use \`useViewport\` (\`vw\`/\`vh\` deps in \`useEffect\`) instead. Vanilla JS helpers must expose \`handleResize()\` and let the host component call it."
    fi
  done
fi

# ─────────────────────────────────────────────────────────────────────────────
# CSS / SCSS / SASS checks
# ─────────────────────────────────────────────────────────────────────────────
CSS_FILES=()
for f in "${FILES[@]}"; do
  [[ "$f" == *.css || "$f" == *.scss || "$f" == *.sass ]] && CSS_FILES+=("$f")
done

if [ ${#CSS_FILES[@]} -gt 0 ]; then
  section "CSS / SCSS / SASS"

  for FILE in "${CSS_FILES[@]}"; do
    [ -f "$FILE" ] || continue

    # 1. overflow-x: hidden — should be clip
    if grep -qE "overflow-x\s*:\s*hidden" "$FILE"; then
      error "$FILE — \`overflow-x: hidden\`. Use \`overflow-x: clip\` to avoid breaking \`position: sticky\`."
    fi

    # 2. @keyframes outside globals.css
    BASENAME=$(basename "$FILE")
    if grep -qE "@keyframes" "$FILE" && [ "$BASENAME" != "globals.css" ]; then
      warn "$FILE — \`@keyframes\` found outside \`globals.css\`. All shared keyframes should live in \`styles/globals.css\`."
    fi

    # 3. Hardcoded colors — should use CSS custom properties
    if grep -qE "#[0-9a-fA-F]{3,6}(?![0-9a-fA-F])" "$FILE"; then
      BASENAME=$(basename "$FILE")
      if [ "$BASENAME" != "globals.css" ]; then
        warn "$FILE — hardcoded hex color found. Use design tokens (\`var(--accent)\`, \`var(--fg-0)\`, etc.) instead."
      fi
    fi

    # 4. scroll-behavior: smooth — should rely on Lenis
    if grep -qE "scroll-behavior\s*:\s*smooth" "$FILE"; then
      warn "$FILE — \`scroll-behavior: smooth\` in CSS. Lenis manages smooth scroll; this property may conflict."
    fi
  done
fi

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
echo ""
if [ "$FAILED" -eq 1 ]; then
  echo -e "${RED}${BOLD}Standards check failed.${RESET} Fix the errors above before committing."
  [ "$WARNINGS" -gt 0 ] && echo -e "${YELLOW}${WARNINGS} warning(s) also found — review when possible.${RESET}"
  exit 1
elif [ "$WARNINGS" -gt 0 ]; then
  echo -e "${YELLOW}${BOLD}Standards check passed with ${WARNINGS} warning(s).${RESET} Review when possible."
  exit 0
else
  echo -e "${GREEN}${BOLD}✔ All standards checks passed.${RESET}"
  exit 0
fi
