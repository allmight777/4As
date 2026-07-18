import { forwardRef } from 'react'
import './InvitationCardPreview.css'

export const CARD_WIDTH = 420
export const CARD_HEIGHT = 595

function CherryBloom({ transform, scale = 1 }) {
  return (
    <g transform={transform}>
      <g transform={`scale(${scale})`}>
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse key={angle} cx="0" cy="-7" rx="3.6" ry="6" transform={`rotate(${angle})`} fill="var(--rose)" opacity="0.85" />
        ))}
        <circle r="2" fill="var(--gold)" />
      </g>
    </g>
  )
}

function MonogramCard({ brideName, groomName, weddingDate, message, photoDataUrl }) {
  const initials = `${(brideName || 'B')[0]}${(groomName || 'G')[0]}`.toUpperCase()
  return (
    <div className="invitation-card invitation-card--monogram">
      <svg className="invitation-card__wreath" viewBox="0 0 260 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" fill="none">
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
      <svg className="invitation-card__wave invitation-card__wave--tl" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,0 L0,110 C40,90 60,50 40,0 Z" fill="var(--ink)" />
        <g stroke="var(--gold)" strokeWidth="1" fill="none" opacity="0.9">
          <path d="M14,18 q10,-10 20,0 q-10,10 -20,0 Z" />
          <path d="M18,40 q8,-8 16,0 q-8,8 -16,0 Z" />
        </g>
      </svg>
      <svg className="invitation-card__wave invitation-card__wave--br" viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M160,160 L160,50 C120,70 100,110 120,160 Z" fill="var(--ink)" />
        <g stroke="var(--gold)" strokeWidth="1" fill="none" opacity="0.9">
          <path d="M136,132 q10,-10 20,0 q-10,10 -20,0 Z" />
          <path d="M128,110 q8,-8 16,0 q-8,8 -16,0 Z" />
        </g>
      </svg>
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
        <svg className="invitation-card__blossoms invitation-card__blossoms--tl" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <g stroke="var(--gold)" strokeWidth="0.8" fill="none">
            <path d="M4,30 C20,20 30,10 26,-2" />
          </g>
          <CherryBloom transform="translate(22, 18)" scale={1.1} />
          <CherryBloom transform="translate(10, 34)" scale={0.75} />
        </svg>
        <svg className="invitation-card__blossoms invitation-card__blossoms--br" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <g stroke="var(--gold)" strokeWidth="0.8" fill="none">
            <path d="M96,70 C80,80 70,90 74,102" />
          </g>
          <CherryBloom transform="translate(78, 82)" scale={1.1} />
          <CherryBloom transform="translate(90, 66)" scale={0.75} />
        </svg>

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
