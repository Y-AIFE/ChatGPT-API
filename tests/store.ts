import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const message = {
  id: 'chatcmpl-6qaErOKyLyiMVXd7xt33itSkp066q',
  text:
    '作为一个前端技术专家，我相信前端技术在未来越来越重要。随着移动设备井喷式的普及和网络基础设施的不断完善，人们越来越依赖Web应用程序来获取信息、交流和购物。\n' +
    '\n' +
    '现代Web应用程序需要快速响应、良好的用户体验和高度可靠性。前端技术扮演着关键的角色，能够帮助开发人员创造出优秀的Web应用程序。除了常见的HTML、CSS和JavaScript，前端技术还包括许多其他有用的工具和框架，如React、Angular和Vue。这些工具可以简化Web开发，提高开发效率。\n' +
    '\n' +
    '为了成为一名成功的前端专家，我认为需要掌握前沿技术、保持学习和适应变化的能力。同时，注重用户体验和产品质量同样重要。在设计和开发之前，了解用户需求和期望，并根据他们的需求进行相应的解决方案，对于一名前端技术专家非常重要。',
  created: 1677990377,
  role: 'assistant',
  parentMessageId: '7e42c6b9-939a-4575-a99c-7461db4df8e1',
  tokens: 331,
}
const messages = []
for (let i = 0; i < 100000; i++) {
  messages.push({ ...message })
}

const messagesFile = path.join(__dirname, './messages.json')

fs.writeFileSync(messagesFile, JSON.stringify(messages))

const stats = fs.statSync(messagesFile)
console.log('size', `${stats.size / (1024 * 1024)} MB`) // 100MB
