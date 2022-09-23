(() => init())()

function init() {
  const options = JSON.parse(window.localStorage.getItem('options')) || []

  setTimeout(() => {
    setStyles()
    
    const body = document.querySelector('body')
    const menu = createElement(['menu'])
    const optionsContainer = createElement(['options-container'])
    optionsContainer.id = 'mz-ext-options-container'
    
    body.append(menu)
    
    menu.append(createDragBar(menu))
    menu.append(createAddNewOptionElements(addOptionHandler))
    menu.append(optionsContainer)
    
    renderOptions(options)
  }, 1000)
}

function addOptionHandler(option) {
  if (option) {
    const options = getOptions()
    
    options.push({
      id: Date.now(),
      value: option,
      popularity: 0,
    })
  
    setOptions(options)
    renderOptions(options)
  }
}

function getOptions() {
  return JSON.parse(window.localStorage.getItem('options')) || []
}

function setOptions(options) {
  return window.localStorage.setItem('options', JSON.stringify(options))
}

function sortOptions(options) {
  return options.sort((a, b) => {
    if (a.popularity < b.popularity) return 1
    else if(a.popularity > b.popularity) return -1
    return 0
  })
}

function createElement(classes) {
  const el = document.createElement('div')
  
  for (const className of classes) {
    el.classList.add(`mz-ext-${className}`)
  }
  
  return el
}

function createOption(option) {
  let timer;
  
  const optionWrap = createElement(['option-wrap'])
  
  const optionElement = createElement(['option'])
  optionElement.innerText = option.value
  optionElement.addEventListener('click', () => {
    navigator.clipboard.writeText(option.value);
    
    const textInput = document.querySelector('textarea')
    textInput.focus()
    
    clearTimeout(timer)
    optionElement.classList.add('active')
    
    const updatedOptions = getOptions().map((el) => {
      if (el.id === option.id) {
        return {...el, popularity: +el.popularity + 1}
      }
    
      return el
    })
  
    setOptions(updatedOptions)
    
    timer = setTimeout(() => {
      optionElement.classList.remove('active')
      
      renderOptions(getOptions())
    }, 1000)
  })
  
  const deleteButton = createElement(['delete-button'])
  deleteButton.innerText = 'Delete'
  deleteButton.addEventListener('click', () => {
    const options = getOptions()
    const updatedOptions = options.filter((el) => el.id !== option.id)
    
    setOptions(updatedOptions)
    renderOptions(updatedOptions)
  })
  
  optionWrap.append(optionElement, deleteButton)
  
  return optionWrap
}

function createDragBar(menu) {
  let isDragging = false
  let startTop = 15
  let startRight = 30
  let saveTop = 0
  let saveRight = 0
  let top = 15
  let right = 30
  
  const dragBar = createElement(['drag-bar'])
  
  dragBar.addEventListener('mousedown', (e) => {
    startTop = e.pageY
    startRight = e.pageX
    isDragging = true
  })
  
  window.document.addEventListener('mouseup', () => {
    if (isDragging) {
      top = saveTop
      right = saveRight
  
      isDragging = false
    }
  })
  
  window.document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const topDiff =  e.pageY - startTop
      const rightDiff = startRight - e.pageX
  
      saveTop = top + topDiff
      saveRight = right + rightDiff
      
      menu.style.top = `${saveTop}px`
      menu.style.right = `${saveRight}px`
    }
  })
  
  return dragBar
}

function createAddNewOptionElements(addOptionHandler) {
  const wrap = createElement(['input-block-wrap'])
  
  const input = document.createElement('input')
  input.classList.add('mz-ext-new-option-input')
  input.placeholder = 'Type your option...'
  
  const addButton = createElement(['add-button'])
  addButton.innerText = 'Add'
  addButton.addEventListener('click', () => {
    addOptionHandler(input.value)
    input.value = ''
  })
  
  wrap.append(input, addButton)
  
  return wrap
}

function renderOptions(options) {
  const container = document.querySelector(`#mz-ext-options-container`)
  container.innerHTML = null
  
  
  if (options.length > 0) {
    const sortedOptions = sortOptions(options)
    
    for (const option of sortedOptions) {
      container.append(createOption(option))
    }
  } else {
    container.innerText = 'There is no options'
  }
}

function setStyles() {
  const styles = `
    .mz-ext-menu {
      position: absolute;
      top: 15px;
      right: 30px;
      width: 360px;
      overflow-y: auto;
      background: rgba(0, 0, 0, .9);
      border-radius: 10px;
      padding: 15px;
    }
    
    .mz-ext-option {
      border-radius: 4px;
      border: 1px solid rgba(255, 255, 255, .6);
      padding: 5px 10px;
      color: #fff;
      transition: all .2s;
      font-size: 14px;
      line-height: 14px;
      flex: 1 1 0;
      text-align: left;
    }
    
    .mz-ext-option:hover {
      cursor: pointer;
      border: 1px solid #fd2a75;
    }
    
    .mz-ext-option:active {
      border: 1px solid #ff5c3b;
    }
    
    .mz-ext-option.active {
      border-color: #fed661 !important;
    }
    
    .mz-ext-drag-bar {
      height: 18px;
      border-radius: 4px;
      background-color: #fff;
      transition: box-shadow .2s;
      margin-bottom: 10px;
      background: linear-gradient(45deg, #47a1ff, #32eaf0);
      box-shadow: inset 0px 0px 6px 1px #227186;
    }
    
    .mz-ext-drag-bar:hover {
      cursor: pointer;
      box-shadow: inset 0px 0px 6px 1px #1f4f5c;
    }
    
    .mz-ext-drag-bar:active {
      box-shadow: inset 0px 0px 6px 1px #1e3940;
    }
    
    .mz-ext-input-block-wrap {
      display: flex;
      margin-bottom: 16px;
    }
    
    .mz-ext-new-option-input {
      flex: 1 1 0;
      font-size: 14px;
      line-height: 14px;
      padding: 5px 15px;
      border: 1px solid #fff;
      border-radius: 4px;
      color: #fff;
      height: 26px;
    }
    
    .mz-ext-add-button {
      width: 60px;
      height: 26px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      margin-left: 10px;
      background: linear-gradient(180deg, #f59307, #ffdd6b);
      color: #222;
      border-radius: 4px;
      transition: all .2s;
    }
    
    .mz-ext-add-button:hover {
      cursor: pointer;
      background-color: #43a047;
      box-shadow: inset 0px 0px 3px 1px #493011;
    }
    
    .mz-ext-add-button:active {
      cursor: poiner;
      background-color: #388e3c;
      box-shadow: inset 0px 0px 3px 1px #1d150c;
    }
    
    .mz-ext-options-container {
      color: #fff;
      text-align: center;
    }
    
    .mz-ext-option-wrap {
      display: flex;
      margin-bottom: 8px;
    }
    
    .mz-ext-option-wrap:last-child {
      margin-bottom: 0;
    }
    
    .mz-ext-delete-button {
      width: 60px;
      min-height: 26px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      margin-left: 10px;
      background: linear-gradient(45deg, #fd267a, #ff6036);
      color: #222;
      border-radius: 4px;
      transition: all .2s;
    }
    
    .mz-ext-delete-button:hover {
      cursor: pointer;
      box-shadow: inset 0px 0px 3px 1px #491111;
    }
    
    .mz-ext-delete-button:active {
      cursor: poiner;
      box-shadow: inset 0px 0px 3px 1px #140404;
    }
  `;
  
  const head = document.querySelector('head')
  const style = document.createElement('style');
  style.innerText = styles
  head.append(style)
}
