import { CustomPrompt, displayAnnouncement } from '@dcl/ui-scene-utils'
import createSelectPlayerPrompt from '../ui/select/select-player'
import phasesMessageBus, { getDayNumber, getPhase, getPhaseId } from '../p2p/phases'
import votingMessageBus from '../p2p/voting'
import { head, isHead, leave, me, _unsafeParticipants } from './participants'
import selfEnterLeaveEmitter from '../events/self-leave-enter'
import { getPlayersRoles, getRole, getRolesCount, isActivePlayer, isPlayer } from './roles'
import { result } from './voting'
import {
  DAY_DISCUSSION_DURATION_MS,
  GAME_PHASES_DURATION_MS,
  START_PHASE,
  WAIT_AFTER_GAME_END_MS
} from '../constants/index'
import headEmitter from '../events/head'
import NightWindow from '../ui/window/night'
import DayWindow from '../ui/window/day'
import WinnerWindow from '../ui/window/winner'
import participantEmitter, { onParticipant } from '../events/participants'
import setInterval from '../utils/setInterval'
import KilledWindow from '../ui/window/dead'
import DiscussionWindow from '../ui/window/discussion'
import rolesEmitter, { onRoles } from '../events/roles'
import VotingResultsWindow from '../ui/window/voting-result'
import votingEmitter from '../events/voting'
import userData from '../user/data'

let timerEntity: Entity | null = null
// const label = new CornerLabel('', -135)
// label.uiText.hTextAlign = 'right'
// label.hide()

let _prompt: CustomPrompt | null = null

let _votingState: null | 'voting' | 'voted' = null

const nightUi = new NightWindow()
const dayUi = new DayWindow()
const winnerUi = new WinnerWindow()
const killedUi = new KilledWindow()
const discussionUi = new DiscussionWindow()
const votingResultsUi = new VotingResultsWindow()

winnerUi.onClick = new OnPointerDown(async () => {
  await leave()
  winnerUi.hide()
})

killedUi.onClick = new OnPointerDown(async () => {
  await leave()
  killedUi.hide()
})

// const emitter = emitt<{
//   roles: undefined
//   day: number
//   night: number
// }>()

// export const { on: onGamePhase, off: offGamePhase, emit: emitGamePhase } = emitter

function isPlayablePhase(phase: string | null) {
  return phase === 'day' || phase === 'night'
}

function hideDayNightWindows() {
  dayUi.hide()
  nightUi.hide()
}

function hideAllWindows() {
  hideDayNightWindows()
  winnerUi.hide()
  discussionUi.hide()
  killedUi.hide()
}

onParticipant('self-leave', () => {
  hideAllWindows()
})

// onParticipant('self-participate', () => {
//   killedUi.hide()
// })

selfEnterLeaveEmitter.on('leave', () => {
  hideAllWindows()
})

phasesMessageBus.on('start', () => {
  discussionUi.hide()
  winnerUi.hide()

  nightUi.setRole(getRole())
  dayUi.setRole(getRole())
  discussionUi.setRole(getRole())

  if (isHead()) {
    // reset it again

    phasesMessageBus.emit(START_PHASE, { increaseDay: false })
  }
})

phasesMessageBus.on('cancel', ({ inactive }) => {
  onCancel()

  if (inactive) {
    displayAnnouncement('Game canceled: some players failed to connect', 5, Color4.Yellow())
  }
})

onRoles('self-kill', () => {
  softCancel()
  votingResultsUi.hide()
  killedUi.show()
})

phasesMessageBus.on('end', ({ winner }: { winner: string }) => {
  // if (winner === 'mafia') {
  //   displayAnnouncement('The Mafia won!', WINNER_MESSAGE_DURATION_S, Color4.Red())
  // } else if (winner === 'civil') {
  //   displayAnnouncement('The Villagers won!', WINNER_MESSAGE_DURATION_S, Color4.Green())
  // }

  hideDayNightWindows()

  if (!isPlayer()) {
    return
  }

  onCancel(true)

  killedUi.hide()
  winnerUi.setWinner(winner)

  let s = WAIT_AFTER_GAME_END_MS / 1000

  winnerUi.updateCountdown(s)

  const interval = setInterval(1000, () => {
    --s

    if (!winnerUi.visible()) {
      engine.removeEntity(interval)
      return
    }

    if (s <= 0) {
      phasesMessageBus.emit('cancel', { autostart: true })
      winnerUi.hide()
      engine.removeEntity(interval)
    } else {
      winnerUi.updateCountdown(s)
    }
  })

  winnerUi.show()
})

phasesMessageBus.on('day', () => {
  onStart()

  if (!isActivePlayer()) {
    return
  }

  dayUi.changeDay(getDayNumber())

  const from = me()
  if (from) {
    const phase = getPhaseId()

    const role = getRole()

    const players = getPlayersRoles()
      ?.filter(({ id, role: playerRole }) => id !== from.userId && (role !== 'mafia' || playerRole !== 'mafia'))
      .map(({ id }) => _unsafeParticipants()[id])
      .filter(Boolean)

    log('day::players', getPlayersRoles(), JSON.parse(JSON.stringify(_unsafeParticipants())), players)

    if (players) {
      if (_prompt) {
        log('prompt is already open, ', head())
        _prompt.hide()
        _prompt = null
      }

      _prompt = createSelectPlayerPrompt(
        players,
        ({ userId }) => {
          votingMessageBus.emit('vote', { phase, from, aim: userId })
        },
        'Try to guess\nwho the mafia is'
      )
    }
  }

  votingResultsUi.hide()
  nightUi.hide()
  dayUi.show()
})

// dayUi.setRole('civil')
// dayUi.updateCountdown(6)
// dayUi.changeDay(1)
// dayUi.show()

// nightUi.setRole('mafia')
// nightUi.changeDay(1)
// nightUi.updateMafia(['test', 'test', 'test', 'test', 'test', 'test'])
// nightUi.updateCountdown(1)
// nightUi.show()

phasesMessageBus.on('night', () => {
  onStart()

  if (!isActivePlayer()) {
    return
  }

  nightUi.changeDay(getDayNumber())

  log('night::start', getRole(), me())

  const from = me()
  if (getRole() === 'mafia' && from) {
    const phase = getPhaseId()

    nightUi.updateMafia(
      getPlayersRoles()
        ?.filter(({ id, role }) => role === 'mafia' && id !== from.userId)
        .map(({ id }) => _unsafeParticipants()[id]?.displayName)
        .filter(Boolean) ?? []
    )

    const civil = getPlayersRoles()
      ?.filter(({ role }) => role === 'civil')
      .map(({ id }) => _unsafeParticipants()[id])
      .filter(Boolean)

    log('night::players', getPlayersRoles(), JSON.parse(JSON.stringify(_unsafeParticipants())), civil)

    if (civil) {
      if (_prompt) {
        log('prompt is already open, ', head())
        _prompt.hide()
        _prompt = null
      }

      _prompt = createSelectPlayerPrompt(
        civil,
        ({ userId }) => {
          votingMessageBus.emit('vote', { phase, from, aim: userId })
        },
        'Choose who to kill?'
      )
    }
  }

  nightUi.show()
})

phasesMessageBus.on('discussion', () => {
  hideDayNightWindows()
  hidePrompt()

  cancelTimer()

  let time = Math.floor(DAY_DISCUSSION_DURATION_MS / 1000)

  const updateCountdown = () => {
    if (isActivePlayer()) {
      discussionUi.updateCountdown(time)
    }
  }

  const timer = (timerEntity = setInterval(1000, () => {
    if (timer !== timerEntity) {
      return
    }

    --time

    log('tick - ', time)

    if (time < 0) {
      cancelTimer()
      discussionUi.hide()

      if (!isHead()) {
        return
      }

      phasesMessageBus.emit('day', {})
    } else {
      updateCountdown()
    }
  }))

  if (isActivePlayer()) {
    updateCountdown()
    discussionUi.changeDay(getDayNumber())
    discussionUi.show()
  }
})

function tryFinishGame() {
  if (!isHead()) {
    return false
  }

  const rolesCount = getRolesCount()
  if (rolesCount) {
    const { mafia, civil } = rolesCount

    if (mafia >= civil || mafia === 0) {
      phasesMessageBus.emit('end', { winner: mafia === 0 ? 'civil' : 'mafia' })
      return true
    }
  }

  return false
}

function afterPhaseEnd() {
  cancelTimer()
  hidePrompt()

  hideDayNightWindows()

  if (!isHead()) {
    return
  }

  const currentPhase = getPhase()

  log(currentPhase)

  if (isPlayablePhase(currentPhase)) {
    phasesMessageBus.emit('voting', {})
  }
}

phasesMessageBus.on('voting', () => {
  log('voting-results')
  _votingState = 'voting'
  void result()
})

phasesMessageBus.on('voted', () => {
  log('voted')
  _votingState = null

  const phase = getPhase()

  const nextPhase = phase === 'day' ? 'night' : phase === 'night' ? 'discussion' : undefined

  if (isHead() && !tryFinishGame() && nextPhase) {
    phasesMessageBus.emit(nextPhase, {})
  }
})

votingMessageBus.on('results', async ({ phase, voting }: { phase: string; voting: Record<string, string[]> }) => {
  if (phase !== 'day') {
    return
  }

  const { userId } = (await userData()) ?? {}

  if (!isActivePlayer()) {
    return
  }

  let selfVoted = false
  const results: [who: string, whom: string][] = []

  for (const whom in voting) {
    const { displayName: whomName } = _unsafeParticipants()[whom] ?? {}

    for (const who of voting[whom]) {
      if (who === userId) {
        selfVoted = true
      }

      if (!whomName) {
        continue
      }

      const { displayName: whoName } = _unsafeParticipants()[who] ?? {}

      if (whoName) {
        results.push([whoName, whomName])
      }
    }
  }

  if (results.length > 0 && selfVoted) {
    votingResultsUi.updateResults(results)
    votingResultsUi.open(true)
  }
})

// votingResultsUi.updateResults([
//   ['test', 'tost'],
//   ['foo', 'bar']
// ])
// votingResultsUi.show()

function onStart() {
  hideDayNightWindows()
  discussionUi.hide()

  const phase = getPhase()
  if (!isPlayer() || !isPlayablePhase(phase)) {
    return
  }

  cancelTimer()

  // showPhase()

  let time = Math.floor(GAME_PHASES_DURATION_MS / 1000)

  const updateCountdown = () => {
    if (!isActivePlayer()) {
      return
    }

    if (phase === 'day') {
      dayUi.updateCountdown(time)
    } else if (phase === 'night') {
      nightUi.updateCountdown(time)
    }
  }

  updateCountdown()

  const timer = (timerEntity = setInterval(1000, () => {
    if (timer !== timerEntity) {
      return
    }

    --time

    log('tick - ', time)

    if (time < 0) {
      afterPhaseEnd()
    } else {
      updateCountdown()
    }
  }))
}

votingEmitter.on('end', () => {
  afterPhaseEnd()
})

function hidePrompt() {
  if (_prompt) {
    _prompt.hide()
    _prompt = null
  }
}

function softCancel() {
  log('soft-cancel')

  hidePrompt()

  // label.hide()
  hideDayNightWindows()
  discussionUi.hide()
  killedUi.hide()
}

function cancelTimer() {
  if (timerEntity) {
    engine.removeEntity(timerEntity)
    timerEntity = null
  }
}

function onCancel(keepVotingResults?: boolean) {
  softCancel()
  cancelTimer()
  if (!keepVotingResults) {
    votingResultsUi.hide()
  }
}

participantEmitter.on('self-leave', () => {
  onCancel()
})

// function showPhase() {
//   const phase = getPhase()
//   if (phase && SHOW_PHASE_LABEL) {
//     label.uiText.value = `${phase[0].toUpperCase()}${phase.slice(1)} ${getDayNumber()}`
//     label.show()
//   }
// }

selfEnterLeaveEmitter.on('leave', () => onCancel())

onEnterSceneObservable.add(() => {
  if (isHead()) {
    phasesMessageBus.emit('initial', { phase: getPhase() })
  }
})

onLeaveSceneObservable.add(() => {
  const phase = getPhase()

  if (isHead() && !_votingState && isPlayablePhase(phase)) {
    tryFinishGame()
  }
})

onRoles('after-inactive-kick', () => {
  if (isHead()) {
    tryFinishGame()
  }
})

// restart voting phase
headEmitter.on('leave', () => {
  if (_votingState && isHead()) {
    phasesMessageBus.emit(_votingState, {})
  }
})

rolesEmitter.on('self-inactive', () => {
  softCancel()
  votingResultsUi.hide()
})
