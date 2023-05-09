import { ChatGPT } from '../src'

const api = new ChatGPT({
  apiKey: process.env.OPENAI_API_KEY as string,
  debug: true,
  requestConfig: {
    timeout: 600000,
  },
})

async function run() {
  const res = await api.createModeration('I want to kill them.')
  console.log('res', res)
}

run()
