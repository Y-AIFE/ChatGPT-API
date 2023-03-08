import apiKey from './.key'
import { ChatGPT } from '../src'

const api = new ChatGPT({
  apiKey: apiKey, // get api key
  debug: true,
  requestConfig: {
    proxy: {
      protocol: 'http',
      host: '127.0.0.1',
      port: 7890,
    },
  },
})

async function run() {
  try {
    const res = await api.sendMessage({
      text: '用 Vue3 写一段代码',
      onProgress(t) {
        console.log('[onProgress]', t)
      },
    })
    console.log(res)
  } catch (e) {
    console.log('err', JSON.stringify(e))    
  }
}

run()
