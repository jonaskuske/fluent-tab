import { $, debounce } from './utils.mjs'

const name = $('#name')

const updateName = debounce(name => name && localStorage.setItem('name', name), 250)
const removeLineBreaks = () => name.textContent = name.textContent.replace(/\n/g, '')

name.addEventListener('input', ({ target }) => {
  updateName(target.textContent.replace(/\n/g, ''))
})
name.addEventListener('blur', removeLineBreaks)
name.addEventListener('paste', () => setTimeout(removeLineBreaks))
name.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    event.preventDefault();
    event.target.blur()
  }
})

const storedName = localStorage.getItem('name')
if (storedName) name.textContent = storedName
else name.focus()
