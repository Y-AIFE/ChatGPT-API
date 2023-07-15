import { ChatGPT } from '../src'

const api = new ChatGPT({
  apiKey: process.env.OPENAI_API_KEY as string, // get api key
  debug: true,
  requestConfig: {
    timeout: 600000,
  },
})

async function run() {
  const res = await api.sendMessage({
    text: '你好呀',
  })
  console.log('res', res)
}

run()
// res {
//   success: true,
//   data: {
//     id: '0291c0ab-37a3-40c9-9c6b-353516909bd4',
//     text: '你好！有什么我可以帮助你的吗？',
//     created: 1689435751,
//     role: 'assistant',
//     parentMessageId: '2bdd469f-7119-4f14-b195-5393f595a075',
//     tokens: 66,
//     len: 134
//   },
//   raw: {
//     id: 'chatcmpl-7cbhf67RofiO7AmYyPD41iisahF26',
//     object: 'chat.completion',
//     created: 1689435751,
//     model: 'gpt-3.5-turbo-0613',
//     choices: [ [Object] ],
//     usage: { prompt_tokens: 48, completion_tokens: 18, total_tokens: 66 }
//   },
//   status: 200
// }