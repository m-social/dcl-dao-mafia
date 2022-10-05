import emitt from '../utils/emitt'

const selfEnterLeaveEmitter = emitt<{
  enter: string
  leave: string
}>()

export default selfEnterLeaveEmitter
