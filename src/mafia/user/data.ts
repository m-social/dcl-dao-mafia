import { getUserData, UserData } from '@decentraland/Identity'

let data: UserData | null = null

void executeTask(async () => {
  data = await getUserData()
})

export default async function userData(force = false) {
  if (force || !data) {
    return (data = await getUserData())
  }
  return data
}
