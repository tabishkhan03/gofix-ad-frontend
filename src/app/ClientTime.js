'use client'
import React, { useEffect, useState } from 'react';

export default function ClientTime({ date }) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    // Render a placeholder or nothing on the server
    return <span className="text-gray-400">--:--:--</span>;
  }

  return <>{new Date(date).toLocaleTimeString()}</>;
} 