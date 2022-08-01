import { head, isHead, participants as getParticipants } from 'src/mafia/participants'
import { onSelfEnterLeave } from 'src/scene/enter-leave'
import userData from 'src/user/data'

import * as ui from '@dcl/ui-scene-utils'
import { MAFIA_FORMULA, MIN_PLAYER_COUNT, WAIT_BEFORE_START_MS } from 'src/constants/index'
import phasesMessageBus from 'src/p2p/phases'
import findIndexOf from 'src/utils/array/findIndexOf'
import votingMessageBus from 'src/p2p/voting'
import { setTimeout } from '@dcl/ecs-scene-utils'

export const rolesMessageBus = new MessageBus()

const mafiaTexture = new Texture('images/roles/mafia.png')
const civilTexture = new Texture('images/roles/civil.png')

export interface UserRole {
  id: string
  role: string
}

let _role: string | null = null
let _roles: UserRole[] | null = null
const _icon: ui.MediumIcon = new ui.MediumIcon('images/logo.png', -25)
_icon.hide()
// _icon.image.source = undefined

export function assignRoles() {
  log('on:roles')
  const participants = getParticipants()

  let mafiaCount = 0
  const maxMafiaCount = MAFIA_FORMULA(participants.length)

  const roles = participants.map((p, i) => {
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
      showRole(role)
      break
    }
  }

  setTimeout(WAIT_BEFORE_START_MS, () => {
    if (isHead()) {
      phasesMessageBus.emit('start', {})
    }
  })
})

onSelfEnterLeave('leave', () => {
  reset()
})

export function getRole() {
  return _role
}

export function getPlayersRoles() {
  return _roles
}

export function reset() {
  _role = null
  _roles = null
  _icon.hide()
}

function showRole(role: string) {
  let info: { texture: Texture; name: string; color: Color4 } | null = null

  switch (role) {
    case 'mafia':
      info = {
        texture: mafiaTexture,
        name: 'Mafia',
        color: Color4.Red()
      }
      break
    case 'civil':
      info = {
        texture: civilTexture,
        name: 'Civil',
        color: Color4.Green()
      }
      break
  }

  if (!info) {
    return
  }

  const { texture: path, name, color } = info

  _icon.image.source = path
  _icon.show()
  log('roles::values')
  ui.hideAnnouncements()
  ui.displayAnnouncement(`You're ${name}!`, 7, color)
}

phasesMessageBus.on('roles', () => {
  log(head())
  if (isHead()) {
    assignRoles()
  }
})

phasesMessageBus.on('cancel', () => {
  reset()
})

votingMessageBus.on('kick', async ({ id }: { id: string }) => {
  if (id === (await userData())?.userId) {
    _role = null
  }

  const i = findIndexOf(_roles, ({ id: userId }) => userId === id)

  if (i !== -1) {
    _roles?.splice(i, 1)
  }
})

onLeaveSceneObservable.add(({ userId }) => {
  const index = findIndexOf(_roles, ({ id }) => id === userId)

  if (index !== -1) {
    _roles?.splice(index, 1)
  }
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
