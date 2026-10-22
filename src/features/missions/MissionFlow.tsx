import { useState, useCallback, useEffect } from 'react'
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Lock,
} from 'lucide-react'
import type {
  MissionDefinition,
  MissionFlowStep,
  ExperimentDiscoveryData,
  QuizResult,
} from './types'
import { MissionIntro } from './MissionIntro'
import { DiscoverySummary } from './DiscoverySummary'
import { MissionQuiz } from './MissionQuiz'
import { MissionCompletion } from './MissionCompletion'
import { GravityLabView } from '../gravity/GravityLabView'
import { AtmosphereLab } from '../../components/AtmosphereLab/AtmosphereLab'
import { Scene } from '../../components/Canvas3D/Scene'
import { TVRemoteGuide } from '../../components/UI/TVRemoteGuide'
import './missions.css'

export interface MissionFlowProps {
  mission: MissionDefinition
  onExitMission: () => void
  soundEnabled: boolean
  onToggleSound: () => void
  playClick: () => void
  playOpen: () => void
  playImpact: () => void
  className?: string
}

export function MissionFlow({
  mission,
  onExitMission,
  soundEnabled,
  onToggleSound,
  playClick,
  playOpen,
  playImpact,
  className = '',
}: MissionFlowProps) {
  const [step, setStep] = useState<MissionFlowStep>('intro')
  const [discoveryData, setDiscoveryData] = useState<ExperimentDiscoveryData | null>(null)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  // Transitions
  const handleLaunchLab = useCallback(() => {
    playOpen()
    setStep('lab')
  }, [playOpen])

  const handleExperimentComplete = useCallback(
    (data: ExperimentDiscoveryData) => {
      playOpen()
      setDiscoveryData(data)
      setStep('summary')
    },
    [playOpen],
  )

  const handleProceedToQuiz = useCallback(() => {
    playClick()
    setStep('quiz')
  }, [playClick])

  const handleRerunExperiment = useCallback(() => {
    playClick()
    setStep('lab')
  }, [playClick])

  const handleQuizComplete = useCallback(
    (result: QuizResult) => {
      playOpen()
      setQuizResult(result)
      setStep('completion')
    },
    [playOpen],
  )

  const handleReplayMission = useCallback(() => {
    playClick()
    setStep('intro')
    setDiscoveryData(null)
    setQuizResult(null)
  }, [playClick])

  // Step 2: Interactive Lab Screen
  if (step === 'lab') {
    if (mission.labType === 'gravity-lab') {
      return (
        <GravityLabView
          onBack={() => {
            playClick()
            setStep('intro')
          }}
          soundEnabled={soundEnabled}
          onToggleSound={onToggleSound}
          playClick={playClick}
          playOpen={playOpen}
          playImpact={playImpact}
          missionMode={true}
          onCompleteExperiment={handleExperimentComplete}
        />
      )
    }

    if (mission.labType === 'atmosphere-lab') {
      return (
        <AtmosphereLab
          onBack={() => {
            playClick()
            setStep('intro')
          }}
          missionMode={true}
          onCompleteExperiment={handleExperimentComplete}
        />
      )
    }

    // Unavailable / locked lab fallback (e.g. rotation-lab)
    return (
      <div className="wb-mission-view">
        <Scene />
        <div className="wb-vignette" aria-hidden="true" />
        <div className="wb-mission-ui-layer">
          <header className="wb-mission-header">
            <div className="wb-mission-header-left">
              <button
                type="button"
                className="wb-back-btn"
                onClick={() => setStep('intro')}
                data-tv-focus="true"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                <span>MISSION BRIEFING</span>
              </button>
              <div className="wb-badge">
                <Lock size={14} aria-hidden="true" />
                <span className="wb-badge-text">CALIBRATION IN PROGRESS</span>
              </div>
            </div>
          </header>

          <main style={{ margin: 'auto', textAlign: 'center', maxWidth: '520px' }}>
            <div className="wb-state-card">
              <Lock className="wb-state-icon" style={{ color: '#fbbf24' }} aria-hidden="true" />
              <h2 className="wb-state-title">Chamber Under Construction</h2>
              <p className="wb-state-desc">
                The {mission.title} chamber is currently scheduled for deployment in a future
                science phase. Please explore Gravity Lab or Atmosphere Lab!
              </p>
              <button
                type="button"
                className="wb-mission-btn wb-mission-btn-primary"
                onClick={() => setStep('intro')}
                data-tv-focus="true"
              >
                RETURN TO BRIEFING
              </button>
            </div>
          </main>

          <TVRemoteGuide />
        </div>
      </div>
    )
  }

  // Steps 1, 3, 4, 5 (Intro, Summary, Quiz, Completion)
  return (
    <div className={`wb-mission-view ${className}`}>
      {/* Background Starfield Scene */}
      <div className="wb-mission-bg-wrap">
        <Scene />
      </div>

      {/* Cinematic Vignette */}
      <div className="wb-vignette" aria-hidden="true" />

      {/* UI Overlay */}
      <div className="wb-mission-ui-layer">
        {/* Common Top Mission Header */}
        <header className="wb-mission-header">
          <div className="wb-mission-header-left">
            <button
              type="button"
              className="wb-back-btn"
              onClick={() => {
                playClick()
                if (step === 'intro') {
                  onExitMission()
                } else if (step === 'summary') {
                  setStep('intro')
                } else if (step === 'quiz') {
                  setStep('summary')
                } else if (step === 'completion') {
                  onExitMission()
                }
              }}
              data-tv-focus="true"
              aria-label="Back to previous screen"
            >
              <ArrowLeft className="wb-back-icon" aria-hidden="true" />
              <span>
                {step === 'intro'
                  ? 'MISSION SELECTOR'
                  : step === 'summary'
                  ? 'BRIEFING'
                  : step === 'quiz'
                  ? 'DISCOVERY'
                  : 'EXIT MISSION'}
              </span>
            </button>

            <div className="wb-badge">
              <span className="wb-badge-pulse" />
              <span className="wb-badge-text">
                MISSION OPS // {step.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="wb-mission-header-right">
            <button
              type="button"
              className="wb-icon-button"
              onClick={onToggleSound}
              aria-label={soundEnabled ? 'Mute procedural audio' : 'Enable procedural audio'}
              data-tv-focus="true"
            >
              {soundEnabled ? (
                <Volume2 className="wb-icon-btn" aria-hidden="true" />
              ) : (
                <VolumeX className="wb-icon-btn" aria-hidden="true" />
              )}
            </button>

            <button
              type="button"
              className="wb-icon-button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              data-tv-focus="true"
            >
              {isFullscreen ? (
                <Minimize className="wb-icon-btn" aria-hidden="true" />
              ) : (
                <Maximize className="wb-icon-btn" aria-hidden="true" />
              )}
            </button>
          </div>
        </header>

        {/* Content Section by Step */}
        <main style={{ margin: 'auto 0', width: '100%' }}>
          {step === 'intro' && (
            <MissionIntro
              mission={mission}
              onLaunchLab={handleLaunchLab}
              onBackToMissions={onExitMission}
            />
          )}

          {step === 'summary' && (
            <DiscoverySummary
              discoveryData={discoveryData}
              onProceedToQuiz={handleProceedToQuiz}
              onRerunExperiment={handleRerunExperiment}
              onBackToIntro={() => setStep('intro')}
            />
          )}

          {step === 'quiz' && (
            <MissionQuiz
              questions={mission.questions}
              onCompleteQuiz={handleQuizComplete}
              onExitQuiz={() => setStep('summary')}
            />
          )}

          {step === 'completion' && quizResult && (
            <MissionCompletion
              mission={mission}
              quizResult={quizResult}
              discoveryData={discoveryData}
              onReplayMission={handleReplayMission}
              onReturnToSelector={onExitMission}
            />
          )}
        </main>

        {/* TV Remote Navigation Footer */}
        <TVRemoteGuide />
      </div>
    </div>
  )
}
