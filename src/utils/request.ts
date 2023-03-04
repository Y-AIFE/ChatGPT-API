import axios from 'axios'
import type { RawAxiosRequestConfig } from 'axios'

interface IRequestOpts {
  debug?: boolean
}

export async function get(config: RawAxiosRequestConfig, opts: IRequestOpts) {
  const ins = axios.create({
    method: 'GET',
  })
  if (opts.debug) {
    console.log({ headers: ins.defaults.headers, data: ins.defaults.data })
  }
  return (await ins({ ...config })).data
}
export async function post(config: RawAxiosRequestConfig, opts: IRequestOpts) {
  const ins = axios.create({
    method: 'POST',
  })
  if (opts.debug) {
    ins.interceptors.request.use((config) => {
      console.log(config)
      return config
    })
  }
  return (await ins({ ...config })).data
}
