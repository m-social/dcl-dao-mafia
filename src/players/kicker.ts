import * as ui from '@dcl/ui-scene-utils'
import { movePlayerTo } from '@decentraland/RestrictedActions'

import { onSelfEnterLeave, state } from 'src/scene/enter-leave'
import { cancelVote, startVote } from '../ui/kick-vote'
import userData from 'src/user/data'
import playersData from 'src/players/info'
import { onKickVote as onKickVote } from '../ui/kick-vote'
import find from 'src/utils/array/find'
import { onId } from 'src/players/id'
import { setTimeout } from '@dcl/ecs-scene-utils'
import findIndexOf from 'src/utils/array/findIndexOf'
import { getPlayerData } from '@decentraland/Players'
import { scoped } from 'src/p2p/global'
import { TELEPORT_KICKED_PLAYER_TO, TIME_BEFORE_NEW_VOTE_MS, VOTING_DURATION_MS } from 'src/constants/index'

const kicker = scoped('kicker')

interface KickerKickInfo {
  whom: string
  yes: string[]
  no: string[]
  timer: Entity
}

let kickInfo: KickerKickInfo | null = null

const activeVoting: { whom: string; initiator: string }[] = []

let lastKickTime = Date.now()

export async function kickVote(name: string) {
  if (Date.now() - lastKickTime < TIME_BEFORE_NEW_VOTE_MS) {
    ui.displayAnnouncement('Wait 20 seconds to start new vote!', 5, Color4.Red())
    return
  }

  const data = await userData()

  if (data) {
    const { displayName } = data

    if (name === displayName) {
      ui.displayAnnouncement("You can't start voting against yourself!", 5, Color4.Red())
      return
    }
  }

  const whom = find(playersData, (pd) => pd.displayName === name)
  if (!whom) {
    ui.displayAnnouncement(`Player "${name}" doesn't exist or not found!`, 5)
    return
  }

  if (activeVoting.length > 0) {
    ui.displayAnnouncement(`Another voting is in progress!`, 5)
    return
  }

  if (kickInfo) {
    ui.displayAnnouncement("You can't start more then one voting at the same time", 5)
    return
  }

  const { userId } = whom
  if (activeVoting.some(({ whom: who }) => userId === who)) {
    ui.displayAnnouncement(`Voting against "${name}" has already started!`, 5)
    return
  }

  if (!data) {
    ui.displayAnnouncement('Error when starting the vote!', 5)
  } else {
    const { userId } = whom

    kickInfo = {
      yes: [],
      no: [],
      whom: userId,
      timer: setTimeout(VOTING_DURATION_MS, async () => {
        await finishKick()
      })
    }
    kicker.emit('vote-kick', { name, userId, initiator: data.userId })
  }
  // kicker.emit('kick', { name })
}

kicker.on('vote-kick', async ({ name, userId, initiator }) => {
  log('vote-kick', name)

  if (!state()) {
    return
  }

  activeVoting.push({ whom: userId, initiator })
  startVote(name, userId)
})

async function finishKick() {
  if (kickInfo) {
    const { no, yes, whom } = kickInfo
    kickInfo = null

    const result = yes.length + no.length >= (playersData.length + 1) / 2 ? yes.length > no.length : undefined

    if (result) {
      kicker.emit('kick', { userId: whom })
    }

    const data = await userData()
    kicker.emit('kick-end', { result, whom, initiator: data?.userId })
  }
}

kicker.on('kick-answer', async ({ userId, answer, from }) => {
  if (!kickInfo || kickInfo.whom !== userId) {
    return
  }

  const { no, yes } = kickInfo

  if (no.indexOf(from) !== -1 || yes.indexOf(from) !== -1) {
    return
  }

  ;(answer ? yes : no).push(from)

  if (yes.length + no.length >= playersData.length + 1) {
    cancelTimer()
    await finishKick()
  }
})

kicker.on('kick', async ({ userId }) => {
  log('kick', userId)

  if (!state()) {
    return
  }

  const data = await userData()

  if (userId === data?.userId) {
    await movePlayerTo(TELEPORT_KICKED_PLAYER_TO)
    ui.displayAnnouncement(`Bye bye, ${data?.displayName}!`, 5, Color4.Red())
  }
})

async function onKickEnd({
  result,
  whom,
  initiator
}: {
  result: boolean | undefined
  whom: string
  initiator: string
}) {
  const i = findIndexOf(activeVoting, (u) => u.whom === whom && u.initiator === initiator)

  if (i !== -1) {
    activeVoting.splice(i, 1)
  }

  lastKickTime = Date.now()

  const data = await getPlayerData({ userId: whom })

  if (!data) {
    return
  }

  cancelVote(whom)

  const { displayName } = data

  if (result === undefined) {
    ui.displayAnnouncement(`Voting against player "${displayName}" was cancelled`, 5, Color4.Yellow())
    return
  }

  const user = await userData()

  if (!user || user.userId !== whom) {
    ui.displayAnnouncement(`Player "${displayName}" was${result ? '' : "n't"} kicked`, 5, Color4.Green())
  }
}

kicker.on('kick-end', onKickEnd)

onKickVote('answer', async ({ userId, value }) => {
  const data = await userData()
  if (!data) {
    ui.displayAnnouncement('An error occurred when submitting the answer!', 5)
  } else {
    kicker.emit('kick-answer', { userId, answer: value, from: data.userId })
  }
})

function cancelKick() {
  cancelTimer()
  kickInfo = null
}

onId('leave', async (id) => {
  if (kickInfo?.whom === id) {
    cancelKick()
  }

  activeVoting
    .filter(({ whom, initiator }) => initiator === id || whom === id)
    .forEach((v) => onKickEnd({ ...v, result: undefined }))
})

onSelfEnterLeave('leave', () => {
  activeVoting.splice(0)
  cancelKick()
})

onSelfEnterLeave('enter', () => {
  lastKickTime = Date.now()
})

function cancelTimer() {
  if (kickInfo?.timer) {
    engine.removeEntity(kickInfo.timer)
  }
}

export default kicker

export function hasActiveKick() {
  return !!kickInfo
}

export function canStartVote() {
  return Date.now() - lastKickTime >= TIME_BEFORE_NEW_VOTE_MS
}

export function remainingSecondsBeforeKick() {
  return Math.round((TIME_BEFORE_NEW_VOTE_MS - (Date.now() - lastKickTime)) / 1000)
}

export function anotherInProgress() {
  return activeVoting.length > 0
}
