import { v4 as uuid } from 'uuid'
import { stdin, stdout } from 'process'
import { createInterface } from 'readline'
import { IChatGPTHTTPDataMessage } from '../types'
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
/**
 * calc string len in messages
 */
export function concatMessages(messages: IChatGPTHTTPDataMessage[]): string {
  return messages.reduce((acc, cur) => {
    return acc + cur.content
  }, '')
}
