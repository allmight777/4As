import { useMemo, useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import RevealHeading from './RevealHeading'
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

export default function BudgetSimulator() {
  const revealRef = useReveal()
  const [guests, setGuests] = useState(90)
  const [style, setStyle] = useState('classique')
  const [niveau, setNiveau] = useState('confort')
  const [region, setRegion] = useState('cotonou')

  const [aiStatus, setAiStatus] = useState('idle') // idle | loading | success | error
  const [aiAdvice, setAiAdvice] = useState('')
  const [aiError, setAiError] = useState('')

  const { breakdown, total } = useMemo(
    () => calculateBudget({ guests, style, niveau, region }),
    [guests, style, niveau, region],
  )

  const categories = Object.keys(breakdown)

  async function requestAdvice() {
    setAiStatus('loading')
    setAiError('')
    try {
      const response = await fetch('/.netlify/functions/ai-budget-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guests,
          style: STYLES.find((s) => s.id === style)?.label,
          niveau: NIVEAUX.find((n) => n.id === niveau)?.label,
          region: REGIONS.find((r) => r.id === region)?.label,
          total,
          breakdown: Object.fromEntries(
            categories.map((key) => [CATEGORY_LABELS[key], breakdown[key]]),
          ),
        }),
      })

      if (!response.ok) {
        throw new Error(`Réponse serveur invalide (${response.status})`)
      }

      const data = await response.json()
      if (!data.advice) throw new Error('Réponse vide de l’assistante')

      setAiAdvice(data.advice)
      setAiStatus('success')
    } catch (err) {
      setAiError(
        err instanceof Error
          ? err.message
          : "Une erreur inattendue est survenue.",
      )
      setAiStatus('error')
    }
  }

  return (
    <section id="budget" className="section section--ivory budget">
      <div className="container">
        <div className="section-head reveal" ref={revealRef}>
          <span className="eyebrow">Simulateur intelligent</span>
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
            <div className="budget__total">
              <span>Estimation totale</span>
              <strong>{formatFCFA(total)}</strong>
            </div>

            <div className="budget__bar" role="img" aria-label="Répartition du budget par poste">
              {categories.map((key) => (
                <span
                  key={key}
                  className="budget__bar-segment"
                  style={{
                    width: `${(breakdown[key] / total) * 100}%`,
                    background: CATEGORY_COLORS[key],
                  }}
                />
              ))}
            </div>

            <ul className="budget__legend">
              {categories.map((key) => (
                <li key={key}>
                  <span className="budget__legend-dot" style={{ background: CATEGORY_COLORS[key] }} />
                  <span className="budget__legend-label">{CATEGORY_LABELS[key]}</span>
                  <span className="budget__legend-value">{formatFCFA(breakdown[key])}</span>
                </li>
              ))}
            </ul>

            <div className="budget__ai">
              <button
                type="button"
                className="btn btn-primary"
                onClick={requestAdvice}
                disabled={aiStatus === 'loading'}
              >
                {aiStatus === 'loading' ? 'Notre assistante réfléchit…' : 'Demander conseil à notre assistante'}
              </button>

              {aiStatus === 'loading' ? (
                <div className="budget__skeleton" aria-live="polite">
                  <span />
                  <span />
                  <span />
                </div>
              ) : null}

              {aiStatus === 'error' ? (
                <p className="budget__ai-error" role="alert">
                  {aiError || 'Le conseil personnalisé est momentanément indisponible.'} Vous pouvez
                  réessayer, ou nous contacter directement.
                </p>
              ) : null}

              {aiStatus === 'success' ? (
                <div className="budget__ai-response" aria-live="polite">
                  <p>{aiAdvice}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
