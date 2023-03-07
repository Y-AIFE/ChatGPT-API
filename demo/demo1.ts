import apiKey from './.key'
import { ChatGPT } from '../src'

const api = new ChatGPT({
  apiKey: apiKey, // get api key
  debug: true,
})

async function run() {
  const res = await api.sendMessage({
    text: '用 Vue3 写一段代码',
    onProgress(t) {
      console.log('[onProgress]', t)
    }
  })
  console.log(res)
}

run()
