import Hashids from "hashids"
import { NumberLike } from "hashids/cjs/util";

const hashids = new Hashids("sloop", 10)

type Replace<T, K extends keyof T, V> = { [P in keyof T]: P extends K ? V : T[P] };

export function obfuscateObj<T extends { id: number }>(obj: T): Replace<T, 'id', string> {
  return { ...obj, id: obfuscate(obj.id) } as Replace<T, 'id', string>
}

export function clarifyObj<T extends { id: string }>(obj: T): Replace<T, 'id', NumberLike> {
  const id = clarify(obj.id)
  if (id === undefined) {
    throw new Error(`Invalid id: ${obj.id}`)
  }
  return { ...obj, id } as Replace<T, 'id', NumberLike>
}

export function obfuscate(id: number) {
  return hashids.encode(id)
}

export function clarify(id: string) {
  const [number] = hashids.decode(id)
  return number
}
