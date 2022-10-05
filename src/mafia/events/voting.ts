import emitt from '../utils/emitt'

const votingEmitter = emitt<{
  end: undefined
}>()

export default votingEmitter
