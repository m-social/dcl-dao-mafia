type EventMap<T> = {
  [K in keyof T]?: ((data: T[K]) => void)[]
}

// type WithoutData<T> = keyof {
//     [K in keyof T as T[K] extends undefined | never ? K : never]: T[K]
// }

export default function emitt<T extends Record<string, any>>() {
  const events: EventMap<T> = {}
  const allEvents: ((eventName: keyof T) => void)[] = []

  return {
    on: <TEvent extends keyof T>(eventName: TEvent, listener: (data: T[TEvent]) => void) => {
      const arr = events[eventName]
      if (arr) {
        arr.push(listener)
      } else {
        events[eventName] = [listener]
      }
    },

    // TODO: add support of removing all events listeners
    all: (listener: (event: keyof T) => void) => {
      allEvents.push(listener)
    },

    off: <TEvent extends keyof T>(eventName: TEvent, listener: (data: T[TEvent]) => void) => {
      const listeners = events[eventName]

      if (!listeners) {
        return
      }

      const i = listeners.indexOf(listener)

      if (i !== -1) {
        listeners.splice(i, 1)
      }
    },

    // TODO: allow not passing data
    emit: <TEvent extends keyof T>(eventName: TEvent, data: T[TEvent]) => {
      events[eventName]?.forEach((f) => f(data))
      allEvents.forEach((f) => f(eventName))
    }
  }
}
