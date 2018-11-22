import { $, debounce } from './helpers.mjs'

const updateName = debounce(name => {
  localStorage.setItem('name', name)
}, 350)

const name = $('#name')

const storedName = localStorage.getItem('name')
if (storedName) name.innerText = storedName

name.addEventListener('input', ({ target }) => {
  const text = target.innerText
  updateName(text)
})