// Segment swatch colours, shared by the Agent Builder's card lists (AI QA's
// rubrics, Knowledge's coaching rules and content snippets).
//
// Segments are named per brand, so the colour lives here rather than in
// channel-meta.ts (which keys off *channels*). The lookup is case-insensitive
// because the frames disagree on the casing of the same segment ("Business
// Riders" in AI QA, "Business riders" in Knowledge).
export const SEGMENT_COLORS: Record<string, string> = {
  riders: '#ff70c6',
  'business riders': '#85beff',
  // The rest of the segment vocabulary the seeded use cases are scoped to
  // (agent-builder-data.ts). Hues are borrowed from the palette already in use
  // for channels and step badges rather than invented, so a segment chip sits
  // alongside a channel badge without introducing a new colour family.
  drivers: '#5aa9e6',
  couriers: '#0f8a5f',
  'eats customers': '#e05c34',
  'one members': '#724be8',
  carriers: '#b8710a',
  'health partners': '#0f8a8f',
}

export function segmentColor(segment: string): string {
  return SEGMENT_COLORS[segment.toLowerCase()] ?? '#c9c7c3'
}
