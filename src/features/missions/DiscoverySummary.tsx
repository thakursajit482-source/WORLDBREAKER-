import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
} from 'lucide-react'
import type { ExperimentDiscoveryData } from './types'
import {
  formatMetricWithUnit,
  validateDiscoveryData,
  calculateMetricDeviation,
} from './quizHelpers'

export interface DiscoverySummaryProps {
  discoveryData: ExperimentDiscoveryData | null | undefined
  isLoading?: boolean
  error?: string | null
  onProceedToQuiz?: () => void
  onRerunExperiment?: () => void
  onBackToIntro?: () => void
  className?: string
}

export function DiscoverySummary({
  discoveryData,
  isLoading = false,
  error = null,
  onProceedToQuiz,
  onRerunExperiment,
  onBackToIntro,
  className = '',
}: DiscoverySummaryProps) {
  // 1. Loading State
  if (isLoading) {
    return (
      <div className={`wb-summary-layout ${className}`} role="status" aria-live="polite">
        <div className="wb-state-card">
          <Loader2 className="wb-state-icon wb-state-icon-pulse" aria-hidden="true" />
          <h2 className="wb-state-title">Compiling Telemetry Packet...</h2>
          <p className="wb-state-desc">
            Processing real-time simulation metrics from the laboratory chamber. Calculating
            kinematic and optical parameters.
          </p>
        </div>
      </div>
    )
  }

  // 2. Error State
  if (error) {
    return (
      <div className={`wb-summary-layout ${className}`} role="alert">
        <div className="wb-state-card">
          <AlertTriangle className="wb-state-icon" style={{ color: '#f43f5e' }} aria-hidden="true" />
          <h2 className="wb-state-title">Telemetry Sensor Error</h2>
          <p className="wb-state-desc">{error}</p>
          <div className="wb-intro-actions">
            {onRerunExperiment && (
              <button
                type="button"
                className="wb-mission-btn wb-mission-btn-primary"
                onClick={onRerunExperiment}
                data-tv-focus="true"
                autoFocus
              >
                <RefreshCw size={16} aria-hidden="true" />
                <span>RERUN EXPERIMENT</span>
              </button>
            )}
            {onBackToIntro && (
              <button
                type="button"
                className="wb-mission-btn wb-mission-btn-secondary"
                onClick={onBackToIntro}
                data-tv-focus="true"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                <span>RETURN TO BRIEFING</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 3. Validation & Empty State
  const validation = validateDiscoveryData(discoveryData)
  if (!validation.isValid) {
    return (
      <div className={`wb-summary-layout ${className}`} role="region" aria-label="Empty Telemetry State">
        <div className="wb-state-card">
          <Activity className="wb-state-icon" style={{ color: '#fbbf24' }} aria-hidden="true" />
          <h2 className="wb-state-title">No Telemetry Recorded</h2>
          <p className="wb-state-desc">
            {validation.errorReason ||
              'No experimental telemetry was recorded. Run an active drop or modulate atmospheric density to collect live data.'}
          </p>
          <div className="wb-intro-actions">
            {onRerunExperiment && (
              <button
                type="button"
                className="wb-mission-btn wb-mission-btn-primary"
                onClick={onRerunExperiment}
                data-tv-focus="true"
                autoFocus
              >
                <RefreshCw size={16} aria-hidden="true" />
                <span>ENTER LAB & RECORD DATA</span>
              </button>
            )}
            {onBackToIntro && (
              <button
                type="button"
                className="wb-mission-btn wb-mission-btn-secondary"
                onClick={onBackToIntro}
                data-tv-focus="true"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                <span>MISSION BRIEFING</span>
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 4. Populated Discovery Summary View
  const data = discoveryData!

  return (
    <div className={`wb-summary-layout ${className}`} role="region" aria-label="Discovery Summary">
      <div className="wb-summary-card">
        {/* Header */}
        <div className="wb-summary-header">
          <div className="wb-summary-title-wrap">
            <Sparkles className="wb-kicker-icon" style={{ color: '#55ddf5' }} aria-hidden="true" />
            <h2 className="wb-summary-title">Discovery Telemetry Analysis</h2>
          </div>
          <div className="wb-intro-meta-tags">
            <span className="wb-meta-pill">{data.labName}</span>
            <span className="wb-meta-pill" style={{ color: '#55ddf5', borderColor: '#55ddf5' }}>
              DATA VERIFIED
            </span>
          </div>
        </div>

        {/* Parameters active during the test */}
        {data.parametersUsed && Object.keys(data.parametersUsed).length > 0 && (
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>
              CHAMBER PARAMETERS:
            </span>
            {Object.entries(data.parametersUsed).map(([k, v]) => (
              <span
                key={k}
                className="wb-meta-pill"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
              >
                {k}: {v}
              </span>
            ))}
          </div>
        )}

        {/* Metrics Grid */}
        <div className="wb-metrics-grid">
          {data.metrics.map((metric) => {
            const hasTheory = metric.theoreticalValue !== undefined && metric.theoreticalValue !== null
            const isNumeric =
              typeof metric.value === 'number' && typeof metric.theoreticalValue === 'number'
            const deviation =
              isNumeric && hasTheory
                ? calculateMetricDeviation(
                    metric.value as number,
                    metric.theoreticalValue as number,
                  )
                : null

            return (
              <div key={metric.id} className="wb-metric-card">
                <div className="wb-metric-top-row">
                  <span className="wb-metric-card-label">{metric.label}</span>
                  {deviation?.matches && (
                    <span
                      style={{
                        color: '#34d399',
                        fontSize: '0.68rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontFamily: 'JetBrains Mono, monospace',
                      }}
                    >
                      <CheckCircle2 size={12} aria-hidden="true" />
                      THEORY MATCH
                    </span>
                  )}
                </div>

                <div className="wb-metric-observed-val">
                  {formatMetricWithUnit(metric.value, metric.unit)}
                </div>

                {hasTheory && (
                  <div className="wb-metric-theory-row">
                    <span>Theoretical:</span>
                    <span>{formatMetricWithUnit(metric.theoreticalValue!, metric.unit)}</span>
                  </div>
                )}

                {metric.description && (
                  <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>
                    {metric.description}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Scientific Principle & Conclusion */}
        <div className="wb-summary-principle-box">
          <span className="wb-summary-principle-title">{data.scientificPrinciple}</span>
          <p className="wb-summary-principle-text">{data.conclusion}</p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="wb-intro-actions">
          {onRerunExperiment && (
            <button
              type="button"
              className="wb-mission-btn wb-mission-btn-secondary"
              onClick={onRerunExperiment}
              data-tv-focus="true"
            >
              <RefreshCw size={16} aria-hidden="true" />
              <span>RERUN TEST</span>
            </button>
          )}

          {onProceedToQuiz && (
            <button
              type="button"
              className="wb-mission-btn wb-mission-btn-primary"
              onClick={onProceedToQuiz}
              data-tv-focus="true"
              autoFocus
            >
              <span>PROCEED TO QUIZ</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
