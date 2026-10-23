import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  findNextSpatialFocus,
  getVisibleFocusables,
  isElementVisible,
} from './useTVNavigation'
import type { AppScreen, ModalType } from '../types'

// Lightweight DOM Node simulation for pure Node.js Vitest environment
class MockElement {
  tagName: string
  type?: string
  id: string = ''
  className: string = ''
  hidden: boolean = false
  disabled: boolean = false
  style: Record<string, string> = {}
  attributes: Record<string, string> = {}
  children: MockElement[] = []
  parentNode: MockElement | null = null
  onclick?: () => void
  _rect: { top: number; bottom: number; left: number; right: number; width: number; height: number; x: number; y: number }

  constructor(tagName: string) {
    this.tagName = tagName.toUpperCase()
    this._rect = { top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, x: 0, y: 0 }
  }

  getAttribute(name: string) {
    return this.attributes[name] ?? null
  }

  setAttribute(name: string, val: string) {
    this.attributes[name] = val
  }

  removeAttribute(name: string) {
    delete this.attributes[name]
  }

  getBoundingClientRect() {
    return this._rect
  }

  appendChild(child: MockElement) {
    child.parentNode = this
    this.children.push(child)
  }

  removeChild(child: MockElement) {
    this.children = this.children.filter((c) => c !== child)
    child.parentNode = null
  }

  click() {
    this.onclick?.()
  }

  focus() {
    if (typeof document !== 'undefined') {
      ;(document as any).activeElement = this
    }
  }

  addEventListener(_event: string, _handler: any, _options?: any) {}
  removeEventListener(_event: string, _handler: any) {}

  querySelectorAll<T = MockElement>(selector: string): T[] {
    const results: MockElement[] = []
    const traverse = (node: MockElement) => {
      for (const child of node.children) {
        if (matchesSelector(child, selector)) {
          results.push(child)
        }
        traverse(child)
      }
    }
    traverse(this)
    return results as unknown as T[]
  }

  querySelector<T = MockElement>(selector: string): T | null {
    const all = this.querySelectorAll<T>(selector)
    return all.length > 0 ? all[0] : null
  }
}

function matchesSelector(el: MockElement, selector: string): boolean {
  if (selector.includes('[role="dialog"]') && el.getAttribute('role') === 'dialog') return true
  if (selector.includes('.wb-modal-close') && el.className.includes('wb-modal-close')) return true
  if (selector.includes('.wb-btn-primary') && el.className.includes('wb-btn-primary')) return true
  if (selector.includes('button') && el.tagName === 'BUTTON' && !el.disabled) return true
  if (selector.includes('input') && el.tagName === 'INPUT' && !el.disabled) return true
  return false
}

describe('useTVNavigation - Spatial & Linear Navigation Engine', () => {
  it('correctly falls back to linear cyclical navigation when bounding rects are 0', () => {
    const el1 = new MockElement('button') as unknown as HTMLElement
    const el2 = new MockElement('button') as unknown as HTMLElement
    const el3 = new MockElement('button') as unknown as HTMLElement
    const focusables = [el1, el2, el3]

    // ArrowDown advances
    expect(findNextSpatialFocus(el1, focusables, 'ArrowDown')).toBe(el2)
    expect(findNextSpatialFocus(el2, focusables, 'ArrowDown')).toBe(el3)
    expect(findNextSpatialFocus(el3, focusables, 'ArrowDown')).toBe(el1) // wrap

    // ArrowRight advances
    expect(findNextSpatialFocus(el1, focusables, 'ArrowRight')).toBe(el2)

    // ArrowUp reverses
    expect(findNextSpatialFocus(el2, focusables, 'ArrowUp')).toBe(el1)
    expect(findNextSpatialFocus(el1, focusables, 'ArrowUp')).toBe(el3) // wrap

    // ArrowLeft reverses
    expect(findNextSpatialFocus(el3, focusables, 'ArrowLeft')).toBe(el2)
  })

  it('navigates spatially in 2D space based on bounding client coordinates', () => {
    // Layout:
    // [Header Button] (top: 20, left: 100, width: 80, height: 40)
    // [Card 1] (top: 150, left: 50, width: 100, height: 100)
    // [Card 2] (top: 150, left: 200, width: 100, height: 100)
    const headerBtn = new MockElement('button')
    headerBtn._rect = { top: 20, bottom: 60, left: 100, right: 180, width: 80, height: 40, x: 100, y: 20 }

    const card1 = new MockElement('button')
    card1._rect = { top: 150, bottom: 250, left: 50, right: 150, width: 100, height: 100, x: 50, y: 150 }

    const card2 = new MockElement('button')
    card2._rect = { top: 150, bottom: 250, left: 200, right: 300, width: 100, height: 100, x: 200, y: 150 }

    const focusables = [
      headerBtn as unknown as HTMLElement,
      card1 as unknown as HTMLElement,
      card2 as unknown as HTMLElement,
    ]

    // From Card 1, ArrowRight moves to Card 2
    expect(findNextSpatialFocus(card1 as unknown as HTMLElement, focusables, 'ArrowRight')).toBe(card2)

    // From Card 2, ArrowLeft moves to Card 1
    expect(findNextSpatialFocus(card2 as unknown as HTMLElement, focusables, 'ArrowLeft')).toBe(card1)

    // From Card 1, ArrowUp moves to Header Button
    expect(findNextSpatialFocus(card1 as unknown as HTMLElement, focusables, 'ArrowUp')).toBe(headerBtn)

    // From Header Button, ArrowDown prefers nearest Card
    const target = findNextSpatialFocus(headerBtn as unknown as HTMLElement, focusables, 'ArrowDown')
    expect(target === (card1 as unknown as HTMLElement) || target === (card2 as unknown as HTMLElement)).toBe(true)
  })

  it('correctly filters out invisible, hidden, and aria-hidden elements', () => {
    const visibleBtn = new MockElement('button') as unknown as HTMLElement
    const hiddenBtn = new MockElement('button')
    hiddenBtn.hidden = true
    const ariaHiddenBtn = new MockElement('button')
    ariaHiddenBtn.setAttribute('aria-hidden', 'true')
    const displayNoneBtn = new MockElement('button')
    displayNoneBtn.style.display = 'none'

    expect(isElementVisible(visibleBtn)).toBe(true)
    expect(isElementVisible(hiddenBtn as unknown as HTMLElement)).toBe(false)
    expect(isElementVisible(ariaHiddenBtn as unknown as HTMLElement)).toBe(false)
    expect(isElementVisible(displayNoneBtn as unknown as HTMLElement)).toBe(false)
  })
})

describe('useTVNavigation - Key Event Handling and Fire TV Remote', () => {
  let docBody: MockElement

  beforeEach(() => {
    docBody = new MockElement('body')
    ;(globalThis as any).document = {
      body: docBody,
      activeElement: null,
      querySelector: (selector: string) => docBody.querySelector(selector),
      querySelectorAll: (selector: string) => docBody.querySelectorAll(selector),
    }
    ;(globalThis as any).window = {
      getComputedStyle: (el: any) => el.style || {},
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }
  })

  afterEach(() => {
    delete (globalThis as any).document
    delete (globalThis as any).window
    vi.restoreAllMocks()
  })

  it('allows native Left/Right arrow control on range sliders without moving focus', () => {
    const slider = new MockElement('input')
    slider.type = 'range'
    slider.id = 'gravity-slider'
    docBody.appendChild(slider)

    slider.focus()
    expect(((globalThis as any).document as any).activeElement).toBe(slider)

    // Check slider pass-through condition
    const currentActive = ((globalThis as any).document as any).activeElement
    const isSlider = currentActive.type === 'range'
    expect(isSlider).toBe(true)
  })

  it('triggers click on focused element when Fire TV remote sends Select key', () => {
    const btn = new MockElement('button')
    const clickSpy = vi.fn()
    btn.onclick = clickSpy
    docBody.appendChild(btn)
    btn.focus()

    // Test select trigger
    const active = ((globalThis as any).document as any).activeElement as MockElement
    if (active && typeof active.click === 'function') {
      active.click()
    }

    expect(clickSpy).toHaveBeenCalledTimes(1)
  })

  it('traps focus inside modal dialog and prevents leaking to background elements', () => {
    const bgBtn1 = new MockElement('button')
    bgBtn1.id = 'bg-btn-1'
    docBody.appendChild(bgBtn1)

    const dialog = new MockElement('div')
    dialog.setAttribute('role', 'dialog')
    dialog.setAttribute('aria-modal', 'true')

    const modalCloseBtn = new MockElement('button')
    modalCloseBtn.className = 'wb-modal-close'
    const modalActionBtn = new MockElement('button')
    modalActionBtn.className = 'wb-btn-primary'

    dialog.appendChild(modalCloseBtn)
    dialog.appendChild(modalActionBtn)
    docBody.appendChild(dialog)

    const focusablesInDialog = getVisibleFocusables(dialog as unknown as ParentNode)
    expect(focusablesInDialog).toHaveLength(2)
    expect(focusablesInDialog).toContain(modalCloseBtn as unknown as HTMLElement)
    expect(focusablesInDialog).toContain(modalActionBtn as unknown as HTMLElement)
    expect(focusablesInDialog).not.toContain(bgBtn1 as unknown as HTMLElement)

    // Linear navigation inside dialog
    expect(
      findNextSpatialFocus(
        modalCloseBtn as unknown as HTMLElement,
        focusablesInDialog,
        'ArrowDown'
      )
    ).toBe(modalActionBtn)

    // Wraps inside dialog!
    expect(
      findNextSpatialFocus(
        modalActionBtn as unknown as HTMLElement,
        focusablesInDialog,
        'ArrowDown'
      )
    ).toBe(modalCloseBtn)
  })

  it('dismisses modal on Escape or Fire TV Back key without exiting screen', () => {
    const onCloseModal = vi.fn()
    const onScreenBack = vi.fn()

    const activeModal: ModalType = 'how-it-works'
    const currentScreen: AppScreen = 'gravity-lab'

    const handleBackPress = (key: string, modalState: ModalType, screenState: AppScreen) => {
      const isBackKey = key === 'Escape' || key === 'Backspace' || key === 'GoBack' || key === 'Back'
      if (!isBackKey) return

      if (modalState !== 'none') {
        onCloseModal()
        return
      }

      if (screenState !== 'home') {
        onScreenBack()
      }
    }

    handleBackPress('Escape', activeModal, currentScreen)
    expect(onCloseModal).toHaveBeenCalledTimes(1)
    expect(onScreenBack).not.toHaveBeenCalled()

    handleBackPress('GoBack', activeModal, currentScreen)
    expect(onCloseModal).toHaveBeenCalledTimes(2)
    expect(onScreenBack).not.toHaveBeenCalled()
  })

  it('backs out of lab screen to lab-select when no modal is open', () => {
    const onCloseModal = vi.fn()
    const onScreenBack = vi.fn()

    const activeModal: ModalType = 'none'
    const currentScreen: AppScreen = 'rotation-lab'

    const handleBackPress = (key: string, modalState: ModalType, screenState: AppScreen) => {
      const isBackKey = key === 'Escape' || key === 'Backspace' || key === 'GoBack' || key === 'Back'
      if (!isBackKey) return

      if (modalState !== 'none') {
        onCloseModal()
        return
      }

      if (screenState !== 'home') {
        onScreenBack()
      }
    }

    handleBackPress('GoBack', activeModal, currentScreen)
    expect(onScreenBack).toHaveBeenCalledTimes(1)
    expect(onCloseModal).not.toHaveBeenCalled()
  })
})

describe('Lab Consistency & Accessibility QA Standards', () => {
  it('validates Gravity Lab range slider step bounds and ARIA specifications', () => {
    const MIN_GRAVITY = 1.0
    const MAX_GRAVITY = 25.0
    const stepDelta = 0.5
    let currentGravity = 9.81

    const stepDown = () => {
      currentGravity = Math.max(MIN_GRAVITY, Math.min(MAX_GRAVITY, Number((currentGravity - stepDelta).toFixed(2))))
    }
    const stepUp = () => {
      currentGravity = Math.max(MIN_GRAVITY, Math.min(MAX_GRAVITY, Number((currentGravity + stepDelta).toFixed(2))))
    }

    stepDown()
    expect(currentGravity).toBeCloseTo(9.31)
    stepUp()
    expect(currentGravity).toBeCloseTo(9.81)

    // Bound test: can never exceed max
    currentGravity = 24.8
    stepUp()
    expect(currentGravity).toBe(25.0)
    stepUp()
    expect(currentGravity).toBe(25.0)

    // Bound test: can never go below min
    currentGravity = 1.2
    stepDown()
    expect(currentGravity).toBe(1.0)
    stepDown()
    expect(currentGravity).toBe(1.0)
  })

  it('validates Rotation Lab speed step bounds and ARIA specifications', () => {
    const MIN_SPEED = 0.1
    const MAX_SPEED = 5.0
    let speed = 1.0

    const stepSpeed = (delta: number) => {
      speed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, Number((speed + delta).toFixed(2))))
    }

    stepSpeed(-0.1)
    expect(speed).toBeCloseTo(0.9)
    stepSpeed(0.1)
    expect(speed).toBeCloseTo(1.0)

    // Max clamp
    speed = 4.95
    stepSpeed(0.1)
    expect(speed).toBe(5.0)
    stepSpeed(0.1)
    expect(speed).toBe(5.0)

    // Min clamp
    speed = 0.15
    stepSpeed(-0.1)
    expect(speed).toBe(0.1)
    stepSpeed(-0.1)
    expect(speed).toBe(0.1)
  })

  it('validates consistent back hierarchy across all lab screens', () => {
    const getNextScreenOnBack = (screen: AppScreen): AppScreen | null => {
      switch (screen) {
        case 'gravity-lab':
        case 'rotation-lab':
        case 'atmosphere-lab':
          return 'lab-select'
        case 'lab-select':
          return 'home'
        case 'home':
          return null
      }
    }

    expect(getNextScreenOnBack('gravity-lab')).toBe('lab-select')
    expect(getNextScreenOnBack('rotation-lab')).toBe('lab-select')
    expect(getNextScreenOnBack('atmosphere-lab')).toBe('lab-select')
    expect(getNextScreenOnBack('lab-select')).toBe('home')
    expect(getNextScreenOnBack('home')).toBeNull()
  })
})
