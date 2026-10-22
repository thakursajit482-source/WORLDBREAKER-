import { useEffect, useCallback } from 'react'
import type { AppScreen } from '../types'

interface TVNavigationOptions {
  activeModal: string
  onCloseModal: () => void
  currentScreen?: AppScreen
  onScreenBack?: () => void
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
      // 1. Back/Escape handling
      if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'GoBack') {
        // If an input is focused (like a slider), prevent backspace navigation if user is editing
        if (e.target instanceof HTMLInputElement && e.key === 'Backspace') {
          return
        }

        if (activeModal !== 'none') {
          e.preventDefault()
          onCloseModal()
          return
        }

        if (currentScreen !== 'home' && onScreenBack) {
          e.preventDefault()
          onScreenBack()
          return
        }
      }

      // 2. Spatial Navigation for Fire TV D-Pad & Keyboard Arrows
      if (['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // If slider is focused, Left/Right adjusts value normally, so don't steal Left/Right focus
        if (
          e.target instanceof HTMLInputElement &&
          e.target.type === 'range' &&
          (e.key === 'ArrowLeft' || e.key === 'ArrowRight')
        ) {
          return
        }

        // Query visible focusable interactive elements
        const scope =
          activeModal !== 'none'
            ? document.querySelector('[role="dialog"]') || document
            : document

        const focusables = Array.from(
          scope.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]):not([type="hidden"]), [tabindex="0"]'
          )
        ).filter((el) => el.offsetParent !== null) // Filter out hidden elements

        if (focusables.length === 0) return

        const currentActive = document.activeElement as HTMLElement
        const currentIndex = focusables.indexOf(currentActive)

        let nextIndex = 0

        if (currentIndex === -1) {
          nextIndex = 0
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          nextIndex = (currentIndex + 1) % focusables.length
          e.preventDefault()
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          nextIndex = (currentIndex - 1 + focusables.length) % focusables.length
          e.preventDefault()
        }

        focusables[nextIndex]?.focus()
      }
    },
    [activeModal, onCloseModal, currentScreen, onScreenBack]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
