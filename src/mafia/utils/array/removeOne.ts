import findIndexOf from './findIndexOf'

export default function removeOne<T>(arr: T[], selectorFn: (element: T) => boolean): T | undefined {
  const i = findIndexOf(arr, selectorFn)

  if (i === -1) {
    return undefined
  }

  return arr.splice(i, 1)[0]
}
