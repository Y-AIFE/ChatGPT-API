const { ChatGPT } = require('@lxfriday/chatgpt')
const apiKey = require('./.key.js')

const api = new ChatGPT({
  apiKey: apiKey, // get api key
})

async function run() {
  const res = await api.sendMessage({
    text: 'please introduce yourself',
  })
  console.log(res.text)
}

run()

