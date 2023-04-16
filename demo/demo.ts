import apiKey from './.key'
import { ChatGPT } from '../src'

const api = new ChatGPT({
  apiKey: apiKey, // get api key
})

async function run() {
  const res = await api.sendMessage({
    text: '不吃早饭对身体有没有坏处',
  })
  console.log('res', res)
}

run()
// res {
//   success: true,
//   data: {
//     id: '753d6d2a-4352-423c-9ced-cec17e1acd64',
//     text: '不吃早餐可能会导致身体出现一些不良反应，例如头昏、乏力、注意力不集中等。此外，长期不吃早餐还可能增加患肥胖症和糖尿病的风险。因此，建议每天都要吃早餐，以保持身体健康。',
//     created: 1681634136,
//     role: 'assistant',
//     parentMessageId: '96d050ce-b53c-4357-a5bd-188008adf194',
//     tokens: 172,
//     len: 211
//   },
//   status: 200
// }