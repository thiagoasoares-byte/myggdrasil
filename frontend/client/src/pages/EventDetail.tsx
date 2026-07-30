import { useLocation } from "wouter"
import { useEffect } from "react"

// EventDetail is handled inline in Home.tsx via the side panel.
// This route exists for deep-linking; it redirects to Home.
export default function EventDetail() {
  const [, setLocation] = useLocation()
  useEffect(() => {
    setLocation("/")
  }, [setLocation])
  return null
}
