/* ── Particle / Bubble Animation ── */
const state = {
  max: 70,
  canvas: null,
  context: null,
  particles: [],
  colors: ['#0077cc', '#070E14', '#070E14', '#070E14', '#070E14', '#1a1a2e']
}

class Particle {
  constructor(id = 0) {
    this.id = id
    this.type = this.randomizeType()
    this.inBounds = false
    this.coords = {
      x: Math.round(Math.random() * state.canvas.width),
      y: Math.round(Math.random() * state.canvas.height)
    }
    this.velocity = {
      x: (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 0.7),
      y: (Math.random() < 0.5 ? -1 : 1) * (Math.random() * 0.7)
    }
    this.alpha = 0.1
    this.hex = this.randomFromArray(state.colors)
    this.color = this.hexToRGBA(this.hex, this.alpha)
    this.strokeWidth = Math.random() * (Math.random() > 0.5 ? 1.5 : 2.5)

    switch (this.type) {
      case 'bubble':
        this.diameter = this.getCircleDiameter()
        break
      case 'line':
        this.angle = Math.atan2(this.coords.y, this.coords.x)
        this.length = this.randomFromArray([5, 7, 3, 10])
        this.rotateSpeed = this.randomFromArray([10, 30, 60, 120])
        this.rotateClockwise = Math.random() < 0.5
        break
    }
  }

  getCircleDiameter() {
    let diameter = 0
    while (diameter < 2) {
      diameter = (Math.random() * 7) * 2
    }
    return diameter
  }

  update() {
    if (this.alpha < 1) {
      this.alpha += 0.01
      this.color = this.hexToRGBA(this.hex, this.alpha)
    }
    this.coords.x += this.velocity.x
    this.coords.y += this.velocity.y

    if (this.type === 'line') {
      let angle = Math.PI / this.rotateSpeed
      this.angle += this.rotateClockwise ? -Math.abs(angle) : Math.abs(angle)
    }
    return this.withinBounds()
  }

  draw() {
    state.context.lineWidth = this.strokeWidth
    state.context.strokeStyle = this.color
    state.context.save()

    switch (this.type) {
      case 'line':
        state.context.translate(this.coords.x / 2, this.coords.y / 2)
        state.context.rotate(this.angle)
        state.context.beginPath()
        state.context.moveTo(-this.length / 2, 0)
        state.context.lineTo(this.length / 2, 0)
        break
      case 'bubble':
        state.context.beginPath()
        state.context.arc(this.coords.x, this.coords.y, this.diameter, 0, Math.PI * 2, false)
        break
    }

    state.context.stroke()
    state.context.restore()
  }

  withinBounds() {
    let boundX = (state.canvas.width / 2) + 5
    let boundY = (state.canvas.height / 2) + 5
    let x = this.coords.x / 2
    let y = this.coords.y / 2
    this.inBounds = !((x > boundX || x < 0 - 5) || (y > boundY || y < 0 - 5))
    return this.inBounds
  }

  hexToRGBA(hex, alpha) {
    const trimHex = hex => hex.replace('#', '')
    let red   = parseInt(trimHex(hex).substring(0, 2), 16)
    let green = parseInt(trimHex(hex).substring(2, 4), 16)
    let blue  = parseInt(trimHex(hex).substring(4, 6), 16)
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`
  }

  randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)]
  }

  randomizeType() {
    let types = Array(4).fill('bubble')
    types.push('line')
    return this.randomFromArray(types)
  }
}

const updateCanvasSize = () => {
  if (!state.canvas) return
  state.canvas.width = state.canvas.parentNode.offsetWidth * 2
  state.canvas.height = state.canvas.parentNode.offsetHeight * 2
  state.canvas.style.width = state.canvas.parentNode.offsetWidth + 'px'
  state.canvas.style.height = state.canvas.parentNode.offsetHeight + 'px'
}

let pids = 0
const generate = () => {
  if (state.particles.length < state.max) {
    for (let i = state.particles.length; i < state.max; i++) {
      state.particles.push(new Particle(pids++))
    }
  }
}

const updateParticles = () => {
  if (state.particles.length < state.max - 5) generate()
  state.particles = state.particles.filter(particle => particle.update())
  state.context.clearRect(0, 0, state.canvas.width, state.canvas.height)
  state.particles.forEach(particle => particle.draw())
  requestAnimationFrame(updateParticles)
}

const initParticles = () => {
  const canvas = document.querySelector('#canvas-particles')
  if (!canvas) return
  state.canvas = canvas
  state.context = canvas.getContext('2d')
  updateCanvasSize()
  generate()
  updateParticles()
  window.addEventListener('resize', updateCanvasSize)
}


/* ── GSAP Flip — Topics Page ── */
const initTopics = () => {
  if (typeof gsap === 'undefined' || typeof Flip === 'undefined') return
  if (!document.querySelector('.listItem')) return

  gsap.registerPlugin(Flip)
  const dur = 0.5
  let lastItems = []
  let lastIndex = -1
  const listItems = gsap.utils.toArray('.listItem')

  listItems.forEach((item, i) => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.cite-quote')) return

      const itemTargets = gsap.utils.toArray(item.querySelectorAll('*'))
      const isSameAsLast = i === lastIndex && listItems[lastIndex]
      const targets = isSameAsLast
        ? listItems.concat(itemTargets)
        : listItems.concat(itemTargets.concat(lastItems))

      const state = Flip.getState(targets)

      if (!isSameAsLast && listItems[lastIndex]) {
        listItems[lastIndex].classList.remove('expanded')
      }

      listItems[i].classList.toggle('expanded')

      Flip.from(state, {
        duration: dur,
        ease: 'power1.inOut',
        absolute: true,
        nested: true,
        onEnter: elements => gsap.fromTo(elements, { opacity: 0 }, { opacity: 1, duration: dur / 2, delay: dur / 2 }),
        onLeave: elements => gsap.fromTo(elements, { opacity: (i, el) => state.getProperty(el, 'opacity') }, { opacity: 0, duration: dur / 2 }),
      })

      lastItems = itemTargets
      lastIndex = i
    })
  })
}


/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  initParticles()
  initTopics()
})