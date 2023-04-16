import apiKey from './.key'
import { ChatGPT } from '../src'

const api = new ChatGPT({
  apiKey: apiKey, // get api key
})

async function run() {
  const res = await api.sendMessage({
    text: 'calc 1 + 2',
    model: 'gpt-3.5-turbo',
    onProgress(t) {
      console.log('[onProgress]', t)
    },
    onEnd(t) {
      console.log('[onEnd]', t)
    },
  })
  console.log('res', res)
}

run()

// [onProgress] 3
// [onProgress] 
// [onEnd] {
//   success: true,
//   data: {
//     id: '14cb9244-a1bf-4152-8aba-1ee768fcc210',
//     text: '3',
//     created: 1681634268,
//     role: 'assistant',
//     parentMessageId: 'ae4f6881-0c54-4484-862c-2d31d8d394e3',
//     tokens: 40,
//     len: 127
//   },
//   status: 200
// }
// res {
//   success: true,
//   data: {
//     id: '14cb9244-a1bf-4152-8aba-1ee768fcc210',
//     text: '3',
//     created: 1681634268,
//     role: 'assistant',
//     parentMessageId: 'ae4f6881-0c54-4484-862c-2d31d8d394e3',
//     tokens: 40,
//     len: 127
//   },
//   status: 200
// }