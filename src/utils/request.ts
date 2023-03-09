import axios from 'axios'
import { RawAxiosRequestConfig } from 'axios'
import { log } from './index'

interface IRequestOpts {
  debug?: boolean
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
export async function post(config: RawAxiosRequestConfig, opts: IRequestOpts) {
  const ins = axios.create({
    method: 'POST',
    validateStatus(status) {
      return true
    },
  })
  if (opts.debug) {
    ins.interceptors.request.use((config) => {
      log('axios config', {
        headers: config.headers,
        data: config.data,
      })
      return config
    })
  }
  const response = await ins({ ...config })
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