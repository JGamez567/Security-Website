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


/* ── Topic Content Data ── */
const topicData = {
  passwords: {
    icon: '1',
    title: 'Use Strong, Unique Passwords',
    image: "images/R1_Redesign_Image-02.jpg" , 
    content: `
      <p>Most people use one simple password for everything. If that one password gets stolen, attackers can access all your accounts at once email, banking, social media, all of it.</p>
      <p>The fix is easier than you think:</p>
      <ul>
        <li>Use a passphrase something like "Pizza!OnFridays2024" is long, easy to remember, and very hard to crack.</li>
        <li>Never reuse the same password across different sites.</li>
        <li>Use a free password manager like Bitwarden to store them all securely you only need to remember one master password.</li>
        <li>Avoid using personal info like birthdays, pet names, or your school in your password.</li>
      </ul>`,
    cite: { text: '65% of people reuse the same password across multiple sites, making one breach a gateway to many accounts.', label: 'See References' }
  },
  phishing: {
    icon: '2',
    title: 'Watch Out for Phishing',
    image: "images/phishing.webp",
    content: `
      <p>Phishing is when attackers send fake emails or messages pretending to be someone you know. For example, your bank, Netflix, your school to trick you into handing over your login info or clicking a malicious link. Here are some tips to detect or deal with phishing emails.</p>
      <ul>
        <li>Check the sender's actual email address, not just the display name because the email name could be something completely unrelated.</li>
        <li>Look out for any misspelling in the email</li>
        <li>Hover over links before clicking to see where they really go.</li>
        <li>Be suspicious when they say anything like "Your account will be deleted in 24 hours!".</li>
        <li>If you are not sure if it's a phishing email, just go on the offical website or app.</li>
      </ul>`,
    cite: { text: '22.3% of all phishing attacks in Q2 2023 targeted social media platforms, and phishing on social media increased by 103% in 2021.', label: 'See References — Mouncey & Ciobotaru, Journal of Economic Criminology (2025)' }
  },
  social: {
    icon: '3',
    title: 'Be Careful What You Share on Social Media',
    image: "images/2023-May-SEORG-blog-Image-1.jpg",
    content: `
      <p>It is easy to accidentally overshare information that hackers can use against you. Your birthday, hometown, school name, or pet's name might be the exact answers to your account security questions.</p>
      <ul>
        <li>Set your profiles to private.</li>
        <li>Avoid posting your address, daily schedule, or travel plans publicly.</li>
        <li>Be selective about who you accept as a follower or friend.</li>
        <li>Don't tag your location in real time.</li>
      </ul>`,
    cite: { text: 'Phishing on social media platforms surged 103% in 2021, yet 60.3% of Instagram users surveyed had never received any phishing awareness training.', label: 'See References — Mouncey & Ciobotaru, Journal of Economic Criminology (2025)' }
  },
  updates: {
    icon: '4',
    title: 'Keep Your Software Updated',
    image: "images/3997360-0-53621700-1748470993-WindowsUpdate-4.webp",
    content: `
      <p>It is annoying, but updates really matter. Most software updates include security patches that fix known vulnerabilities. Attackers actively look for people running outdated versions because they know exactly what weaknesses to exploit.</p>
      <ul>
        <li>Enable <strong>automatic updates</strong> on your phone and computer.</li>
        <li>Keep your apps, browser, and operating system up to date.</li>
        <li>Do not ignore update notifications — they are there for a reason.</li>
        <li>Outdated software is one of the easiest ways for attackers to hack you.</li>
      </ul>`,
    cite: null
  },
  wifi: {
    icon: '5',
    title: 'Be Careful on Public Wi-Fi',
    image: "images/free-internet-bait-hook.avif",
    content: `
      <p>Public Wi-Fi at coffee shops, airports, or libraries is convenient but risky. Anyone on the same network can potentially see what you are doing — including intercepting login info on unsecured sites.</p>
      <ul>
        <li>Avoid logging into your bank or any sensitive accounts on public Wi-Fi.</li>
        <li>Use a VPN (Virtual Private Network) to encrypt your connection.</li>
        <li>Turn off auto-connect to open networks on your phone.</li>
        <li>Look for HTTPS in the URL  the "S" means the connection is encrypted.It should not be HTTP.</li>
        <li>Man-in-middle,Rogue Hotspots,Packet Sniffing, these are just some of the many types of attacks you are exposed to when you connect to public Wi-Fi. </li>
      </ul>`,
    cite: null
  },
  '2fa': {
    icon: '6',
    title: 'Turn On Two-Factor Authentication (2FA)',
    image: "images/AdobeStock_499862780-min.jpeg",
    content: `
      <p>Two-factor authentication means that even if someone steals your password, they still cannot get into your account without a second verification step, usually a code sent to your phone or generated by an app.</p>
      <ul>
        <li>Enable 2FA on all your accounts </li>
        <li>Use an authenticator app like Google Authenticator instead of SMS when possible because SMS can be intercepted.</li>
        <li>It takes less than a minute to set up and stops the majority of account takeovers.</li>
      </ul>`,
    cite: { text: 'Over 97% of students agreed that gamified cybersecurity activities motivated them to learn — and 94% found it more effective than traditional teaching.', label: 'See References — Matovu et al., IEEE FIE (2022)' }
  },
  breaches: {
    icon: '7',
    title: 'Check If You Have Been in a Breach',
    image: "images/data_breach.webp",
    content: `
      <p>Data breaches happen when a company gets hacked and user information including passwords,card details,and media files gets leaked online unless a ransom is paid. You might already be affected without knowing it.</p>
      <ul>
        <li>Visit haveibeenpwned.com to check if your email appeared in a known breach it is free and safe to use.</li>
        <li>If your info was leaked, change that password immediately on every site you used it.</li>
        <li>Sign up for breach alerts so you are notified quickly if it happens again.</li>
        <li>Many breaches go undiscovered for months so check regularly</li>
      </ul>`,
    cite: null
  },
  children: {
    icon: '8',
    title: 'Keeping Children Safe Online',
    image: "images/Tips-for-keeping-kids-safe-online.jpg",
    content: `
      <p>Children are especially vulnerable online. They are more trusting, less aware of risks, and can easily share personal information without realizing the danger. Parents need to play a key role in keeping them safe and its their responsibility.</p>
      <ul>
        <li>Talk openly with your kids about online safety not just restrict access.</li>
        <li>Use parental controls on devices, apps, and browsers.</li>
        <li>Teach children to never share their location, school name, or photos with strangers.</li>
        <li>Know which apps and platforms your child is using.</li>
        <li>Roblox and Minecraft are the most common games predators are on. Same thing with apps like Discord and Snapchat.</li>
      </ul>`,
   cite: { text: 'A review of 56 peer-reviewed studies found that the most commonly addressed cybersecurity risks for children include privacy threats, cyberbullying, and exposure to inappropriate content.', label: 'See References — Quayyum, Cruzes & Jaccheri, International Journal of Child-Computer Interaction (2021)' }
  }
}

/* ── GSAP Flip + Overlay — Topics Page ── */
const initTopics = () => {
  if (!document.querySelector('.listItem')) return

  const overlay   = document.getElementById('topicOverlay')
  const card      = document.getElementById('overlayCard')
  const closeBtn  = document.getElementById('overlayClose')
  const iconEl    = document.getElementById('overlayIcon')
  const titleEl   = document.getElementById('overlayTitle')
  const bodyEl    = document.getElementById('overlayBody')

  if (!overlay) return

  const openOverlay = (topic) => {
    const data = topicData[topic]
    if (!data) return

    iconEl.textContent  = data.icon
    titleEl.textContent = data.title

    const imageHTML = data.image
      ? `<div class="overlay-image"><img src="${data.image}" alt="${data.title}" /></div>`
      : `<div class="overlay-image">
           <div class="img-placeholder">
             <span>🖼️</span>
             Add an image here — set data.image in main.js
           </div>
         </div>`

    const citeHTML = data.cite
      ? `<a class="cite-quote" href="references.html">
           "${data.cite.text}"
           <span>&#8594; ${data.cite.label}</span>
         </a>`
      : ''

    bodyEl.className = 'overlay-body'
    bodyEl.innerHTML = `
      <div class="overlay-text">
        ${data.content}
        ${citeHTML}
      </div>
      ${imageHTML}
    `

    overlay.classList.add('active')
    document.body.style.overflow = 'hidden'

    gsap.fromTo(card,
      { opacity: 0, y: 30, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'power2.out' }
    )
  }

  const closeOverlay = () => {
    gsap.to(card, {
      opacity: 0, y: 20, scale: 0.97, duration: 0.2, ease: 'power2.in',
      onComplete: () => {
        overlay.classList.remove('active')
        document.body.style.overflow = ''
      }
    })
  }

  // Click card items
  document.querySelectorAll('.listItem').forEach(item => {
    item.addEventListener('click', () => openOverlay(item.dataset.topic))
  })

  // Close button
  closeBtn.addEventListener('click', closeOverlay)

  // Click outside card to close
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay()
  })

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeOverlay()
  })
}


/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  initParticles()
  initTopics()
})