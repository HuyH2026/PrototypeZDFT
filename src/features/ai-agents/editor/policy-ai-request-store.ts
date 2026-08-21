import { useSyncExternalStore } from 'react'

// The shared AI Studio host and the policy editor are mounted in separate
// subtrees. This tiny event counter hands the contextual "Review plan" action
// back to the editor without coupling either surface to the other's local state.
let reviewRequest = 0
const listeners = new Set<() => void>()

export function requestPolicyReview() {
  reviewRequest += 1
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function usePolicyReviewRequest() {
  return useSyncExternalStore(
    subscribe,
    () => reviewRequest,
    () => reviewRequest,
  )
}
