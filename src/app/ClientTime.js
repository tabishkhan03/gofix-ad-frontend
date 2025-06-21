"use client"
import { useEffect, useState } from "react"

export default function ClientTime({ date }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span className="text-gray-500">--:--</span>
  }

  return (
    <span className="text-gray-600">
      {date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })}
    </span>
  )
}
