import { v4 as uuid } from 'uuid'

/**
 * generate unique id by uuidV4
 */
export function genId() {
  return uuid()
}
