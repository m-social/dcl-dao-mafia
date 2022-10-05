import { displayAnnouncement } from '@dcl/ui-scene-utils'
import { UserData } from '@decentraland/Identity'
import { MAX_PLAYERS_COUNT, MIN_PLAYER_COUNT, WAIT_BEFORE_START_MS } from '../constants/index'
import headEmitter from '../events/head'
import { emitParticipant } from '../events/participants'
import participantsMessageBus from '../p2p/participants'
import phasesMessageBus, { getPhase, internalPhaseEmitter } from '../p2p/phases'
import ParticipantListWindow from '../ui/window/participant-list'
import userData from '../user/data'
import setInterval from '../utils/setInterval'

type UserDataWithTimestamp = UserData & { _ts: number }

// let _size = 0
let _participants: Record<string, UserDataWithTimestamp> = {}
let _info: UserDataWithTimestamp | null = null

let _head: UserDataWithTimestamp | null = null

let beforeGameTimeout: Entity | null = null

const participantsUi = new ParticipantListWindow()

function notifyMaxPlayers() {
  participantsUi.hide()

  // TODO: add custom window
  displayAnnouncement('There are already enough players. Wait until there is a slot for another player.', 10)
}

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
  if (size() >= MAX_PLAYERS_COUNT) {
    notifyMaxPlayers()
    return
  }

  return emit('participate')
}

export const leave = () => {
  return emit('leave')
}

function updateParticipantsUI() {
  const p = participants().map(({ displayName }) => displayName)
  participantsUi.updateParticipants(p)
}

function stopTimeout() {
  if (beforeGameTimeout) {
    engine.removeEntity(beforeGameTimeout)
    beforeGameTimeout = null
  }
}

function tryStartGame(time?: number) {
  if (!getPhase() && size() >= MIN_PLAYER_COUNT) {
    log('emit:roles')
    // phasesMessageBus.emit('roles', {})

    if (beforeGameTimeout || getPhase()) {
      return
    }

    let t = Math.max(Math.floor((WAIT_BEFORE_START_MS - (time ?? 0)) / 1000), 0)

    participantsUi.updateTimeout(t)

    beforeGameTimeout = setInterval(1000, () => {
      --t

      participantsUi.updateTimeout(t)
      if (t <= 0) {
        stopTimeout()

        if (isHead()) {
          phasesMessageBus.emit('roles', {})
        }
      }
    })

    participantsMessageBus.emit('full-participants', {
      participants: _participants,
      time: Date.now()
    })

    // assignRoles()
  }
}

function onParticipate(data: UserDataWithTimestamp) {
  const { userId } = data

  if (size() >= MAX_PLAYERS_COUNT) {
    if (isHead()) {
      participantsMessageBus.emit('participate-error', {
        to: userId,
        reason: 'MAX_PLAYERS_LIMIT_EXCEEDED'
      })
    }
    return
  }

  if (!_participants[userId]) {
    _participants[userId] = data
    // ++_size
    _head = cmpHead(_head, data)
  }

  log('participants::[participate]', userId)

  tryStartGame()

  updateParticipantsUI()

  if (_info?.userId === userId) {
    if (getPhase()) {
      participantsUi.setActiveGameStartText()
    }

    participantsUi.show()
  }
}

async function onLeave(userId: string) {
  if (_participants[userId]) {
    delete _participants[userId]
    // --_size

    if (_head?.userId === userId) {
      _head = findHead()
      headEmitter.emit('leave', { oldHeadId: userId, newHeadId: _head?.userId })
    }

    log('participants::[leave]', userId)

    if (size() < MIN_PLAYER_COUNT) {
      stopTimeout()
    }
  }

  if (_info?.userId === userId || (await userData())?.userId === userId) {
    _info = null
    participantsUi.hide()
    emitParticipant('self-leave', undefined)
  } else {
    updateParticipantsUI()
  }
}

participantsMessageBus.on('participate', (data: UserDataWithTimestamp) => {
  onParticipate(data)
})

participantsMessageBus.on('leave', async ({ userId, inactive }: UserData & { inactive: boolean }) => {
  await onLeave(userId)

  if (inactive && (await userData())?.userId === userId) {
    displayAnnouncement('There was a problem connecting you to the game :(', 5, Color4.Yellow())
  }
})

participantsMessageBus.on('full-participants', ({ participants, time }) => {
  // log(_from, participants)
  if (size(participants) <= size()) {
    return
  }

  _participants = participants
  updateParticipantsUI()
  _head = findHead()
  tryStartGame(Date.now() - time)
})

participantsMessageBus.on('participate-error', async ({ reason, to }) => {
  if (reason === 'MAX_PLAYERS_LIMIT_EXCEEDED') {
    if (to !== (await userData())?.userId) {
      notifyMaxPlayers()
    }
    void onLeave(to)
  }
})

phasesMessageBus.on('cancel', ({ autostart }) => {
  if (!autostart) {
    return
  }

  tryStartGame()

  updateParticipantsUI()

  if (isParticipating()) {
    participantsUi.show()
  }
})

participantsMessageBus.on('initial', async ({ to, info }: { to: string; info: UserDataWithTimestamp }) => {
  const { userId } = (await userData()) ?? {}

  log('participants::initial-received', userId, to, info)

  if (info && userId === to) {
    log('participants::initial-me', userId, to, info)
    log('current-head: ', _head)
    onParticipate(info)

    log('new-head: ', _head)
  }
})

onEnterSceneObservable.add(async ({ userId }) => {
  if (_info) {
    log('participants::initial-send', userId, _info)
    participantsMessageBus.emit('initial', { to: userId, info: _info })
  }
})

onLeaveSceneObservable.add(async ({ userId }) => {
  void onLeave(userId)

  if ((await userData())?.userId === userId) {
    reset()
  }
})

export function reset() {
  _participants = {}
  // _size = 0
  _info = null
  _head = null

  stopTimeout()
}

export function participants() {
  const arr: UserDataWithTimestamp[] = []
  for (const key in _participants) {
    if (Object.prototype.hasOwnProperty.call(_participants, key)) {
      arr.push(_participants[key])
    }
  }

  arr.sort(({ _ts: left }, { _ts: right }) => left - right)
  return arr
}

export function size(otherParticipants?: object) {
  return Object.keys(otherParticipants ?? _participants).length
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
  if (!next) {
    return actual
  }

  if (!actual) {
    return next
  }

  return actual._ts === next._ts && next.userId < actual.userId ? next : actual
}

export function head() {
  return _head
}

export function isHead() {
  return !!_info && !!_head && _info.userId === _head.userId
}

export function me() {
  return _info
}

/**
 * WARNING: don't modify data
 */
export function _unsafeParticipants() {
  return _participants
}

participantsUi.onClick = new OnPointerDown(() => {
  void leave()
})

phasesMessageBus.on('start', () => {
  participantsUi.hide()
})

internalPhaseEmitter.on('log-head', ({ phase }) => {
  log(`phase::${phase} - `, head())
})

// participantsUi.updateParticipants(['test', 'test', 'test', 'test'])
// participantsUi.show()

// messageBus.on('cancel', () => {
//   reset()
// })
