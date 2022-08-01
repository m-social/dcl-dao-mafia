import { setTimeout } from '@dcl/ecs-scene-utils'
import { UserData } from '@decentraland/Identity'
import phasesMessageBus, { getPhaseId } from 'src/p2p/phases'
import votingMessageBus from 'src/p2p/voting'
import { isHead } from 'src/mafia/participants'
import { onSelfEnterLeave } from 'src/scene/enter-leave'
import { WAIT_BEFORE_VOTING_RESULTS as WAIT_AFTER_VOTING_RESULTS } from 'src/constants/index'

let _voting: Record<string, string[]> = {}

phasesMessageBus.on('day', () => {
  _voting = {}
})

phasesMessageBus.on('night', () => {
  _voting = {}
})

phasesMessageBus.on('cancel', () => {
  _voting = {}
})

onSelfEnterLeave('leave', () => {
  _voting = {}
})

votingMessageBus.on('vote', ({ phase, from: { userId }, aim }: { phase: string; from: UserData; aim: string }) => {
  if (getPhaseId() !== phase) {
    return
  }

  if (!_voting[aim]) {
    _voting[aim] = [userId]
  } else {
    const votes = _voting[aim]

    if (votes.indexOf(userId) === -1) {
      votes.push(userId)
    }
  }

  log('vote::', _voting)
})

export function result(phase: string) {
  if (!isHead()) {
    return
  }

  log('result::', _voting)

  const res: { id: string[]; votes: number } = { id: [], votes: 0 }

  for (const who in _voting) {
    const v = _voting[who]

    if (v.length > res.votes) {
      res.votes = v.length
      res.id = [who]
    } else if (v.length === res.votes) {
      res.id.push(who)
    }
  }

  const targets = res.id

  if (!targets.length || (targets.length > 1 && phase === 'night')) {
    return
  }

  const final = targets.length === 1 ? targets[0] : targets[Math.floor(Math.random() * targets.length)]
  votingMessageBus.emit('kick', { id: final })

  _voting = {}

  return new Promise((resolve) => setTimeout(WAIT_AFTER_VOTING_RESULTS, resolve))
}
