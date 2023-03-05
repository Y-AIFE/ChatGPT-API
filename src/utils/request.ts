import axios from 'axios'
import { RawAxiosRequestConfig } from 'axios'
import { log } from './index'

interface IRequestOpts {
  debug?: boolean
}

export async function get(config: RawAxiosRequestConfig, opts: IRequestOpts) {
  const ins = axios.create({
    method: 'GET',
  })
  if (opts.debug) {
    ins.interceptors.request.use((config) => {
      log('axios config', config)
      return config
    })
  }
  return (await ins({ ...config })).data
}
export async function post(config: RawAxiosRequestConfig, opts: IRequestOpts) {
  const ins = axios.create({
    method: 'POST',
  })
  if (opts.debug) {
    ins.interceptors.request.use((config) => {
      log('axios config', config)
      return config
    })
  }
  return (await ins({ ...config })).data
}
