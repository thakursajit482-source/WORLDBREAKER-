import { useState, useCallback } from 'react'
import { Scene } from './components/Canvas3D/Scene'
import { Header } from './components/UI/Header'
import { HeroOverlay } from './components/UI/HeroOverlay'
import { TelemetryPanel } from './components/UI/TelemetryPanel'
import { TVRemoteGuide } from './components/UI/TVRemoteGuide'
import { HowItWorksModal } from './components/UI/HowItWorksModal'
import { LabSelectionView } from './components/UI/LabSelectionView'
import { GravityLabView } from './features/gravity/GravityLabView'
import { RotationLabView } from './features/rotation/RotationLabView'
import { AtmosphereLab } from './components/AtmosphereLab'
import { useTVNavigation } from './hooks/useTVNavigation'
import { useSoundEffects } from './hooks/useSoundEffects'
import type { ModalType, AppScreen } from './types'

export function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home')
  const [activeModal, setActiveModal] = useState<ModalType>('none')
  const { soundEnabled, toggleSound, playClick, playOpen, playImpact } = useSoundEffects()

  const handleCloseModal = useCallback(() => {
    setActiveModal('none')
    playClick()
  }, [playClick])

  const handleEnterLab = useCallback(() => {
    playOpen()
    setCurrentScreen('lab-select')
  }, [playOpen])

  const handleHowItWorks = useCallback(() => {
    playOpen()
    setActiveModal('how-it-works')
  }, [playOpen])

  const handleSelectGravityLab = useCallback(() => {
    playOpen()
    setCurrentScreen('gravity-lab')
  }, [playOpen])

  const handleSelectRotationLab = useCallback(() => {
    playOpen()
    setCurrentScreen('rotation-lab')
  }, [playOpen])

  const handleSelectAtmosphereLab = useCallback(() => {
    playOpen()
    setCurrentScreen('atmosphere-lab')
  }, [playOpen])

  const handleScreenBack = useCallback(() => {
    playClick()
    if (
      currentScreen === 'gravity-lab' ||
      currentScreen === 'rotation-lab' ||
      currentScreen === 'atmosphere-lab'
    ) {
      setCurrentScreen('lab-select')
    } else if (currentScreen === 'lab-select') {
      setCurrentScreen('home')
    }
  }, [currentScreen, playClick])

  // Fire TV D-Pad & Keyboard Remote Navigation Hook
  useTVNavigation({
    activeModal,
    onCloseModal: handleCloseModal,
    currentScreen,
    onScreenBack: handleScreenBack,
  })

  // Render Rotation Lab View (Phase 4)
  if (currentScreen === 'rotation-lab') {
    return (
      <RotationLabView
        onBack={() => {
          playClick()
          setCurrentScreen('lab-select')
        }}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        playClick={playClick}
        playOpen={playOpen}
      />
    )
  }

  // Render Gravity Lab View (Phase 2)
  if (currentScreen === 'gravity-lab') {
    return (
      <GravityLabView
        onBack={() => {
          playClick()
          setCurrentScreen('lab-select')
        }}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        playClick={playClick}
        playOpen={playOpen}
        playImpact={playImpact}
      />
    )
  }

  // Render Atmosphere Lab View (Phase 3)
  if (currentScreen === 'atmosphere-lab') {
    return (
      <AtmosphereLab
        onBack={() => {
          playClick()
          setCurrentScreen('lab-select')
        }}
        onReset={playClick}
      />
    )
  }

  // Render Experiment Selection View
  if (currentScreen === 'lab-select') {
    return (
      <div className="wb-app">
        {/* Background Starfield Canvas */}
        <Scene />
        <LabSelectionView
          onSelectGravityLab={handleSelectGravityLab}
          onSelectRotationLab={handleSelectRotationLab}
          onSelectAtmosphereLab={handleSelectAtmosphereLab}
          onBackToHome={() => {
            playClick()
            setCurrentScreen('home')
          }}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
          playClick={playClick}
        />
      </div>
    )
  }

  // Default: Orbit Home View (Phase 1 preserved)
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
    </div>
  )
}

export default App
