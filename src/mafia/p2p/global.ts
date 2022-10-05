const messageBus = new MessageBus()

export default messageBus

export function scoped(scope: string): { emit: MessageBus['emit']; on: MessageBus['on'] } {
  return {
    emit: (message, payload) => messageBus.emit(`${scope}::${message}`, payload),
    on: (message, callback) => messageBus.on(`${scope}::${message}`, callback)
  }
}
