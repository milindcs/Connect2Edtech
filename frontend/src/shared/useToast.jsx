import React, { useCallback, useRef, useState } from 'react'

// Lightweight toast hook. Returns a `showToast` function and a `ToastContainer`
// element that should be rendered once per page.
export function useToast() {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const showToast = useCallback((message, type = 'success') => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const ToastContainer = (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast show ${t.type}`}>
          {t.message}
        </div>
      ))}
    </div>
  )

  return { showToast, ToastContainer }
}
