export default function find<T>(arr: T[], fn: (v: T) => boolean): T | undefined {
  for (const el of arr) {
    if (fn(el)) {
      return el
    }
  }
  return undefined
}
