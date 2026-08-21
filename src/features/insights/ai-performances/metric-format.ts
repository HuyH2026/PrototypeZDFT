// One place percentages are derived, so a card or a row cannot state a share its
// own counts contradict. The Figma frames' percentages don't reconcile with the
// counts beside them ("500 (8%) clicked" of "7,616 times surfaced" is 7%), so the
// counts are transcribed verbatim and the percentage is computed here.
export function pct(part: number, whole: number): string {
  if (whole === 0) return '0%'
  return `${Math.round((part / whole) * 100)}%`
}
