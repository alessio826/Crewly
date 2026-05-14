import { useState, useCallback } from "react"

export function useToast() {
  const [toasts, setToasts] = useState([])
  const toast = useCallback(() => {
    return { id: Math.random().toString(), dismiss: () => {} }
  }, [])

  return {
    toast,
    toasts,
    dismiss: useCallback(() => {}, []),
  }
}
