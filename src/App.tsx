import { useState, useCallback } from 'react'
import { Scene } from './components/Canvas3D/Scene'
import { Header } from './components/UI/Header'
import { HeroOverlay } from './components/UI/HeroOverlay'
import { TelemetryPanel } from './components/UI/TelemetryPanel'
import { TVRemoteGuide } from './components/UI/TVRemoteGuide'
import { HowItWorksModal } from './components/UI/HowItWorksModal'
import { LabEntranceModal } from './components/UI/LabEntranceModal'
import { useTVNavigation } from './hooks/useTVNavigation'
import { useSoundEffects } from './hooks/useSoundEffects'
import type { ModalType } from './types'

export function App() {
  const [activeModal, setActiveModal] = useState<ModalType>('none')
  const { soundEnabled, toggleSound, playClick, playOpen } = useSoundEffects()

  const handleCloseModal = useCallback(() => {
    setActiveModal('none')
    playClick()
  }, [playClick])

  const handleEnterLab = useCallback(() => {
    playOpen()
    setActiveModal('lab-entrance')
  }, [playOpen])

  const handleHowItWorks = useCallback(() => {
    playOpen()
    setActiveModal('how-it-works')
  }, [playOpen])

  // Fire TV D-Pad & Keyboard Remote Navigation Hook
  useTVNavigation({
    activeModal,
    onCloseModal: handleCloseModal,
  })

  return (
    <div className="wb-app">
      {/* 3D WebGL Canvas Layer (Procedural Planet + Starfield) */}
      <Scene />

      {/* Cinematic Vignette Overlay */}
      <div className="wb-vignette" aria-hidden="true" />

      {/* Primary UI HUD Layer */}
      <div className="wb-ui-layer">
        <Header soundEnabled={soundEnabled} onToggleSound={toggleSound} />

        <div className="wb-main-layout">
          <HeroOverlay
            onEnterLab={handleEnterLab}
            onHowItWorks={handleHowItWorks}
          />
          <TelemetryPanel />
        </div>

        <TVRemoteGuide />
      </div>

      {/* Accessible Modals */}
      <HowItWorksModal
        isOpen={activeModal === 'how-it-works'}
        onClose={handleCloseModal}
      />

      <LabEntranceModal
        isOpen={activeModal === 'lab-entrance'}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default App
