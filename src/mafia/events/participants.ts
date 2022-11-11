import emitt from '../utils/emitt'

const participantEmitter = emitt<{
  'self-leave': undefined
  'self-participate': undefined
  'hide-ui': undefined
}>()

export default participantEmitter

export const { on: onParticipant, emit: emitParticipant } = participantEmitter
