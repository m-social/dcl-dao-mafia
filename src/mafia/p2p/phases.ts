import { START_DAY } from '../constants/index'
import selfEnterLeaveEmitter from '../events/self-leave-enter'
import emitt from '../utils/emitt'
import { scoped } from './global'

let _phase: string | null = null
let _day = 0

const phasesMessageBus = scoped('phases')

export const internalPhaseEmitter = emitt<{
  'log-head': { phase: string }
}>()

phasesMessageBus.on('roles', () => {
  _phase = 'roles'
  _day = 0

  internalPhaseEmitter.emit('log-head', { phase: 'roles' })
})

phasesMessageBus.on('start', () => {
  _phase = 'start'
  _day = START_DAY

  internalPhaseEmitter.emit('log-head', { phase: 'start' })
})

phasesMessageBus.on('end', () => {
  _phase = 'end'
  _day = 0

  internalPhaseEmitter.emit('log-head', { phase: 'end' })
})

phasesMessageBus.on('cancel', () => {
  _phase = null
  _day = 0

  internalPhaseEmitter.emit('log-head', { phase: 'cancel' })
})

phasesMessageBus.on('discussion', ({ increaseDay = true }) => {
  _phase = 'discussion'
  if (increaseDay) {
    ++_day
  }

  internalPhaseEmitter.emit('log-head', { phase: 'discussion' })
})

phasesMessageBus.on('day', () => {
  _phase = 'day'

  internalPhaseEmitter.emit('log-head', { phase: 'day' })
})

phasesMessageBus.on('night', () => {
  _phase = 'night'

  internalPhaseEmitter.emit('log-head', { phase: 'night' })
})

phasesMessageBus.on('initial', ({ phase }: { phase: string | null }) => {
  _phase = phase

  internalPhaseEmitter.emit('log-head', { phase: 'initial' })
})

phasesMessageBus.on('voting', () => {
  internalPhaseEmitter.emit('log-head', { phase: 'voting' })
})

phasesMessageBus.on('voted', () => {
  internalPhaseEmitter.emit('log-head', { phase: 'voted' })
})

selfEnterLeaveEmitter.on('leave', () => {
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
