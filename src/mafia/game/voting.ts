import { UserData } from '@decentraland/Identity'
import phasesMessageBus, { getPhase, getPhaseId } from '../p2p/phases'
import votingMessageBus from '../p2p/voting'
import { isHead } from '../game/participants'
import selfEnterLeaveEmitter from '../events/self-leave-enter'
import { getPlayersRoles, getRolesCount } from './roles'
import find from '../utils/array/find'
import includes from '../utils/array/includes'
import votingEmitter from '../events/voting'

let _voting: Record<string, string[]> = {}

phasesMessageBus.on('day', () => {
  _voting = {}
})

phasesMessageBus.on('night', () => {
  _voting = {}
})

phasesMessageBus.on('end', () => {
  _voting = {}
})

phasesMessageBus.on('cancel', () => {
  _voting = {}
})

selfEnterLeaveEmitter.on('leave', () => {
  _voting = {}
})

votingMessageBus.on('vote', ({ phase, from: { userId }, aim }: { phase: string; from: UserData; aim: string }) => {
  if (getPhaseId() !== phase) {
    return
  }

  const { role } = find(getPlayersRoles() ?? [], ({ id }) => id === userId) ?? {}

  if (!role) {
    return
  }

  switch (getPhase()) {
    case 'day':
      if (!includes(['mafia', 'civil'], role)) {
        return
      }
      break
    case 'night':
      if (role !== 'mafia') {
        return
      }
      break
    default:
      return
  }

  if (!_voting[aim]) {
    _voting[aim] = [userId]
  } else {
    const votes = _voting[aim]

    if (!includes(votes, userId)) {
      votes.push(userId)
    }
  }

  if (isHead() && isAllVoted()) {
    votingEmitter.emit('end', undefined)
  }

  log('vote::', _voting)
})

function isAllVoted() {
  const phase = getPhase()

  if (phase !== 'day' && phase !== 'night') {
    return false
  }

  const { mafia, civil } = getRolesCount()!

  let expectedCount

  switch (phase) {
    case 'day':
      expectedCount = mafia + civil
      break
    case 'night':
      expectedCount = mafia
      break
    default:
      return false
  }

  let actualCount = 0

  for (const key in _voting) {
    actualCount += _voting[key].length
  }

  if (actualCount > expectedCount) {
    log('actual votes > expected :: ', actualCount, expectedCount)
  }

  return actualCount === expectedCount
}

export function result() {
  if (!isHead()) {
    return
  }

  log('result::', _voting)

  const res: { id: string[]; votes: number } = { id: [], votes: 0 }
  const voted: string[] = []

  for (const who in _voting) {
    voted.push(..._voting[who])

    const v = _voting[who]

    if (v.length > res.votes) {
      res.votes = v.length
      res.id = [who]
    } else if (v.length === res.votes) {
      res.id.push(who)
    }
  }

  const targets = res.id

  votingMessageBus.emit('results', { phase: getPhase(), voting: _voting })
  votingMessageBus.emit('kick-inactive', { phase: getPhase(), voted })

  _voting = {}

  if (!targets.length) {
    phasesMessageBus.emit('voted', {})
    return
  }

  const final = targets.length === 1 ? targets[0] : targets[Math.floor(Math.random() * targets.length)]
  votingMessageBus.emit('kill', { id: final })
}
