import { getPlayersInScene } from '@decentraland/Players'
import emitt from '../utils/emitt'
import userData from '../user/data'
import removeOne from '../utils/array/removeOne'

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
    if (removeOne(playersId, (pId) => pId === userId)) {
      delete _playersIdObj[userId]
      void emitter.emit('leave', userId)
      void emitter.emit('change', { user: userId, type: 'leave' })
    }
  })
})

export default playersId

export const { on: onId, off: offId } = emitter
