export default function findIndexOf<T>(arr: T[] | undefined | null, f: (v: T) => boolean) {
  if (!arr) {
    return -1
  }

  for (let i = 0; i < arr.length; ++i) {
    if (f(arr[i])) {
      return i
    }
  }

  return -1
}
