import axios from 'axios'
import { RawAxiosRequestConfig } from 'axios'
import { TLog } from '../types'

interface IRequestOpts {
  debug: boolean
  log: TLog
}

// export async function get(config: RawAxiosRequestConfig, opts: IRequestOpts) {
//   const ins = axios.create({
//     method: 'GET',
//   })
//   if (opts.debug) {
//     ins.interceptors.request.use((config) => {
//       log('axios config', config)
//       return config
//     })
//   }
//   return (await ins({ ...config })).data
// }
export async function post(config: RawAxiosRequestConfig, opts?: IRequestOpts) {
  const { debug = false, log = console.log } = opts || {}
  const ins = axios.create({
    method: 'POST',
    validateStatus(status) {
      return true
    },
  })
  if (debug) {
    ins.interceptors.request.use((config) => {
      log('axios config', {
        headers: {
          ...config.headers,
          Authorization: undefined,
        },
        data: config.data,
      })
      return config
    })
  }
  ins.interceptors.response.use(
    (data) => {
      // log('ins.interceptors.response resolve', {})
      return data
    },
    (err) => {
      log('ins.interceptors.response reject', String(err))
      return err
    },
  )
  const response = await ins({ timeout: 10000, ...config })
  return response
}

// if (response.status >= 200 && response.status < 300) {
//   console.log('[response]', response.data)
// } else {
//   console.log('[response]', {
//     data: {
//       message: response.data.error.message,
//       type: response.data.error.type,
//       code: response.data.error.code,
//     },
//     status: response.status,
//   })
// }
