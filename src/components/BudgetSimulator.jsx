import { useMemo, useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import RevealHeading from './RevealHeading'
import HeartIcon from './icons/HeartIcon'
import { askAssistant } from '../assistant/assistantBus'
import {
  STYLES,
  NIVEAUX,
  REGIONS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  calculateBudget,
  formatFCFA,
} from '../budget/budgetModel'
import './BudgetSimulator.css'

const DONUT_RADIUS = 80
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS

export default function BudgetSimulator() {
  const revealRef = useReveal()
  const [guests, setGuests] = useState(90)
  const [style, setStyle] = useState('classique')
  const [niveau, setNiveau] = useState('confort')
  const [region, setRegion] = useState('cotonou')

  const { breakdown, total } = useMemo(
    () => calculateBudget({ guests, style, niveau, region }),
    [guests, style, niveau, region],
  )

  const categories = Object.keys(breakdown)

  // Précalcule les segments du donut (longueur d'arc + décalage cumulé)
  const donutSegments = useMemo(() => {
    let cumulative = 0
    return categories.map((key) => {
      const value = breakdown[key]
      const ratio = total > 0 ? value / total : 0
      const dash = ratio * DONUT_CIRCUMFERENCE
      const offset = cumulative
      cumulative += dash
      return { key, dash, offset, ratio }
    })
  }, [categories, breakdown, total])

  // Routed through the same floating chat as every other AI interaction —
  // one endpoint/one UI to maintain instead of a second, separate inline
  // implementation with its own loading/error states to keep in sync.
  function requestAdvice() {
    const styleLabel = STYLES.find((s) => s.id === style)?.label
    const niveauLabel = NIVEAUX.find((n) => n.id === niveau)?.label
    const regionLabel = REGIONS.find((r) => r.id === region)?.label
    const breakdownLines = categories
      .map((key) => `${CATEGORY_LABELS[key]} : ${formatFCFA(breakdown[key])}`)
      .join(', ')

    askAssistant(
      `J'utilise le simulateur de budget avec ${guests} invités, un style ${styleLabel}, ` +
        `un niveau de prestation ${niveauLabel}, dans la région de ${regionLabel}. ` +
        `Le budget total estimé est de ${formatFCFA(total)} (répartition : ${breakdownLines}). ` +
        `Que penses-tu de cette estimation, et as-tu des conseils pour l'optimiser ?`,
    )
  }

  return (
    <section id="budget" className="section section--ivory budget">
      <div className="container">
        <div className="section-head reveal" ref={revealRef}>
          <span className="eyebrow">
            <HeartIcon className="budget__eyebrow-heart" />
            Simulateur intelligent
          </span>
          <RevealHeading text="Estimez votre budget en un instant" />
          <p>
            Ajustez les curseurs selon votre vision du jour J : nous décomposons aussitôt une
            estimation réaliste, puis notre assistante peut vous conseiller pour l&apos;optimiser.
          </p>
        </div>

        <div className="budget__panel">
          <div className="budget__controls">
            <label className="budget__field">
              <span className="budget__field-label">
                Nombre d&apos;invités <strong>{guests}</strong>
              </span>
              <input
                type="range"
                min={20}
                max={300}
                step={5}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              />
            </label>

            <fieldset className="budget__field">
              <legend className="budget__field-label">Style de mariage</legend>
              <div className="budget__choices">
                {STYLES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`budget__chip ${style === item.id ? 'is-active' : ''}`}
                    onClick={() => setStyle(item.id)}
                    aria-pressed={style === item.id}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="budget__field">
              <legend className="budget__field-label">Niveau de prestation</legend>
              <div className="budget__choices">
                {NIVEAUX.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`budget__chip ${niveau === item.id ? 'is-active' : ''}`}
                    onClick={() => setNiveau(item.id)}
                    aria-pressed={niveau === item.id}
                    title={item.text}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="budget__field">
              <span className="budget__field-label">Lieu (approximatif)</span>
              <select value={region} onChange={(e) => setRegion(e.target.value)}>
                {REGIONS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="budget__result">
            <div className="budget__result-top">
              <div className="budget__chart" role="img" aria-label="Répartition du budget par poste">
                <svg viewBox="0 0 200 200" className="budget__donut">
                  <circle className="budget__donut-track" cx="100" cy="100" r={DONUT_RADIUS} />
                  {donutSegments.map((seg) => (
                    <circle
                      key={seg.key}
                      className="budget__donut-segment"
                      cx="100"
                      cy="100"
                      r={DONUT_RADIUS}
                      stroke={CATEGORY_COLORS[seg.key]}
                      strokeDasharray={`${seg.dash} ${DONUT_CIRCUMFERENCE - seg.dash}`}
                      strokeDashoffset={-seg.offset}
                    />
                  ))}
                </svg>
                <div className="budget__donut-center">
                  <HeartIcon className="budget__donut-heart" />
                  <strong>{formatFCFA(total)}</strong>
                  <span>Total</span>
                </div>
              </div>

              <ul className="budget__legend">
                {categories.map((key) => (
                  <li key={key}>
                    <span className="budget__legend-dot" style={{ background: CATEGORY_COLORS[key] }} />
                    <span className="budget__legend-label">{CATEGORY_LABELS[key]}</span>
                    <span className="budget__legend-percent">
                      {total > 0 ? Math.round((breakdown[key] / total) * 100) : 0}%
                    </span>
                    <span className="budget__legend-value">{formatFCFA(breakdown[key])}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="budget__ai">
              <button type="button" className="budget__ai-btn" onClick={requestAdvice}>
                <HeartIcon className="budget__ai-btn-heart" />
                Demander conseil à notre assistante
              </button>
              <p className="budget__ai-hint">Ouvre le chat avec votre estimation déjà transmise.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}