import apiKey from './.key'
import { ChatGPT, ERole } from '../src'

const api = new ChatGPT({
  apiKey: apiKey, // get api key
  debug: true,
  requestConfig: {
    // proxy: {
    //   protocol: 'http',
    //   host: '127.0.0.1',
    //   port: 7890,
    // },
  },
  log: logger,
})

function logger(msg: string, ...args: any[]): void {
  console.log('++++++++++++++++++++++++++++++++++++++++++++++++++++++')
  console.log(msg, ...args)
}

async function run() {
  try {
    const res = await api.sendMessage({
      initialMessages: [
        { id: '000', text: '你是一个美食博主', role: ERole.system },
        { id: '001', text: '你好，西瓜可以做成哪些美食', role: ERole.user },
      ],
      onProgress(t) {
        console.log('[onProgress]', t)
      },
      onEnd(d) {
        console.log('[end]', d)
      },
    })
    console.log('res', res)
    console.log('store size', (await api.getStoreSize()) === 0)
  } catch (e) {
    console.log('err', JSON.stringify(e))
  }
}

run()
