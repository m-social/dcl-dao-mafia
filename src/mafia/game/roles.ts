import { head, isHead, participants as getParticipants } from './participants'
import selfEnterLeaveEmitter from '../events/self-leave-enter'
import userData from '../user/data'

// import * as ui from '@dcl/ui-scene-utils'
import { MAFIA_FORMULA, WAIT_ROLES_BEFORE_CANCEL_MS } from '../constants/index'
import phasesMessageBus, { getPhase } from '../p2p/phases'
import votingMessageBus from '../p2p/voting'
import rolesMessageBus from '../p2p/roles'
import { emitRoles, onRoles } from '../events/roles'
import includes from '../utils/array/includes'
import removeOne from '../utils/array/removeOne'
import participantEmitter from '../events/participants'
import { setTimeout } from '@dcl/ecs-scene-utils'
import participantsMessageBus from '../p2p/participants'
import clearTimeout from '../utils/clearTimeout'

// const mafiaTexture = new Texture('images/roles/mafia.png')
// const civilTexture = new Texture('images/roles/civil.png')

export interface UserRole {
  id: string
  role: string
}

let _role: string | null = null
let _roles: UserRole[] | null = null
let _receivedRoles: Record<string, boolean> = {}
let _timeout: Entity | null = null
// const _icon: ui.MediumIcon = new ui.MediumIcon('images/logo.png', -25)
// _icon.hide()
// _icon.image.source = undefined

function shuffle<T>(arr: T[]) {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[j], copy[i]] = [copy[i], copy[j]]
  }
  return copy
}

export function assignRoles() {
  log('on:roles')
  const participants = getParticipants()

  let mafiaCount = 0
  const maxMafiaCount = MAFIA_FORMULA(participants.length)

  const roles = shuffle(participants).map((p, i) => {
    let role: string
    if (mafiaCount === maxMafiaCount) {
      role = 'civil'
    } else if (maxMafiaCount - mafiaCount >= participants.length - i) {
      role = 'mafia'
    } else {
      const isMafia = Math.random() < maxMafiaCount / participants.length

      role = isMafia ? 'mafia' : 'civil'
    }

    log('role', role)

    if (role === 'mafia') {
      ++mafiaCount
    }

    return { id: p.userId, role }
  })

  rolesMessageBus.emit('roles', roles)
}

rolesMessageBus.on('roles', async (roles: UserRole[]) => {
  const { userId } = (await userData()) ?? {}

  _roles = roles

  for (const { id, role } of roles) {
    if (userId === id) {
      _role = role
      // showRole(role)
      break
    }
  }

  rolesMessageBus.emit('received', { userId })
})

rolesMessageBus.on('received', ({ userId }) => {
  if (!userId) {
    return
  }

  if (!_receivedRoles[userId]) {
    _receivedRoles[userId] = true
  }

  tryStartGame()
})

function tryStartGame() {
  _timeout ??= setTimeout(WAIT_ROLES_BEFORE_CANCEL_MS, () => {
    if (!isHead() || !_roles) {
      return
    }

    const roles = _roles
    const received = _receivedRoles

    phasesMessageBus.emit('cancel', { inactive: true })

    for (const { id } of roles) {
      if (!received[id]) {
        participantsMessageBus.emit('leave', { userId: id, inactive: true })
      }
    }
  })

  if (!isHead() || !_roles || _roles.length === 0) {
    return
  }

  if (_roles.every(({ id }) => !!_receivedRoles[id])) {
    cancelTimeout()
    phasesMessageBus.emit('start', {})
  }
}

function cancelTimeout() {
  clearTimeout(_timeout)
  _timeout = null
}

selfEnterLeaveEmitter.on('leave', () => {
  reset()
})

onRoles('cancel', () => {
  if (isHead()) {
    phasesMessageBus.emit('cancel', {})
  }
})

export function getRole() {
  return _role
}

export function getPlayersRoles() {
  return _roles
}

export function isActivePlayer() {
  return isPlayer() && _role && includes(['mafia', 'civil'], _role)
}

export function isPlayer() {
  return !!_role
}

export function reset() {
  _role = null
  _roles = null
  _receivedRoles = {}
  cancelTimeout()
  // _icon.hide()
}

participantEmitter.on('self-leave', () => {
  reset()
})

// function showRole(role: string) {
// let info: { texture: Texture; name: string; color: Color4 } | null = null
// switch (role) {
//   case 'mafia':
//     info = {
//       texture: mafiaTexture,
//       name: 'Mafia',
//       color: Color4.Red()
//     }
//     break
//   case 'civil':
//     info = {
//       texture: civilTexture,
//       name: 'Civil',
//       color: Color4.Green()
//     }
//     break
// }
// if (!info) {
//   return
// }
// const { texture: path } = info
// _icon.image.source = path
// _icon.show()
// log('roles::values')
// }

phasesMessageBus.on('roles', () => {
  log(head())
  if (isHead()) {
    assignRoles()
  }
})

phasesMessageBus.on('cancel', () => {
  reset()
})

function processKick(id: string) {
  if (_roles) {
    removeOne(_roles, ({ id: userId }) => userId === id)
  }
}

function tryCancelGame() {
  if (_roles?.length === 0) {
    emitRoles('cancel', undefined)
    return true
  }
  return false
}

votingMessageBus.on('kill', async ({ id }: { id: string }) => {
  if (id === (await userData())?.userId) {
    _role = 'dead'
    emitRoles('self-kill', undefined)
  } else {
    emitRoles('other-kill', { id })
  }

  processKick(id)

  if (isHead()) {
    phasesMessageBus.emit('voted', {})
  }
})

function canVote(role: string, phase?: string | null) {
  switch (phase ?? getPhase()) {
    case 'day':
      return includes(['mafia', 'civil'], role)
    case 'night':
      return role === 'mafia'
    default:
      return false
  }
}

votingMessageBus.on('kick-inactive', async ({ phase, voted }: { phase: string; voted: string[] }) => {
  const userId = (await userData())?.userId

  getPlayersRoles()?.forEach(({ role, id }) => {
    if (canVote(role, phase) && !includes(voted, id)) {
      processKick(id)

      if (userId === id) {
        _role = 'kicked'

        emitRoles('self-inactive', undefined)
      }
    }
  })

  if (!tryCancelGame()) {
    emitRoles('after-inactive-kick', undefined)
  }
})

onLeaveSceneObservable.add(({ userId }) => {
  processKick(userId)
  tryCancelGame()
})

export function getRolesCount() {
  return _roles?.reduce(
    (acc, { role }) => {
      if (role === 'mafia') {
        ++acc.mafia
      } else if (role === 'civil') {
        ++acc.civil
      }
      return acc
    },
    { mafia: 0, civil: 0 }
  )
}
