import { ChatGPT } from '../src'
import apiKey from './.key'

const api = new ChatGPT({
  apiKey,
  // debug: true,
  requestConfig: {
    timeout: 1000 * 600,
  },
})

async function run() {
  try {
    const res = await api.createChatCompletion({
      text: 'what is Vue3',
      systemPrompt: 'you are a front end developer ',
    })
    console.log(res.text)
  } catch (e) {
    console.log('err', e)
  }
}

run()
