'use client'
import React from 'react';

export default function ClientTime({ date }) {
  if (typeof window === 'undefined') {
    // Don't render anything on the server to avoid hydration mismatch
    return null;
  }
  return <>{new Date(date).toLocaleTimeString()}</>;
} 