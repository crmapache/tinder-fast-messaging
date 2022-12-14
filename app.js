(() => init())()

function init() {
  const options = JSON.parse(window.localStorage.getItem('options')) || []

  setTimeout(() => {
    setStyles()
    
    const body = document.querySelector('body')
    const menu = createElement(['menu', 'folded'])
    const header = createElement(['header'])
    const optionsContainer = createElement(['options-container'])
    optionsContainer.id = 'mz-ext-options-container'
    
    body.append(menu)
  
    header.append(createDragBar(menu))
    header.append(createToggleButton(menu))
    
    menu.append(header)
    menu.append(createAddNewOptionElements(addOptionHandler))
    menu.append(optionsContainer)
    
    renderOptions(options)
  
    addCancelMatchEvent()
  }, 1000)
}

function addOptionHandler(option) {
  if (option) {
    const options = getOptions()
    
    options.push({
      id: Date.now(),
      value: option,
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

function createElement(classes) {
  const el = document.createElement('div')
  
  for (const className of classes) {
    if (className) {
      el.classList.add(`mz-ext-${className}`)
    }
  }
  
  return el
}

function createOption(option, isFirstOption, isLastOption) {
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
  
  const shiftButtonsWrap = createElement(['shift-buttons-wrap'])
  
  const shiftButtonUp = createElement(['shift-button', 'shift-button-up', isFirstOption ? 'disabled' : null])
  shiftButtonUp.innerHTML = `<i class='bx bxs-chevron-up'></i>`
  shiftButtonUp.addEventListener('click', () => {
    if (isFirstOption) return
    
    const options = getOptions()
  
    for (let i = 0; i < options.length; i++) {
      if (options[i].id === option.id) {
        const prevOption = {...options[i - 1]}
        const currentOption = {...options[i]}
        options[i] = prevOption
        options[i - 1] = currentOption
      
        break
      }
    }
  
    setOptions(options)
    renderOptions(options)
  })
  
  const shiftButtonDown = createElement(['shift-button', 'shift-button-down', isLastOption ? 'disabled' : null])
  shiftButtonDown.innerHTML = `<i class='bx bxs-chevron-down'></i>`
  shiftButtonDown.addEventListener('click', () => {
    if (isLastOption) return
    
    const options = getOptions()
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].id === option.id) {
        const nextOption = {...options[i + 1]}
        const currentOption = {...options[i]}
        options[i] = nextOption
        options[i + 1] = currentOption
        
        break
      }
    }
    
    setOptions(options)
    renderOptions(options)
  })
  
  shiftButtonsWrap.append(shiftButtonUp, shiftButtonDown)
  
  const deleteButton = createElement(['delete-button'])
  deleteButton.innerText = 'Delete'
  deleteButton.addEventListener('click', () => {
    const options = getOptions()
    const updatedOptions = options.filter((el) => el.id !== option.id)
    
    setOptions(updatedOptions)
    renderOptions(updatedOptions)
  })
  
  optionWrap.append(optionElement, shiftButtonsWrap, deleteButton)
  
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

function createToggleButton(menu) {
  const toggleButton = createElement(['toggle-button'])
  toggleButton.innerHTML = `
    <i class='bx bxs-chevron-up'></i>
    <i class='bx bxs-chevron-down'></i>
  `
  
  toggleButton.addEventListener('click', () => {
    menu.classList.toggle('mz-ext-folded')
    toggleButton.classList.toggle('mz-ext-active')
  })
  
  return toggleButton
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
    for (let i = 0; i < options.length; i++) {
      container.append(createOption(options[i], i === 0, i === options.length - 1))
    }
  } else {
    container.innerText = 'There is no options'
  }
}

function addCancelMatchEvent() {
  window.document.addEventListener('keypress', (e) => {
    if (e.key === 'd' && e.ctrlKey) {
      const deleteButton = findByInnerText('button','Cancelar match')
      
      if (deleteButton) {
        deleteButton.click()
        
        setTimeout(() => {
          const confirmDeleteButton = findByInnerText('div', 'S??, cancelar match')
          confirmDeleteButton?.click()
        }, 500)
      }
    }
  })
}

function findByInnerText(tag, text) {
  const tags = document.getElementsByTagName(tag);
  
  for (const currentTag of tags) {
    if (currentTag.textContent === text) {
      return currentTag
    }
  }
  
  return null
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
      transition: opacity .2s;
    }
    
    .mz-ext-menu.mz-ext-folded {
      height: 56px;
      opacity: 0.5;
    }
    
    .mz-ext-header {
      display: flex;
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
      height: 26px;
      border-radius: 4px;
      transition: box-shadow .2s;
      margin-bottom: 15px;
      background: linear-gradient(45deg, #47a1ff, #32eaf0);
      box-shadow: inset 0px 0px 6px 1px #227186;
      flex: 1 1 0;
    }
    
    .mz-ext-toggle-button {
      height: 26px;
      width: 40px;
      margin-left: 5px;
      background: linear-gradient(45deg, #9f14ea, #c66df9);
      border-radius: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 16px;
      color: #fff;
    }
    
    .mz-ext-toggle-button:hover {
      cursor: pointer;
    }
    
    .mz-ext-toggle-button.mz-ext-active {
      background: linear-gradient(45deg, #c66df9, #9f14ea);
    }
    
    .mz-ext-toggle-button .bxs-chevron-up {
      display: none;
    }
    
    .mz-ext-toggle-button.mz-ext-active .bxs-chevron-up {
      display: block;
    }
    
    .mz-ext-toggle-button.mz-ext-active .bxs-chevron-down {
      display: none;
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
      box-shadow: inset 0px 0px 3px 1px #140404;
    }
    
    .mz-ext-shift-buttons-wrap {
      margin-left: 10px;
      display: flex;
      justify-content: stretch;
      align-items: center;
      flex-direction: column;
    }
    
    .mz-ext-shift-button {
      width: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 14px;
      background: linear-gradient(45deg, #8bc34a, #00bcd4);
      border-radius: 4px;
      transition: all .2s;
      color: #fff;
      flex: 1 1 0;
    }
    
    .mz-ext-shift-button:hover {
      cursor: pointer;
      box-shadow: inset 0px 0px 3px 1px #491111;
    }
    
    .mz-ext-shift-button:active {
      cursor: pointer;
      box-shadow: inset 0px 0px 3px 1px #140404;
    }
    
    .mz-ext-shift-button.mz-ext-disabled {
      opacity: .3;
    }
    
    .mz-ext-shift-button:hover.mz-ext-disabled {
      cursor: default;
      box-shadow: none;
    }
    
    .mz-ext-shift-button:active.mz-ext-disabled {
       cursor: default;
      box-shadow: none;
    }
    
    .mz-ext-shift-button-up {
      margin-bottom: 5px;
    }
  `;
  
  const head = document.querySelector('head')
  const style = document.createElement('style')
  const link = document.createElement('link')
  link.setAttribute('href', 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css')
  link.setAttribute('rel', 'stylesheet')
  
  style.innerText = styles
  head.append(style, link)
}
