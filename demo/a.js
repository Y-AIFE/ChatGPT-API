const Keyv = require('keyv') 
const Lru = require('lru-cache') 

class ConversationStore {
  constructor() {
    const lru = new Lru({ max: 5000 })
    this.store = new Keyv({ store: lru })
  }
  async get(id) {
    return await this.store.get(id)
  }
  async set(msg) {
    return await this.store.set(msg.id, msg)
  }
}

async function run() {
  const store = new ConversationStore()
  await store.set({ id: 'a', v: '111' })
  await store.set({ id: 'b', v: '222' })
  await store.set({ id: 'c', v: '333' })
  console.log(store)
  console.log(await store.get('a'))
}

run()
