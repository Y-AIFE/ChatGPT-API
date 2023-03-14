import { v4 as uuid } from 'uuid'
import { stdin, stdout } from 'process'
import { createInterface } from 'readline'
export * from './log'

export function getReadLine() {
  const rl = createInterface({ input: stdin, output: stdout })
  const iter = rl[Symbol.asyncIterator]()
  return async () => (await iter.next()).value
}

/**
 * generate unique id by uuidV4
 */
export function genId() {
  return uuid()
}

export function isString(target: any) {
  return Object.prototype.toString.call(target) === '[object String]'
}

export function isArray(target: any) {
  return Object.prototype.toString.call(target) === '[object Array]'
}
export function isObject(target: any) {
  return Object.prototype.toString.call(target) === '[object Object]'
}
