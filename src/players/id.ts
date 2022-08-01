import { getPlayersInScene } from '@decentraland/Players'
import emitt from 'src/utils/emitt'
import findIndexOf from 'src/utils/array/findIndexOf'
import userData from 'src/user/data'

type PlayerId = string

const emitter = emitt<{
  init: PlayerId[]
  enter: PlayerId
  leave: PlayerId
  change: { user: PlayerId; type: 'enter' | 'leave' }
}>()

const playersId: PlayerId[] = []

export const _playersIdObj: Record<string, true> = {}

export type PlayersEventType = 'enter' | 'leave' | 'change'
export type PlayersEventHandler = (player: PlayerId, eventType: PlayersEventType) => void

void executeTask(async () => {
  const data = await userData()

  playersId.push(...(await getPlayersInScene()).map(({ userId }) => userId).filter((userId) => userId !== data?.userId))
  playersId.forEach((v) => (_playersIdObj[v] = true))

  onEnterSceneObservable.add(async ({ userId }) => {
    const data = await userData()

    if (data?.userId !== userId && playersId.every((pId) => userId !== pId)) {
      playersId.push(userId)
      _playersIdObj[userId] = true
      void emitter.emit('enter', userId)
      void emitter.emit('change', { user: userId, type: 'enter' })
    }
  })

  onLeaveSceneObservable.add(({ userId }) => {
    const index = findIndexOf(playersId, (pId) => pId === userId)

    if (index !== -1) {
      playersId.splice(index, 1)
      delete _playersIdObj[userId]
      void emitter.emit('leave', userId)
      void emitter.emit('change', { user: userId, type: 'leave' })
    }
  })
})

export default playersId

export const { on: onId, off: offId } = emitter
