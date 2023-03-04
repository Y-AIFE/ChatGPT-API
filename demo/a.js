const apiKey = require('./.key.js')
const { ChatGPT } = require('../build')

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
