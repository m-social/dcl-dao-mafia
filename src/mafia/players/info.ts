import { UserData } from '@decentraland/Identity'
import { getPlayerData } from '@decentraland/Players'
import emitt from '../utils/emitt'

import { onId, _playersIdObj } from './id'
import removeOne from '../utils/array/removeOne'

const playersData: UserData[] = []

const emitter = emitt<{
  add: UserData[]
  remove: UserData
}>()

let refCount = 0

function pushGuard(...data: UserData[]) {
  playersData.push(...data.filter((d) => !!_playersIdObj[d.userId]))
  emitter.emit('add', data)
}

onId(
  'init',
  withRef(async (data: string[]) => {
    log('init', playersData)
    pushGuard(
      ...(await Promise.all(data.map((p) => getPlayerData({ userId: p })))).filter((v): v is UserData => v !== null)
    )
  })
)

onId(
  'enter',
  withRef(async (p: string) => {
    log('enter', playersData)
    const data = await getPlayerData({ userId: p })
    data && pushGuard(data)
  })
)

onId('leave', (p) => {
  const data = removeOne(playersData, ({ userId }) => userId === p)

  if (data) {
    void emitter.emit('remove', data)
  }
})

export function isLoadingData() {
  return !!refCount
}

function withRef<T extends (...params: any[]) => Promise<void>>(f: T) {
  return async (...data: Parameters<T>) => {
    ++refCount
    try {
      await f(...data)
    } finally {
      --refCount
    }
  }
}

export default playersData

export const { on, off } = emitter
