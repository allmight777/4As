import { useEffect, useMemo, useState } from 'react'
import { useReveal } from '../hooks/useReveal'
import RevealHeading from './RevealHeading'
import HeartIcon from './icons/HeartIcon'
import ChevronIcon from './icons/ChevronIcon'
import { generateTimeline, formatDate, daysUntil, defaultWeddingDate } from '../planning/planningModel'
import './RetroPlanning.css'

const STORAGE_KEY = 'ever-after-retroplanning-checked'
// Nombre d'étapes visibles avant d'avoir à cliquer sur "Voir plus"
const VISIBLE_COUNT = 6
// Chemin centralisé : ne changer que cette constante pour remplacer l'illustration.
const CHECKLIST_ILLUSTRATION_SRC = '/images/simulation_even.jpg'

const INK = [28, 27, 41]
const GOLD = [184, 147, 95]
const IVORY = [247, 243, 236]
const TEXT_DIM = [107, 101, 119]

function drawMiniHeart(doc, cx, cy, r, color) {
  doc.setFillColor(...color)
  doc.circle(cx - r * 0.5, cy, r * 0.62, 'F')
  doc.circle(cx + r * 0.5, cy, r * 0.62, 'F')
  doc.triangle(cx - r * 1.05, cy + r * 0.18, cx + r * 1.05, cy + r * 0.18, cx, cy + r * 1.65, 'F')
}

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
  // Pli/dépli du CONTENU d'une étape (titre visible, description cachée)
  const [expanded, setExpanded] = useState(() => new Set())
  // Pli/dépli de la LISTE ENTIÈRE (seules les VISIBLE_COUNT premières étapes
  // sont montrées par défaut, le reste est révélé par le bouton "Voir plus")
  const [showAll, setShowAll] = useState(false)
  const [pdfStatus, setPdfStatus] = useState('idle') // idle | working | error

  useEffect(() => {
    saveChecked(checked)
  }, [checked])

  const timeline = useMemo(() => generateTimeline(weddingDate), [weddingDate])
  const remainingDays = weddingDate ? daysUntil(weddingDate) : null
  const isPastDate = remainingDays !== null && remainingDays < 0

  const doneCount = timeline.filter((task) => checked.has(task.id)).length
  const progress = timeline.length > 0 ? Math.round((doneCount / timeline.length) * 100) : 0

  const visibleTimeline = timeline.slice(0, VISIBLE_COUNT)
  const hiddenTimeline = timeline.slice(VISIBLE_COUNT)

  // On réduit automatiquement la liste si la date change (nouvelle génération)
  useEffect(() => {
    setShowAll(false)
  }, [weddingDate])

  function toggleTask(id) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleExpand(id) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleDownloadPdf() {
    if (pdfStatus === 'working' || timeline.length === 0) return
    setPdfStatus('working')
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({ unit: 'pt', format: 'a4' })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const marginX = 48

      function drawHeader() {
        doc.setFillColor(...INK)
        doc.rect(0, 0, pageWidth, 96, 'F')
        drawMiniHeart(doc, pageWidth - 70, 30, 9, GOLD)
        drawMiniHeart(doc, pageWidth - 100, 55, 6, GOLD)
        doc.setTextColor(...IVORY)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(20)
        doc.text('Ever After Events', marginX, 42)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(12)
        doc.setTextColor(...GOLD)
        doc.text(`Votre checklist de mariage — ${formatDate(new Date(`${weddingDate}T00:00:00`))}`, marginX, 66)
        return 130
      }

      function drawFooter() {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(9)
        doc.setTextColor(...TEXT_DIM)
        doc.text('Ever After Events — Cotonou, Bénin', pageWidth / 2, pageHeight - 28, { align: 'center' })
      }

      let y = drawHeader()
      const rowHeight = 40

      timeline.forEach((task) => {
        if (y > pageHeight - 60) {
          drawFooter()
          doc.addPage()
          y = drawHeader()
        }

        doc.setDrawColor(...GOLD)
        doc.setLineWidth(1)
        doc.rect(marginX, y - 11, 13, 13)

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11.5)
        doc.setTextColor(...INK)
        doc.text(task.label, marginX + 24, y)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9)
        doc.setTextColor(...TEXT_DIM)
        doc.text(`${task.delayLabel} · ${formatDate(task.dueDate)}`, marginX + 24, y + 14)

        doc.setDrawColor(224, 214, 197)
        doc.setLineWidth(0.5)
        doc.line(marginX, y + 24, pageWidth - marginX, y + 24)

        y += rowHeight
      })

      drawFooter()
      doc.save('checklist-mariage-ever-after-events.pdf')
      setPdfStatus('idle')
    } catch (err) {
      console.error('Échec de la génération du PDF de la checklist :', err)
      setPdfStatus('error')
    }
  }

  function renderTask(task) {
    const isChecked = checked.has(task.id)
    const isExpanded = expanded.has(task.id)
    const detailsId = `planning-details-${task.id}`

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
          <button
            type="button"
            className="planning__item-toggle"
            aria-expanded={isExpanded}
            aria-controls={detailsId}
            onClick={() => toggleExpand(task.id)}
          >
            <span className="planning__item-toggle-content">
              <span className="planning__item-head">
                <span className="planning__item-delay">
                  {task.isDday ? <HeartIcon className="planning__dday-heart" /> : null}
                  {task.delayLabel}
                </span>
                <span className="planning__item-date">{formatDate(task.dueDate)}</span>
              </span>
              <span className="planning__item-label">{task.label}</span>
            </span>
            <ChevronIcon className={`planning__item-chevron ${isExpanded ? 'is-expanded' : ''}`} />
          </button>

          <div id={detailsId} className={`planning__item-details ${isExpanded ? 'is-expanded' : ''}`}>
            <div className="planning__item-details-inner">
              <p className="planning__item-text">{task.text}</p>
              {!isChecked && task.isPast && !task.isDday ? (
                <span className="planning__item-overdue-tag">En retard</span>
              ) : null}
            </div>
          </div>
        </div>
      </li>
    )
  }

  return (
    <section id="planning" className="section section--ink planning">
      <div className="container">
        <div className="section-head planning__head reveal" ref={revealRef}>
          <div className="planning__head-text">
            <span className="eyebrow">
              <HeartIcon className="planning__eyebrow-heart" />
              Rétroplanning automatique
            </span>
            <RevealHeading text="Votre checklist, générée à partir de votre date" />
            <p>
              Indiquez la date de votre mariage : nous répartissons chaque étape clé dans le temps,
              du premier rendez-vous salle jusqu&apos;au jour J. Cliquez sur une étape pour voir le détail.
            </p>
          </div>
          <img
            className="planning__head-image"
            src={CHECKLIST_ILLUSTRATION_SRC}
            alt=""
            loading="lazy"
            decoding="async"
          />
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
              {visibleTimeline.map(renderTask)}

              {hiddenTimeline.length > 0 ? (
                <li className="planning__more-wrapper">
                  <div className={`planning__more ${showAll ? 'is-expanded' : ''}`}>
                    <div className="planning__more-inner">
                      <ol className="planning__timeline planning__timeline--nested">
                        {hiddenTimeline.map(renderTask)}
                      </ol>
                    </div>
                  </div>
                </li>
              ) : null}
            </ol>

            <div className="planning__actions">
              {hiddenTimeline.length > 0 ? (
                <button
                  type="button"
                  className="planning__toggle-all"
                  onClick={() => setShowAll((v) => !v)}
                  aria-expanded={showAll}
                >
                  <ChevronIcon className={`planning__toggle-all-icon ${showAll ? 'is-expanded' : ''}`} />
                  {showAll ? 'Réduire la liste' : `Voir les ${hiddenTimeline.length} étapes suivantes`}
                </button>
              ) : null}

              <button
                type="button"
                className="planning__download-btn"
                onClick={handleDownloadPdf}
                disabled={pdfStatus === 'working'}
              >
                {pdfStatus === 'working' ? 'Génération du PDF…' : 'Télécharger'}
              </button>
            </div>

            {pdfStatus === 'error' ? (
              <p className="planning__warning" role="alert">
                Le PDF n&apos;a pas pu être généré. Merci de réessayer.
              </p>
            ) : null}
          </>
        ) : (
          <p className="planning__empty">Sélectionnez une date pour générer votre rétroplanning.</p>
        )}
      </div>
    </section>
  )
}