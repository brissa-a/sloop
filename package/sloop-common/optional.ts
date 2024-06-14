export type Optional<ValueType> =
  | Present<ValueType>
  | Missing

export type Present<ValueType> = {
  value: ValueType
  cause?: never
}

export type Missing = {
  value: null
  cause?: string
}

export const empty = (cause?: string): Missing => ({ value: null, cause })

export const present = <T>(value: T): Present<T> => ({ value })
