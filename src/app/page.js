'use client'
import React, { useEffect, useState } from 'react';
import ClientTime from './ClientTime';

const API_BASE = process.env.BASE_URL;
const API_ENDPOINT = `${API_BASE ? API_BASE : ''}/api/message`;

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
    <div className="bg-white/90 backdrop-blur rounded-xl p-6 flex items-center gap-4 shadow-md border border-indigo-100">
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-400 rounded-lg p-3 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-sm text-gray-500 mb-1">{title}</h3>
        <p className="text-2xl font-semibold text-gray-900 m-0">{value}</p>
      </div>
    </div>
  );
}

function MessageCard({ message }) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-7 h-full border border-indigo-100 flex flex-col transition-all hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="font-semibold text-lg text-indigo-700 mb-2">
            From: <span className="text-indigo-500">{message.senderUsername}</span>
            {message.senderHandle && (
              <span className="text-gray-400 text-base ml-2">(@{message.senderHandle})</span>
            )}
          </div>
          <div className="font-semibold text-lg text-indigo-700">
            To: <span className="text-indigo-500">{message.recipientUsername}</span>
          </div>
        </div>
        <div className="text-sm text-gray-400 text-right">
          {formatDate(message.createdAt || message.timestamp)}
        </div>
      </div>
      <div className="text-base text-gray-800 bg-gray-50 rounded-xl p-4 mb-5 leading-relaxed flex-1">
        {message.content}
        {message.priorMessage && (
          <div className="mt-3 text-gray-500 text-base">
            <b>Prior Message:</b> {message.priorMessage}
          </div>
        )}
      </div>
      {message.adData && message.adData.adLink && (
        <div className="flex justify-end gap-4 mt-auto">
          <a
            href={message.adData.adLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-indigo-700 to-indigo-400 text-white rounded-xl px-6 py-3 font-semibold text-base flex items-center gap-2 shadow hover:-translate-y-0.5 hover:shadow-xl transition-all"
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
              className="mr-1"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            View Ad
          </a>
        </div>
      )}
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
      const res = await fetch(API_ENDPOINT);
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
          new Date(msg.createdAt || msg.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
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
    <main className="min-h-screen bg-gradient-to-br from-indigo-100 to-violet-100 py-8 px-2">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-br from-indigo-700 to-indigo-400 bg-clip-text text-transparent m-0 tracking-tight">
            Message Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <div className="bg-white/90 backdrop-blur rounded-lg px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
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
            <div className="bg-white/90 backdrop-blur rounded-lg px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
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
              Last updated: <ClientTime date={lastUpdate} />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
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
          <div className="text-center text-gray-500 text-lg py-8 bg-white/80 rounded-xl backdrop-blur">
            Loading messages...
          </div>
        )}
        {error && (
          <div className="text-center text-red-600 text-base py-4 bg-red-100 rounded-lg mb-8">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {messages && messages.length > 0 ? (
            messages.map((msg, idx) => (
              <MessageCard key={msg._id || idx} message={msg} />
            ))
          ) : !loading && !error ? (
            <div className="text-center text-gray-500 text-base py-8 bg-white/80 rounded-xl backdrop-blur col-span-full">
              No messages found.
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
