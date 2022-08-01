import { getUserData } from '@decentraland/Identity'
import { getPlayersInScene } from '@decentraland/Players'
import emitt from 'src/utils/emitt'

export type EnterLeaveEventType = 'enter' | 'leave'
export type EnterLeaveEventHandler = () => void

let isOnScene: boolean | null = null

const emitter = emitt<{
  enter: string
  leave: string
}>()

export const { on: onSelfEnterLeave, off: offSelfEnterLeave } = emitter

onSelfEnterLeave('enter', () => {
  isOnScene = true
})

onSelfEnterLeave('leave', () => {
  isOnScene = false
})

// export function on(event: EnterLeaveEventType, f: EnterLeaveEventHandler) {
//   if (event === 'enter') {
//     enterListeners.push(f)
//   } else if (event === 'leave') {
//     leaveListeners.push(f)
//   }
// }

export function state() {
  return isOnScene
}

void executeTask(async () => {
  const [myPlayer, allPlayers] = await Promise.all([getUserData(), getPlayersInScene()])

  if (myPlayer && allPlayers.some(({ userId }) => myPlayer?.userId === userId)) {
    emitter.emit('enter', myPlayer.userId)
  }

  onEnterSceneObservable.add((player) => {
    if (player.userId === myPlayer?.userId) {
      emitter.emit('enter', myPlayer.userId)
    }
  })

  onLeaveSceneObservable.add((player) => {
    if (player.userId === myPlayer?.userId) {
      emitter.emit('leave', myPlayer.userId)
    }
  })
})
