import emitt from '../utils/emitt'

const headEmitter = emitt<{
  leave: { oldHeadId: string; newHeadId?: string }
  change: { newHeadId: string }
}>()

export default headEmitter
