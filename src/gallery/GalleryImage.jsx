import { useEffect, useState } from 'react'
import HeartIcon from '../components/icons/HeartIcon'
import './GalleryImage.css'

// Durée minimale d'affichage du cœur de chargement : en local ou avec un bon
// réseau, les images arrivent parfois en quelques ms, ce qui rend l'animation
// invisible. On force un minimum pour qu'elle soit toujours perceptible.
const MIN_LOADING_MS = 550

export default function GalleryImage({ src, alt, className = '' }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [minDelayDone, setMinDelayDone] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMinDelayDone(true), MIN_LOADING_MS)
    return () => clearTimeout(timer)
  }, [])

  const ready = imgLoaded && minDelayDone

  return (
    <>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setImgLoaded(true)}
        className={`${className} ${ready ? 'is-loaded' : ''}`.trim()}
      />
      {!ready ? (
        <span className="gallery-loading" aria-hidden="true">
          <HeartIcon className="gallery-loading__heart" />
        </span>
      ) : null}
    </>
  )
}