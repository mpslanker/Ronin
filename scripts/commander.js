'use strict'

function Commander (client) {
  this.el = document.createElement('div')
  this.el.id = 'commander'
  this._input = document.createElement('div')
  this._input.id = "editor"
  this._status = document.createElement('div'); this._status.id = 'status'
  this._log = document.createElement('div'); this._log.id = 'log'
  this._docs = document.createElement('div'); this._docs.id = 'help'
  this._eval = document.createElement('a'); this._eval.id = 'eval'

  this.isVisible = true

  this.install = function (host) {
    this.el.appendChild(this._input)
    this._status.appendChild(this._log)
    this._status.appendChild(this._docs)
    this._status.appendChild(this._eval)
    this.el.appendChild(this._status)
    host.appendChild(this.el)
    // this._eval.setAttribute('title', 'Eval(c-R)')
    // this._input.setAttribute('autocomplete', 'off')
    // this._input.setAttribute('autocorrect', 'off')
    // this._input.setAttribute('autocapitalize', 'off')
    // this._input.setAttribute('spellcheck', 'false')
    // this._input.addEventListener('input', this.onInput)
    // this._input.addEventListener('click', this.onClick)
    this._eval.addEventListener('click', () => { this.eval() })

    // NOTE: I really don't like tab hiding the menubar
    // this._input.onkeydown = (e) => {
    //   if (e.keyCode === 9 || e.which === 9) { e.preventDefault(); this.inject('  ') }
    // }
    client.surface.maximize()
  }

  this.start = function () {
    this.show()
    this._editor.setValue(this.splash)
    setTimeout(() => { this.eval() }, 1000)
    this.setStatus('Ready.')
  }

  this.eval = (txt = this._editor.getValue()) => {
    if (this._editor.getValue().indexOf('$') > -1) { txt = this.clean(txt) }
    client.bindings = {}
    client.lain.run(`(${txt})`)
    this.feedback()
  }

  this.evalSelection = () => {
    console.log("evaulating selection!!")
    // TODO: This is horribly broke but math is hard at 3:54 AM
    var sel = this._editor.getSelection()
    const value = this._editor.getValue().substr((sel.startLineNumber * sel.startColumn), (sel.endLineNumber * sel.endColumn))
    console.log(value)
    client.lain.run(`(${value})`)
    this.feedback()
  }

  this.load = function (txt) {
    this._editor.setValue(txt)
    this.eval(txt)
  }

  this.clear = function () {
    this.load('')
  }

  this.cleanup = function () {
    this._editor.getValue() = this.clean(this._editor.getValue())
    this.lint()
    this.eval()
  }

  this.update = function () {

  }

  this.onInput = () => {
    this.setStatus()
  }

  this.onClick = () => {
    this.setStatus()
  }

  this.clean = function (input) {
    const keywords = ['$pos+', '$pos', '$rect', '$line', '$x', '$y', '$xy']
    for (const word of keywords) {
      input = input.replace(word, '').trim()
    }
    return input
  }

  this.setStatus = function (msg) {
    // Logs
    if (msg && msg !== this._log.textContent) {
      this._log.textContent = `${msg}`
    }
    this._docs.textContent = this.getDocs()
  }

  // Injection

  // TODO: no effing clue why this doesn't seem to work here
  // this.cache = this._editor.getValue()

  this.loadCache = function() {
    this.cache = this._editor.getValue()
  }

  this.capture = function () {
    if (this._editor.getValue().indexOf('$') < 0) { return }
    this.cache = this._editor.getValue()
  }

  this.inject = function (injection, at = this._editor.getSelection().getSelectionStart()) {
    this._editor.setValue(this._editor.getValue().substring(0, this._editor.getSelection().getSelectionStart()) + injection + this._editor.getValue().substring(this._editor.getSelection().getEndPosition()))
    this._editor.getSelection().setEndPositon(at + injection.length)
  }

  this.injectPath = function (path) {
    if (this._editor.getValue().indexOf('$') < 0) { return }
    this._editor.setValue(this._editor.getValue().replace('$path', `"${path}"`))
  }

  // Helpers

  this.commit = function (shape, end = false, run = false) {
    if (this.cache.indexOf('$') < 0) { return }
    const segs = this.cache.split('$')
    const words = segs[1].split(' ')
    const word = words[0].split(/[^A-Za-z]/)[0]
    const append = words[0].indexOf('+') > -1

    if (word === 'drag') {
      this.cache = this.cache.replace('$drag', '(drag $rect $line)')
    } else if (word === 'view') {
      this.cache = this.cache.replace('$view', '(view $rect $rect)')
    } else if (word === 'poly') {
      this.cache = this.cache.replace('$poly', '(poly $pos+)')
    } else if (word === 'move') {
      this.cache = this.cache.replace('$move', '(transform:move $wh)')
    } else if (word === 'rotate') {
      this.cache = this.cache.replace('$rotate', '(transform:rotate $a)')
    }

    if (shape[word]) {
      if (append) {
        this._editor.setValue(this.cache.replace('$' + word + '+', this.template(shape[word], word) + ' $' + word + '+'))
      } else {
        this._editor.setValue(this.cache.replace('$' + word, this.template(shape[word], word)))
      }
    }

    if (end === true) {
      this.cache = this._editor.getValue()
    }
    if (run === true) {
      this.eval()
    }
  }

  this.template = function (shape, word) {
    if (word === 'rect') { return `(rect ${shape.x} ${shape.y} ${shape.w} ${shape.h})` }
    if (word === 'pos') { return `(pos ${shape.x} ${shape.y})` }
    if (word === 'line') { return `(line ${shape.a.x} ${shape.a.y} ${shape.b.x} ${shape.b.y})` }
    if (word === 'circle') { return `(circle ${shape.cx} ${shape.cy} ${shape.r})` }
    if (word === 'arc') { return `(arc ${shape.cx} ${shape.cy} ${shape.r} ${shape.sa} ${shape.ea})` }
    if (word === 'x' || word === 'y' || word === 'xy' || word === 'wh' || word === 'a' || word === 'r') { return `${shape}` }
    return ''
  }

  // Display

  this.show = (expand = false) => {
    if (this.isVisible === true && expand !== true) { return }
    client.el.className = expand ? 'expand' : ''
    this.isVisible = true
    this._input.focus()
  }

  this.hide = () => {
    if (this.isVisible !== true) { return }
    client.el.className = 'hidden'
    this.isVisible = false
    this._input.blur()
  }

  this.toggle = (expand = false) => {
    if (this.isVisible !== true) {
      this.show(expand)
    } else {
      this.hide()
    }
  }

  this.length = function () {
    return this._editor.getValue().split('\n').length
  }

  this.feedback = function () {
    this._eval.className = 'active'
    setTimeout(() => { this._eval.className = '' }, 150)
  }

  // Docs

  this.getCurrentWord = () => {
    const pos = this._editor.getValue().substr(0, this._editor.getSelection().getSelectionStart()).lastIndexOf('(')
    return this._editor.getValue().substr(pos).split(' ')[0].replace(/\(/g, '').replace(/\)/g, '').trim()
  }

  this.getCurrentFunction = () => {
    const word = this.getCurrentWord()
    let mostSimilar = ''
    if (client.library[word]) { return word }
    for (const id of Object.keys(client.library)) {
      if (id.substr(0, word.length) === word) {
        mostSimilar = id
      }
    }
    return mostSimilar
  }

  this.getDocs = (id) => {
    const name = this.getCurrentFunction()
    const fn = client.library[name]
    if (!fn) { return }
    const fnString = fn.toString()
    if (fnString.indexOf(') => {') < 0) { return }
    const fnParams = fnString.split(') => {')[0].substr(1).split(',').reduce((acc, item) => { return `${acc}${item.indexOf('=') > -1 ? '~' + item.split('=')[0].trim() : item} ` }, '').trim()
    return `(${(name + ' ' + fnParams).trim()})`
  }

  this.lint = function () {
    const value = this._editor.getValue()
    if (value.split('(').length !== value.split(')').length) {
      return client.log('Uneven number of parens.')
    }
    this._editor.setValue(lintLISP(value))
  }

  // Splash

  this.splash = `; animated recusive spiral
  (resize 800 800)
(def frame 
  (get-frame))
;
(defn rec 
  (v) 
  (if 
    (gt v 0) 
    ( 
      ; params 
      (def spiral-x 
        (add frame:c 
          (mul 
            (cos 
              (add 
                (div v 17) 
                (time 0.001))) 
            (div v 2)))) 
      (def spiral-y 
        (add frame:m 
          (mul 
            (sin 
              (div v 11)) 
            (div v 2)))) 
      (def spiral-r 
        (div v 2)) 
      ; draw 
      (stroke 
        (circle spiral-x spiral-y spiral-r) 
        (color (add (mul (sin (add (mul .3 v) 0)) 127) 128) (add (mul (sin (add (mul .3 v) 2)) 127) 128) (add (mul (sin (add (mul .3 v) 4)) 127) 128) 0.1) 1)
      (rec 
        (sub v 0.5)))))
;
(defn redraw () 
  
    (clear) 
    (rec 300))
;
(on "animate" redraw)`
}

function lintLISP (str) {
  // cleanup
  let val = str.replace(/\n/g, '').replace(/ \)/g, ')').replace(/ +(?= )/g, '').replace(/\( \(/g, '((').replace(/\) \)/g, '))').trim()
  // begin
  let depth = 0
  for (let i = 0; i < val.length; i++) {
    const c = val.charAt(i)
    depth += c === '(' ? 1 : c === ')' ? -1 : 0
    // Pad comments
    if (c === ';') {
      const indent = '\n' + ('  '.repeat(depth))
      val = [val.slice(0, i), `${indent}`, val.slice(i)].join('')
      i += indent.length
    }
    // Don't pad when closing on next char
    if (c === '(' && val.charAt(i + 1) !== ')') {
      const indent = '\n' + ('  '.repeat(depth - 1))
      val = [val.slice(0, i), `${indent}`, val.slice(i)].join('')
      i += indent.length
    }
    // Add linebreak after paren at depth 0
    if (c === ')' && depth === 0) {
      val = [val.slice(0, i), ')\n', val.slice(i + 1)].join('')
    }
  }
  // Space out comments
  val = val.split('\n').map((line) => { return line.substr(0, 2) === '; ' ? `\n${line}\n` : line }).join('\n')
  return val.trim()
}
