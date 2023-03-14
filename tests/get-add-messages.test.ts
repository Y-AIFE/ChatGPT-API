import { ChatGPT } from '../src'
import { TCommonMessage, IChatGPTUserMessage, ERole } from '../src/types'
import { genId } from '../src/utils/index'

const api = new ChatGPT({
  apiKey: '',
  debug: true,
})

let lastMessageId: undefined | string = undefined

function genMessages(): TCommonMessage[] {
  const messages: TCommonMessage[] = []
  for (let i = 0; i < 5; i++) {
    const id = genId()
    const message: IChatGPTUserMessage = {
      id,
      text: `00${i} text`,
      role: ERole.user,
      parentMessageId: lastMessageId,
    }
    lastMessageId = id
    messages.push(message)
  }
  return messages
}

async function runner() {
  const messages = genMessages()
  await api.addMessages(messages)
  console.log('输入的 msgs', messages)
  const getMsgsRes = await api.getMessages({ id: lastMessageId as string })
  console.log('取到的 msgs', getMsgsRes)
  console.log('lastMessageId', lastMessageId)
  console.log('equal', JSON.stringify(getMsgsRes) === JSON.stringify(messages))
}

runner()
