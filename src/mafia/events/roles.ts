import emitt from '../utils/emitt'

const rolesEmitter = emitt<{
  'self-kill': undefined
  'other-kill': { id: string }
  'self-inactive': undefined
  'after-inactive-kick': undefined
  cancel: undefined
}>()

export default rolesEmitter

export const { on: onRoles, emit: emitRoles } = rolesEmitter
