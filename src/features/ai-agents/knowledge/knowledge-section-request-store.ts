import { useSyncExternalStore } from 'react'

export type KnowledgeSectionStatus = 'idle' | 'draft' | 'accepted'

let status: KnowledgeSectionStatus = 'idle'
const listeners = new Set<() => void>()

function emit(next: KnowledgeSectionStatus) {
  if (status === next) return
  status = next
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return status
}

export function useKnowledgeSectionStatus() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function addCancellationSection() {
  emit('draft')
}

export function acceptCancellationSection() {
  emit('accepted')
}

export function discardCancellationSection() {
  emit('idle')
}

export function clearKnowledgeSectionRequest() {
  emit('idle')
}
