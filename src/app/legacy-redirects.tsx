import { Navigate, useParams, useLocation } from 'react-router'

/**
 * Re-points a pre-consolidation URL at its new home, carrying any deep-link
 * segment, query string, and hash with it: mounted at `tools/*` with
 * `to="/agent-builder/actions"`, it sends `/tools/t1?id=x#section` to
 * `/agent-builder/actions/t1?id=x#section`.
 *
 * Always replaces, so the dead URL does not sit in history for Back to land on.
 */
export function LegacyRedirect({ to }: { to: string }) {
  const params = useParams()
  const location = useLocation()
  const rest = params['*']
  const target = rest ? `${to}/${rest}` : to
  return <Navigate to={`${target}${location.search}${location.hash}`} replace />
}

/**
 * Wraps Navigate to preserve query string and hash across a redirect. Use this
 * in static route entries instead of bare <Navigate> so bookmarked URLs with
 * params don't lose their state.
 */
export function RedirectWithParams({ to }: { to: string }) {
  const location = useLocation()
  return <Navigate to={`${to}${location.search}${location.hash}`} replace />
}
