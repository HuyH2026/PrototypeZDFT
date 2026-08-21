// Ids in this app are minted as `${slug}-${n}` from a module counter (no
// Date.now()/Math.random(), which are unavailable here). Any store that persists
// has to resume *above* the highest suffix it already handed out: a counter
// re-derived from the list's length can re-mint a live id after a delete or a
// reload, and consumers that look an entity up by id would then match two rows.
export function maxIdSuffix(ids: string[]): number {
  let max = 0
  for (const id of ids) {
    const match = /-(\d+)$/.exec(id)
    if (match) max = Math.max(max, Number(match[1]))
  }
  return max
}
