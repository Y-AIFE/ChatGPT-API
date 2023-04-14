import apiKey from './.key'
import { ChatGPT } from '../src'

const api = new ChatGPT({
  apiKey: apiKey, // get api key
  debug: true,
  requestConfig: {
    timeout: 5000,
    proxy: {
      protocol: 'http',
      host: '127.0.0.1',
      port: 7890,
    },
  },
})

async function run() {
  await api.sendMessage({
    text: '不吃早饭对身体有没有坏处',
    model: 'gpt-3.5-turbo',
    onProgress(t) {
      console.log('[onProgress]', t)
    },
    onEnd(t) {
      console.log('[onEnd]', t)
    },
  })
}

run()
