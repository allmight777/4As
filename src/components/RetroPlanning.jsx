import { useEffect, useMemo, useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import RevealHeading from './RevealHeading'
import HeartIcon from './icons/HeartIcon'
import { generateTimeline, formatDate, daysUntil, defaultWeddingDate } from '../planning/planningModel'
import './RetroPlanning.css'

const STORAGE_KEY = 'ever-after-retroplanning-checked'

function loadChecked() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveChecked(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    // stockage indisponible (navigation privée, quota...) : on continue sans persister
  }
}

export default function RetroPlanning() {
  const revealRef = useReveal()
  const gridRef = useReveal()

  const [weddingDate, setWeddingDate] = useState(defaultWeddingDate)
  const [checked, setChecked] = useState(() => loadChecked())

  useEffect(() => {
    saveChecked(checked)
  }, [checked])

  const timeline = useMemo(() => generateTimeline(weddingDate), [weddingDate])
  const remainingDays = weddingDate ? daysUntil(weddingDate) : null
  const isPastDate = remainingDays !== null && remainingDays < 0

  const doneCount = timeline.filter((task) => checked.has(task.id)).length
  const progress = timeline.length > 0 ? Math.round((doneCount / timeline.length) * 100) : 0

  function toggleTask(id) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section id="planning" className="section section--ivory-dim planning">
      <div className="container">
        <div className="section-head reveal" ref={revealRef}>
          <span className="eyebrow">
            <HeartIcon className="planning__eyebrow-heart" />
            Rétroplanning automatique
          </span>
          <RevealHeading text="Votre checklist, générée à partir de votre date" />
          <p>
            Indiquez la date de votre mariage : nous répartissons chaque étape clé dans le temps,
            du premier rendez-vous salle jusqu&apos;au jour J.
          </p>
        </div>

        <div className="planning__date-picker">
          <label className="planning__date-field">
            <span>Date du mariage</span>
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
            />
          </label>

          {weddingDate && !isPastDate ? (
            <p className="planning__countdown">
              <strong>{remainingDays}</strong> jour{remainingDays > 1 ? 's' : ''} avant le grand jour
            </p>
          ) : null}

          {isPastDate ? (
            <p className="planning__warning" role="alert">
              Cette date est déjà passée — choisissez une date future pour un rétroplanning utile.
            </p>
          ) : null}
        </div>

        {timeline.length > 0 ? (
          <>
            <div className="planning__progress" aria-hidden="true">
              <div className="planning__progress-track">
                <div className="planning__progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="planning__progress-label">
                {doneCount} / {timeline.length} étapes faites ({progress}%)
              </span>
            </div>

            <ol className="planning__timeline reveal-group" ref={gridRef}>
              {timeline.map((task) => {
                const isChecked = checked.has(task.id)
                return (
                  <li
                    key={task.id}
                    className={`planning__item ${isChecked ? 'is-done' : ''} ${
                      !isChecked && task.isPast ? 'is-overdue' : ''
                    } ${task.isDday ? 'is-dday' : ''}`}
                  >
                    <button
                      type="button"
                      className="planning__checkbox"
                      role="checkbox"
                      aria-checked={isChecked}
                      aria-label={`Marquer « ${task.label} » comme ${isChecked ? 'à refaire' : 'terminée'}`}
                      onClick={() => toggleTask(task.id)}
                    >
                      {isChecked ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12.5 10 17.5 19 7"
                          />
                        </svg>
                      ) : null}
                    </button>

                    <div className="planning__item-body">
                      <div className="planning__item-head">
                        <span className="planning__item-delay">
                          {task.isDday ? <HeartIcon className="planning__dday-heart" /> : null}
                          {task.delayLabel}
                        </span>
                        <span className="planning__item-date">{formatDate(task.dueDate)}</span>
                      </div>
                      <p className="planning__item-label">{task.label}</p>
                      <p className="planning__item-text">{task.text}</p>
                      {!isChecked && task.isPast && !task.isDday ? (
                        <span className="planning__item-overdue-tag">En retard</span>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ol>
          </>
        ) : (
          <p className="planning__empty">Sélectionnez une date pour générer votre rétroplanning.</p>
        )}
      </div>
    </section>
  )
}