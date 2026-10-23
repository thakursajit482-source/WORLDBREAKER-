import { useEffect, useCallback } from 'react'
import type { AppScreen } from '../types'

interface TVNavigationOptions {
  activeModal: string
  onCloseModal: () => void
  currentScreen?: AppScreen
  onScreenBack?: () => void
}

export function isElementVisible(el: HTMLElement): boolean {
  if (el.hidden) return false
  if (el.getAttribute('aria-hidden') === 'true') return false
  if (el.style.display === 'none' || el.style.visibility === 'hidden') return false

  if (typeof window !== 'undefined' && window.getComputedStyle) {
    const style = window.getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false
    }
  }
  return true
}

export function getVisibleFocusables(scope: ParentNode = document): HTMLElement[] {
  const elements = Array.from(
    scope.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), [tabindex="0"]'
    )
  )
  return elements.filter(isElementVisible)
}

export function findNextSpatialFocus(
  currentActive: HTMLElement | null,
  focusables: HTMLElement[],
  direction: 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight'
): HTMLElement | null {
  if (focusables.length === 0) return null

  const currentIndex = currentActive ? focusables.indexOf(currentActive) : -1

  // If no element currently active or active element not in list, focus first or last
  if (currentIndex === -1 || !currentActive) {
    return direction === 'ArrowUp' || direction === 'ArrowLeft'
      ? focusables[focusables.length - 1]
      : focusables[0]
  }

  // 1. Attempt 2D Spatial Calculation if getBoundingClientRect returns usable coordinates
  const currentRect = currentActive.getBoundingClientRect?.()
  const hasDimensions =
    currentRect &&
    (currentRect.width > 0 || currentRect.height > 0 || currentRect.top !== 0 || currentRect.left !== 0)

  if (hasDimensions && currentRect) {
    const cx = currentRect.left + currentRect.width / 2
    const cy = currentRect.top + currentRect.height / 2

    const candidates = focusables
      .filter((el) => el !== currentActive)
      .map((el) => {
        const rect = el.getBoundingClientRect()
        const elCx = rect.left + rect.width / 2
        const elCy = rect.top + rect.height / 2
        return { el, rect, elCx, elCy }
      })
      .filter(({ rect, elCx, elCy }) => {
        if (rect.width === 0 && rect.height === 0) return false
        switch (direction) {
          case 'ArrowDown':
            return elCy > cy + 4
          case 'ArrowUp':
            return elCy < cy - 4
          case 'ArrowRight':
            return elCx > cx + 4
          case 'ArrowLeft':
            return elCx < cx - 4
        }
      })

    if (candidates.length > 0) {
      candidates.sort((a, b) => {
        const dxA = Math.abs(a.elCx - cx)
        const dyA = Math.abs(a.elCy - cy)
        const dxB = Math.abs(b.elCx - cx)
        const dyB = Math.abs(b.elCy - cy)

        let scoreA = 0
        let scoreB = 0

        if (direction === 'ArrowDown' || direction === 'ArrowUp') {
          scoreA = dyA + dxA * 2.2
          scoreB = dyB + dxB * 2.2
        } else {
          scoreA = dxA + dyA * 2.2
          scoreB = dxB + dyB * 2.2
        }

        return scoreA - scoreB
      })

      return candidates[0].el
    }
  }

  // 2. Linear Fallback Navigation (for headless tests, flat lists, or edge wrapping)
  let nextIndex: number
  if (direction === 'ArrowDown' || direction === 'ArrowRight') {
    nextIndex = (currentIndex + 1) % focusables.length
  } else {
    nextIndex = (currentIndex - 1 + focusables.length) % focusables.length
  }

  return focusables[nextIndex] ?? null
}

/**
 * Keyboard & Fire TV Remote D-Pad Navigation Hook.
 * Handles spatial D-Pad navigation, Escape/Back dismissal, and accessible focus management.
 */
export function useTVNavigation({
  activeModal,
  onCloseModal,
  currentScreen = 'home',
  onScreenBack,
}: TVNavigationOptions) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.defaultPrevented) return

      const activeDialog = document.querySelector<HTMLElement>('[role="dialog"]')
      const hasActiveModal = activeModal !== 'none' || Boolean(activeDialog)

      // 1. Back / Escape handling (Fire TV Back button, keyboard Escape / Backspace)
      const isBackKey =
        e.key === 'Escape' ||
        e.key === 'Backspace' ||
        e.key === 'GoBack' ||
        e.key === 'Back' ||
        e.keyCode === 27 ||
        e.keyCode === 8 ||
        e.keyCode === 4 ||
        e.keyCode === 10009

      if (isBackKey) {
        // If an input is focused (like a text input), prevent backspace navigation
        if (
          e.target instanceof HTMLInputElement &&
          e.target.type !== 'range' &&
          (e.key === 'Backspace' || e.keyCode === 8)
        ) {
          return
        }

        if (hasActiveModal) {
          e.preventDefault()
          e.stopPropagation()

          if (activeModal !== 'none' && onCloseModal) {
            onCloseModal()
          } else if (activeDialog) {
            const closeBtn = activeDialog.querySelector<HTMLElement>(
              '.wb-modal-close, [aria-label*="Close"], [data-tv-focus="true"]'
            )
            if (closeBtn) {
              closeBtn.click()
            } else if (onCloseModal) {
              onCloseModal()
            }
          }
          return
        }

        if (currentScreen !== 'home' && onScreenBack) {
          e.preventDefault()
          e.stopPropagation()
          onScreenBack()
          return
        }
      }

      // 2. Center Select / Enter button on Fire TV remote
      if (e.key === 'Select') {
        const active = document.activeElement as HTMLElement | null
        if (active && typeof active.click === 'function') {
          e.preventDefault()
          active.click()
          return
        }
      }

      // 3. Prevent spacebar from scrolling page when interacting with buttons/sliders
      if (e.key === ' ' || e.key === 'Spacebar') {
        const active = document.activeElement as HTMLElement | null
        if (
          active instanceof HTMLButtonElement ||
          (active instanceof HTMLInputElement && active.type === 'range')
        ) {
          // Native button click handles Space; prevent window scroll
          if (active instanceof HTMLButtonElement) {
            // Let default button click fire
          }
        }
      }

      // 4. Spatial Navigation for Fire TV D-Pad & Keyboard Arrows
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        const direction = e.key as 'ArrowDown' | 'ArrowUp' | 'ArrowLeft' | 'ArrowRight'
        const currentActive = document.activeElement as HTMLElement | null

        // If range slider is focused, Left/Right adjusts value normally, so don't steal Left/Right focus
        if (
          currentActive instanceof HTMLInputElement &&
          currentActive.type === 'range' &&
          (direction === 'ArrowLeft' || direction === 'ArrowRight')
        ) {
          return
        }

        // Query visible focusable interactive elements (scoped strictly to dialog if open)
        const scope = activeDialog || document
        const focusables = getVisibleFocusables(scope)

        if (focusables.length === 0) return

        const nextElement = findNextSpatialFocus(currentActive, focusables, direction)

        if (nextElement) {
          e.preventDefault()

          // Clear previous tv focus indicator attribute
          document.querySelectorAll('[data-tv-focused="true"]').forEach((node) => {
            node.removeAttribute('data-tv-focused')
          })

          nextElement.setAttribute('data-tv-focused', 'true')
          nextElement.focus()

          nextElement.addEventListener(
            'blur',
            () => {
              nextElement.removeAttribute('data-tv-focused')
            },
            { once: true }
          )
        }
      }
    },
    [activeModal, onCloseModal, currentScreen, onScreenBack]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
