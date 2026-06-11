'use client'
import { useEffect } from 'react'

export default function ReadyToGoPage() {
  useEffect(() => {
    window.location.replace('/ready-to-go.html')
  }, [])
  return (
    <div style={{background:'#0a0a0a', minHeight:'100vh'}} />
  )
}
