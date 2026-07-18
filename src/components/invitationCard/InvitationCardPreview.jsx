import { forwardRef } from 'react'
import './InvitationCardPreview.css'

export const CARD_WIDTH = 420
export const CARD_HEIGHT = 595

// Plain CSS petals (no SVG): the SVG version of this corner accent — sized
// via viewBox and positioned via a bottom/right corner box — was the one
// decoration html2canvas (used for the PDF export) rendered unreliably
// (dropped one corner outright). A handful of rotated, absolutely-positioned
// divs is a far simpler shape for html2canvas to rasterize correctly.
function CherryBlossom({ className = '' }) {
  return (
    <span className={`invitation-card__blossom ${className}`}>
      <span className="invitation-card__blossom-petal invitation-card__blossom-petal--1" />
      <span className="invitation-card__blossom-petal invitation-card__blossom-petal--2" />
      <span className="invitation-card__blossom-petal invitation-card__blossom-petal--3" />
      <span className="invitation-card__blossom-petal invitation-card__blossom-petal--4" />
      <span className="invitation-card__blossom-dot" />
    </span>
  )
}

function MonogramCard({ brideName, groomName, weddingDate, message, photoDataUrl }) {
  const initials = `${(brideName || 'B')[0]}${(groomName || 'G')[0]}`.toUpperCase()
  return (
    <div className="invitation-card invitation-card--monogram">
      <svg
        className="invitation-card__wreath"
        viewBox="0 0 260 120"
        width="328"
        height="151"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="#b8935f" strokeWidth="1.2" strokeLinecap="round" fill="none">
          <path d="M20,90 C40,30 100,4 130,4 C160,4 220,30 240,90" />
          {[30, 55, 80, 105, 130, 155, 180, 205, 230].map((x, i) => (
            <path
              key={x}
              d={`M${x},${90 - Math.sin((i / 8) * Math.PI) * 78} q6,-10 12,-2`}
              transform={`rotate(${i < 4 ? -20 : 20} ${x} ${90 - Math.sin((i / 8) * Math.PI) * 78})`}
            />
          ))}
        </g>
      </svg>
      {photoDataUrl && (
        <div className="invitation-card__photo invitation-card__photo--round">
          <img src={photoDataUrl} alt="" />
        </div>
      )}
      <span className="invitation-card__eyebrow">Le mariage de</span>
      <div className="invitation-card__monogram">{initials}</div>
      <h2 className="invitation-card__names">
        {brideName || 'La mariée'} <span>&amp;</span> {groomName || 'Le marié'}
      </h2>
      {weddingDate && <p className="invitation-card__date">{weddingDate}</p>}
      {message && <p className="invitation-card__message">{message}</p>}
    </div>
  )
}

function NoirOrCard({ brideName, groomName, weddingDate, message, photoDataUrl }) {
  return (
    <div className="invitation-card invitation-card--noir-or">
      <div className="invitation-card__wave-corner invitation-card__wave-corner--tl">
        <svg
          className="invitation-card__wave-accent"
          viewBox="0 0 40 40"
          width="40"
          height="40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke="#b8935f" strokeWidth="1" fill="none" opacity="0.9">
            <path d="M14,18 q10,-10 20,0 q-10,10 -20,0 Z" />
            <path d="M18,32 q8,-8 16,0 q-8,8 -16,0 Z" />
          </g>
        </svg>
      </div>
      <div className="invitation-card__wave-corner invitation-card__wave-corner--br">
        <svg
          className="invitation-card__wave-accent"
          viewBox="0 0 40 40"
          width="40"
          height="40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g stroke="#b8935f" strokeWidth="1" fill="none" opacity="0.9">
            <path d="M6,22 q10,-10 20,0 q-10,10 -20,0 Z" />
            <path d="M2,8 q8,-8 16,0 q-8,8 -16,0 Z" />
          </g>
        </svg>
      </div>
      <div className="invitation-card__photo invitation-card__photo--square">
        {photoDataUrl ? (
          <img src={photoDataUrl} alt="" />
        ) : (
          <span className="invitation-card__photo-placeholder">
            {(brideName || 'B')[0]}
            {(groomName || 'G')[0]}
          </span>
        )}
      </div>
      <h2 className="invitation-card__names invitation-card__names--gold">
        {brideName || 'La mariée'} &amp; {groomName || 'Le marié'}
      </h2>
      {weddingDate && <p className="invitation-card__date invitation-card__date--noir-or">{weddingDate}</p>}
      {message && <p className="invitation-card__message">{message}</p>}
    </div>
  )
}

function CherryCard({ brideName, groomName, weddingDate, message, photoDataUrl }) {
  return (
    <div className="invitation-card invitation-card--cherry">
      <div className="invitation-card__frame">
        <div className="invitation-card__blossoms invitation-card__blossoms--tl">
          <CherryBlossom className="invitation-card__blossom--large" />
          <CherryBlossom className="invitation-card__blossom--small" />
        </div>
        <div className="invitation-card__blossoms invitation-card__blossoms--br">
          <CherryBlossom className="invitation-card__blossom--large" />
          <CherryBlossom className="invitation-card__blossom--small" />
        </div>

        {photoDataUrl && (
          <div className="invitation-card__photo invitation-card__photo--round invitation-card__photo--cherry">
            <img src={photoDataUrl} alt="" />
          </div>
        )}
        <span className="invitation-card__eyebrow invitation-card__eyebrow--cherry">Ensemble pour toujours</span>
        <h2 className="invitation-card__names invitation-card__names--cherry">
          {brideName || 'La mariée'}
          <span>&amp;</span>
          {groomName || 'Le marié'}
        </h2>
        {weddingDate && <p className="invitation-card__date">{weddingDate}</p>}
        {message && <p className="invitation-card__message">{message}</p>}
      </div>
    </div>
  )
}

export const CARD_TEMPLATES = [
  { id: 'monogram', label: 'Monogramme végétal', Component: MonogramCard },
  { id: 'noirOr', label: 'Noir & or floral', Component: NoirOrCard },
  { id: 'cherry', label: 'Fleurs de cerisier', Component: CherryCard },
]

const InvitationCardPreview = forwardRef(function InvitationCardPreview({ template, ...data }, ref) {
  const entry = CARD_TEMPLATES.find((t) => t.id === template) || CARD_TEMPLATES[0]
  const Card = entry.Component
  return (
    <div ref={ref} className="invitation-card-canvas" style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}>
      <Card {...data} />
    </div>
  )
})

export default InvitationCardPreview
