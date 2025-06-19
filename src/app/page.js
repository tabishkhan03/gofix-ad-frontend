'use client'
import React, { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatCard({ title, value, icon }) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1rem',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(99, 102, 241, 0.1)',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
        borderRadius: '0.75rem',
        padding: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div>
        <h3 style={{
          fontSize: '0.875rem',
          color: '#6B7280',
          marginBottom: '0.25rem'
        }}>{title}</h3>
        <p style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#111827',
          margin: 0
        }}>{value}</p>
      </div>
    </div>
  );
}

function MessageCard({ message }) {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '1.2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      padding: '1.75rem',
      height: '100%',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(99, 102, 241, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      ':hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
      }
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '1.1rem', 
            color: '#4F46E5',
            marginBottom: '0.5rem' 
          }}>
            From: <span style={{ color: '#6366F1' }}>{message.senderUsername}</span>
          </div>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '1.1rem', 
            color: '#4F46E5' 
          }}>
            To: <span style={{ color: '#6366F1' }}>{message.recipientUsername}</span>
          </div>
        </div>
        <div style={{ 
          fontSize: '0.875rem', 
          color: '#6B7280',
          textAlign: 'right'
        }}>
          {formatDate(message.createdAt)}
        </div>
      </div>

      <div style={{ 
        fontSize: '1.05rem', 
        color: '#1F2937', 
        background: '#F9FAFB',
        borderRadius: '0.8rem', 
        padding: '1rem',
        marginBottom: '1.25rem',
        lineHeight: '1.5',
        flex: 1
      }}>
        {message.content}
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        gap: '1rem',
        marginTop: 'auto'
      }}>
        <a
          href={message.adData.adLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '0.8rem',
            padding: '0.875rem 1.5rem',
            fontWeight: 600,
            fontSize: '0.95rem',
            textAlign: 'center',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
            transition: 'all 0.2s ease',
            ':hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 16px rgba(99, 102, 241, 0.3)',
            }
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ marginRight: '0.25rem' }}
          >
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
          View Ad
        </a>
      </div>
    </div>
  );
}

export default function MessagePage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [nextUpdate, setNextUpdate] = useState(30);
  const [stats, setStats] = useState({
    totalMessages: 0,
    activeUsers: 0,
    newMessages: 0
  });

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/message`);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
      setLastUpdate(new Date());
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalMessages: data.length,
        activeUsers: new Set(data.map(msg => msg.senderUsername)).size,
        newMessages: data.filter(msg => 
          new Date(msg.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchMessages();

    // Set up the interval
    const interval = setInterval(fetchMessages, 30000);

    // Countdown timer
    const timer = setInterval(() => {
      setNextUpdate(prev => {
        if (prev <= 1) {
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  return (
    <main style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto' 
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 800, 
            background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            letterSpacing: '-0.025em'
          }}>
            Message Dashboard
          </h1>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '0.8rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              Next update in: {nextUpdate}s
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '0.8rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              color: '#6B7280',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <StatCard 
            title="Total Messages" 
            value={stats.totalMessages}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            }
          />
          <StatCard 
            title="Active Users" 
            value={stats.activeUsers}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            }
          />
          <StatCard 
            title="New Messages (24h)" 
            value={stats.newMessages}
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            }
          />
        </div>

        {loading && (
          <div style={{ 
            textAlign: 'center', 
            color: '#6B7280', 
            fontSize: '1.2rem',
            padding: '2rem',
            background: 'rgba(255,255,255,0.8)',
            borderRadius: '1rem',
            backdropFilter: 'blur(10px)'
          }}>
            Loading messages...
          </div>
        )}

        {error && (
          <div style={{ 
            textAlign: 'center', 
            color: '#DC2626', 
            fontSize: '1.1rem',
            padding: '1rem',
            background: '#FEE2E2',
            borderRadius: '0.8rem',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '2rem',
          alignItems: 'stretch'
        }}>
          {messages && messages.length > 0 ? (
            messages.map((msg, idx) => (
              <MessageCard key={msg._id || idx} message={msg} />
            ))
          ) : !loading && !error ? (
            <div style={{ 
              textAlign: 'center', 
              color: '#6B7280', 
              fontSize: '1.1rem',
              padding: '2rem',
              background: 'rgba(255,255,255,0.8)',
              borderRadius: '1rem',
              backdropFilter: 'blur(10px)',
              gridColumn: '1 / -1'
            }}>
              No messages found.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
