import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

// NOTE:
// Browsers cannot list filesystem folders/assets. This page shows all images that are already
// referenced in the repo (via import lists / known paths). If you want a true directory scan,
// you must add a backend route to read assets folder contents.

const KNOWN_IMAGE_URLS = [
  // These are the image filenames currently referenced across the app/homepage.
  '/assets/untitled design.jpg',
  '/assets/Screenshot 2026-06-16 130637.png',
  '/assets/Screenshot 2026-06-16 131016.png',
  '/assets/IMG-20260616-WA0037.jpg',
  '/assets/IMG-20260616-WA0038.jpg',
  '/assets/IMG-20260628-WA0001.jpg',
  '/assets/IMG-20260616-WA0051.jpg',

  // Course images (from coursesData.js)
  '/assets/Gemini_Generated_Image_exv5gwexv5gwexv5.png',
  '/assets/Gemini_Generated_Image_lu6gizlu6gizlu6g.png',
  '/assets/f3ca92ae-1a4e-4d16-8a8e-a9a5b47dd196.jpg',
  '/assets/Gemini_Generated_Image_sy80b6sy80b6sy80.png',
  '/assets/Gemini_Generated_Image_u91l8ru91l8ru91l.png',
  '/assets/Gemini_Generated_Image_lu6gizlu6gizlu6g.png',
  '/assets/Gemini_Generated_Image_lu6gizlu6gizlu6g.png',
]

function toUnique(arr) {
  return Array.from(new Set(arr))
}

export default function AllImagesPage() {
  const [broken, setBroken] = useState(0)

  const images = useMemo(() => toUnique(KNOWN_IMAGE_URLS), [])

  useEffect(() => {
    document.title = 'All Images'
  }, [])

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <section className="detail-hero" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '2.4rem', marginBottom: 8 }}>All Images (Referenced Assets)</h1>
        <p className="section-subtitle">
          This list is limited to image URLs already referenced by the frontend/app. For a complete listing
          of every file inside <code>/assets</code>, add a backend endpoint that reads the folder and returns
          filenames.
        </p>
      </section>

      <div style={{ marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <Link to="/" className="btn secondary">Back to Home</Link>
        <span style={{ color: 'var(--text-muted)' }}>Broken images detected: {broken}</span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
        {images.map((src) => (
          <div
            key={src}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 12,
              overflow: 'hidden',
              background: 'var(--card-bg)',
            }}
          >
            <div
              style={{
                height: 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0,0,0,0.03)',
              }}
            >
              <img
                src={src}
                alt={src}
                loading="lazy"
                onError={() => setBroken((x) => x + 1)}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
            <div style={{ padding: 12 }}>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-muted)',
                  wordBreak: 'break-word',
                  lineHeight: 1.4,
                }}
              >
                {src}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

