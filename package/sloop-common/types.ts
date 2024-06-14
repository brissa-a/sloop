export * from './optional'

export type RetOf<T extends (...args: any) => Promise<any>> = Awaited<ReturnType<T>>

