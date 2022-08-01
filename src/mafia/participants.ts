import { UserData } from '@decentraland/Identity'
import { MIN_PLAYER_COUNT } from 'src/constants/index'
import participantsMessageBus from 'src/p2p/participants'
import phasesMessageBus, { getPhase } from 'src/p2p/phases'
import userData from 'src/user/data'

type UserDataWithTimestamp = UserData & { _ts: number }

let _size = 0
let _participants: Record<string, UserDataWithTimestamp> = {}
let _info: UserDataWithTimestamp | null = null

let _head: UserDataWithTimestamp | null = null

async function emit(event: string) {
  const data = await userData()

  if (!data) {
    return false
  }

  const payload = { ...data, _ts: Date.now() }

  if (event === 'participate') {
    _info = payload
  } else if (event === 'leave') {
    _info = null
  }

  participantsMessageBus.emit(event, payload)
  return true
}

export const participate = () => {
  return emit('participate')
}
export const leave = () => {
  return emit('leave')
}

function onParticipate(data: UserDataWithTimestamp) {
  const { userId } = data
  if (!_participants[userId]) {
    _participants[userId] = data
    ++_size
    _head = cmpHead(_head, data)
  }

  log('participants::[participate]', userId)

  if (!getPhase() && size() >= MIN_PLAYER_COUNT && isHead()) {
    log('emit:roles')
    phasesMessageBus.emit('roles', {})
    // assignRoles()
  }
}

function onLeave(userId: string) {
  if (_participants[userId]) {
    delete _participants[userId]
    --_size

    if (_head?.userId === userId) {
      _head = findHead()
    }

    log('participants::[leave]', userId)
  }
}

participantsMessageBus.on('participate', (data: UserDataWithTimestamp) => {
  onParticipate(data)
})

participantsMessageBus.on('leave', ({ userId }: UserData) => {
  onLeave(userId)
})

participantsMessageBus.on('initial', async ({ to, info }: { to: string; info: UserDataWithTimestamp }) => {
  const { userId } = (await userData()) ?? {}

  if (userId === to) {
    _participants[info.userId] = info

    _head = cmpHead(_head, info)
  }
})

onEnterSceneObservable.add(({ userId }) => {
  _info && participantsMessageBus.emit('initial', { to: userId, info: _info })
})

onLeaveSceneObservable.add(async ({ userId }) => {
  onLeave(userId)

  if ((await userData())?.userId === userId) {
    reset()
  }
})

export function reset() {
  _participants = {}
  _size = 0
  _info = null
  _head = null
}

export function participants() {
  const arr: UserDataWithTimestamp[] = []
  for (const key in _participants) {
    if (Object.prototype.hasOwnProperty.call(_participants, key)) {
      arr.push(_participants[key])
    }
  }
  return arr
}

export function size() {
  return _size
}

export function isParticipating() {
  return _info !== null
}

function findHead() {
  let min = null

  for (const key in _participants) {
    if (Object.prototype.hasOwnProperty.call(_participants, key)) {
      const v = _participants[key]

      min = cmpHead(min, v)
    }
  }

  return min
}

function cmpHead(actual: UserDataWithTimestamp | null, next: UserDataWithTimestamp) {
  return !actual || actual._ts > next._ts || (actual._ts === next._ts && next.userId < actual.userId) ? next : actual
}

export function head() {
  return _head
}

export function isHead() {
  return _info && _head && _info.userId === _head.userId
}

export function me() {
  return _info
}

/**
 * WARNING: don't modify data
 */
export function _unsafeParticipants(): typeof _participants {
  return _participants
}

// messageBus.on('cancel', () => {
//   reset()
// })
