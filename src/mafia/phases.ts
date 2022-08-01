import { Delay, setTimeout } from '@dcl/ecs-scene-utils'
import { CornerLabel, CustomPrompt, displayAnnouncement } from '@dcl/ui-scene-utils'
import createSelectPlayerPrompt from 'src/ui/select-player'
import phasesMessageBus, { getDayNumber, getPhase, getPhaseId } from 'src/p2p/phases'
import votingMessageBus from 'src/p2p/voting'
import { isHead, isParticipating, me, _unsafeParticipants } from 'src/mafia/participants'
import { onSelfEnterLeave } from 'src/scene/enter-leave'
import userData from 'src/user/data'
import { getPlayersRoles, getRole, getRolesCount } from './roles'
import { result } from './voting'
import { GAME_PHASES_DURATION_MS, SHOW_PHASE_LABEL, WINNER_MESSAGE_DURATION_S } from 'src/constants/index'

let timerEntity: Entity | null = null
const label = new CornerLabel('', -135)
label.uiText.hTextAlign = 'right'
label.hide()

let _prompt: CustomPrompt | null = null

const START_PHASE = 'night'

// const emitter = emitt<{
//   roles: undefined
//   day: number
//   night: number
// }>()

// export const { on: onGamePhase, off: offGamePhase, emit: emitGamePhase } = emitter

phasesMessageBus.on('start', () => {
  if (isHead()) {
    // reset it again

    phasesMessageBus.emit(START_PHASE, {})
  }
})

phasesMessageBus.on('cancel', () => {
  onCancel()
})

votingMessageBus.on('kick', async ({ id }) => {
  if (id === (await userData())?.userId) {
    onCancel()
  }
})

phasesMessageBus.on('end', ({ winner }: { winner: string }) => {
  if (winner === 'mafia') {
    displayAnnouncement('The Mafia won!', WINNER_MESSAGE_DURATION_S, Color4.Red())
  } else if (winner === 'civil') {
    displayAnnouncement('The Civilians won!', WINNER_MESSAGE_DURATION_S, Color4.Green())
  }
})

phasesMessageBus.on('day', () => {
  onStart()

  const from = me()
  if (from) {
    const phase = getPhaseId()

    const players = getPlayersRoles()
      ?.filter(({ id }) => id !== from.userId)
      .map(({ id }) => _unsafeParticipants()[id])
      .filter(Boolean)

    if (players) {
      _prompt = createSelectPlayerPrompt(players, ({ userId }) => {
        votingMessageBus.emit('vote', { phase, from, aim: userId })
      })
    }
  }
})

phasesMessageBus.on('night', () => {
  onStart()

  log(getRole(), me())

  const from = me()
  if (getRole() === 'mafia' && from) {
    const phase = getPhaseId()

    const civil = getPlayersRoles()
      ?.filter(({ role }) => role === 'civil')
      .map(({ id }) => _unsafeParticipants()[id])
      .filter(Boolean)

    if (civil) {
      _prompt = createSelectPlayerPrompt(civil, ({ userId }) => {
        votingMessageBus.emit('vote', { phase, from, aim: userId })
      })
    }
  }
})

async function tryChangePhase(nextPhase: string) {
  await result(nextPhase === 'day' ? 'night' : 'day')

  if (isHead()) {
    const rolesCount = getRolesCount()
    log(rolesCount)
    if (rolesCount) {
      const { mafia, civil } = rolesCount

      if (nextPhase === 'night') {
        // day
        if (mafia > civil || mafia === 0) {
          phasesMessageBus.emit('end', { winner: mafia > civil ? 'mafia' : 'civil' })
          phasesMessageBus.emit('cancel', {})
          return
        }
      } else if (nextPhase === 'day') {
        // night
        // TODO: should be ge (>=), not gt (>)
        if (mafia > civil) {
          phasesMessageBus.emit('end', { winner: 'mafia' })
          phasesMessageBus.emit('cancel', {})
          return
        }
      }
    }

    phasesMessageBus.emit(nextPhase, {})
  }
}

function onStart() {
  const phase = getPhase()
  if (isParticipating() && (phase === 'day' || phase === 'night')) {
    timerEntity = setTimeout(GAME_PHASES_DURATION_MS, () => {
      if (_prompt) {
        _prompt.hide()
        _prompt = null
      }
      void tryChangePhase(phase === 'day' ? 'night' : 'day')
    })
    showPhase()
  }
}

function onCancel() {
  if (timerEntity) {
    // TODO: check if it's enough to stop timer
    timerEntity.removeComponent(Delay)
    engine.removeEntity(timerEntity)
  }

  _prompt?.hide()
  _prompt = null

  label.hide()
}

function showPhase() {
  const phase = getPhase()
  if (phase && SHOW_PHASE_LABEL) {
    label.uiText.value = `${phase[0].toUpperCase()}${phase.slice(1)} ${getDayNumber()}`
    label.show()
  }
}

onSelfEnterLeave('leave', onCancel)

onEnterSceneObservable.add(() => {
  if (isHead()) {
    phasesMessageBus.emit('initial', { phase: getPhase() })
  }
})
