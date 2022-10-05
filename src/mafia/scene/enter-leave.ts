import { getUserData } from '@decentraland/Identity'
import { getPlayersInScene } from '@decentraland/Players'
import selfEnterLeaveEmitter from '../events/self-leave-enter'

export type EnterLeaveEventType = 'enter' | 'leave'
export type EnterLeaveEventHandler = () => void

let isOnScene: boolean | null = null

// export const { on: selfEnterLeaveEmitter.on, off: offSelfEnterLeave } = selfEnterLeaveEmitter

selfEnterLeaveEmitter.on('enter', () => {
  isOnScene = true
})

selfEnterLeaveEmitter.on('leave', () => {
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
    selfEnterLeaveEmitter.emit('enter', myPlayer.userId)
  }

  onEnterSceneObservable.add((player) => {
    if (player.userId === myPlayer?.userId) {
      selfEnterLeaveEmitter.emit('enter', myPlayer.userId)
    }
  })

  onLeaveSceneObservable.add((player) => {
    if (player.userId === myPlayer?.userId) {
      selfEnterLeaveEmitter.emit('leave', myPlayer.userId)
    }
  })
})

export default selfEnterLeaveEmitter
