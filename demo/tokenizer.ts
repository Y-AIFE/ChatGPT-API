import Tokenizer from '../src/Tokenizer'

const ans =
  '以下是一个简单的Vue 3 todolist组件示例，使用localStorage保存状态：\n' +
  '\n' +
  '```html\n' +
  '<template>\n' +
  '  <div>\n' +
  '    <h2>Todolist</h2>\n' +
  '    <form @submit.prevent="addItem">\n' +
  '      <input type="text" v-model="newItem" placeholder="Add a new item">\n' +
  '      <button>Add</button>\n' +
  '    </form>\n' +
  '    <ul>\n' +
  '      <li v-for="(item, index) in items" :key="index">\n' +
  '        <input type="checkbox" v-model="item.done">\n' +
  `        <span :class="{ 'done': item.done }">{{ item.text }}</span>\n` +
  '        <button @click="removeItem(index)">Remove</button>\n' +
  '      </li>\n' +
  '    </ul>\n' +
  '  </div>\n' +
  '</template>\n' +
  '\n' +
  '<script>\n' +
  "  import { reactive, onMounted } from 'vue'\n" +
  '\n' +
  '  export default {\n' +
  '    setup() {\n' +
  '      const items = reactive(getSavedItems())\n' +
  "      const newItem = reactive('')\n" +
  '      \n' +
  '      function addItem() {\n' +
  '        items.push({\n' +
  '          text: newItem,\n' +
  '          done: false\n' +
  '        })\n' +
  "        newItem = ''\n" +
  '        saveItems(items)\n' +
  '      }\n' +
  '      \n' +
  '      function removeItem(index) {\n' +
  '        items.splice(index, 1)\n' +
  '        saveItems(items)\n' +
  '      }\n' +
  '      \n' +
  '      function saveItems(items) {\n' +
  "        localStorage.setItem('todolist_items', JSON.stringify(items))\n" +
  '      }\n' +
  '      \n' +
  '      function getSavedItems() {\n' +
  "        const savedItems = localStorage.getItem('todolist_items')\n" +
  '        if (savedItems) {\n' +
  '          return JSON.parse(savedItems)\n' +
  '        }\n' +
  '        return []\n' +
  '      }\n' +
  '      \n' +
  '      onMounted(() => {\n' +
  "        document.title = 'Todolist'\n" +
  '      })\n' +
  '\n' +
  '      return { items, newItem, addItem, removeItem }\n' +
  '    }\n' +
  '  }\n' +
  '</script>\n' +
  '\n' +
  '<style>\n' +
  '  .done {\n' +
  '    text-decoration: line-through;\n' +
  '  }\n' +
  '</style>\n' +
  '```\n' +
  '\n' +
  '在此例中，我们使用Vue 3的`reactive` API创建可响应的状态`items`和`newItem`，在`localStorage`中保存`items`状态。 当组件初始化时，我们调用`getSavedItems`函数，以确保我们始终从本地存储中获取最新的状态。\n' +
  '\n' +
  '当用户添加和删除项目时，我们更新`items`数组并调用`localStorage`中的`saveItems`函数更新状态。在模板中，我们使用v-for循环渲染`items`数组，并在每个项目上设置复选框和删除按钮。我们也设置了一个文字输入框和“添加”按钮来添加新项目。\n' +
  '\n' +
  '最后，我们在组件挂载后使用Vue 3的`onMounted`钩子更新页面标题。'

  console.log('jsonstr', JSON.stringify(ans))

const str = `You are ChatGPT, a large language model trained by OpenAI. Answer as concisely as possible.\n Current date: 2023-05-06用vue3写一个todolist，要求有状态保存` + ans
const tokenizer = new Tokenizer({})
console.log('cnt => ', tokenizer.getTokenCnt(str)) // output 613
// real return 626