import apiKey from './.key'
import { ChatGPT } from '../src'

const api = new ChatGPT({
  apiKey: apiKey, // get api key
  debug: true,
  requestConfig: {
    headers: {
      requestid: '10086'
    }
  },
})

async function run() {
  const res = await api.sendMessage({
    text: 'please introduce yourself',
  })
  console.log(res.text)
}

run()
