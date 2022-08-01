import { onSelfEnterLeave } from 'src/scene/enter-leave'
import { scoped } from './global'

let _phase: string | null = null
let _day = 0

const phasesMessageBus = scoped('phases')

phasesMessageBus.on('roles', () => {
  _phase = 'roles'
  _day = 0
})

phasesMessageBus.on('start', () => {
  _phase = 'start'
  _day = 1
})

phasesMessageBus.on('cancel', () => {
  _phase = null
  _day = 0
})

phasesMessageBus.on('day', () => {
  _phase = 'day'
  ++_day
})

phasesMessageBus.on('night', () => {
  _phase = 'night'
})

phasesMessageBus.on('initial', ({ phase }: { phase: string | null }) => {
  _phase = phase
})

onSelfEnterLeave('leave', () => {
  _phase = null
  _day = 0
})

export default phasesMessageBus

export function getPhase() {
  return _phase
}

export function getDayNumber() {
  return _day
}

export function getPhaseId() {
  return `${_phase}-${_day}}`
}
