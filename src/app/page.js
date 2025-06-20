'use client'
import React, { useEffect, useState } from 'react';
import ClientTime from './ClientTime';

const API_BASE = process.env.BASE_URL;
const API_ENDPOINT = `${API_BASE ? API_BASE : ''}/api/message`;
const API_BY_ADLINK = `${API_BASE ? API_BASE : ''}/api/message/by-adlink`;
const API_BY_PRIOR = `${API_BASE ? API_BASE : ''}/api/message/by-prior-message`;

const TABS = [
  { key: 'all', label: 'All Messages' },
  { key: 'adlink', label: 'By Ad Link' },
  { key: 'prior', label: 'By Prior Message' },
];

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

function GroupCard({ group, type }) {
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-lg p-7 h-full border border-indigo-100 flex flex-col">
      <div className="mb-3">
        <div className="font-semibold text-indigo-700 text-lg">
          {type === 'adlink' ? (
            <>
              Ad Link: <a href={group._id} className="text-indigo-500 underline break-all" target="_blank" rel="noopener noreferrer">{group._id}</a>
            </>
          ) : (
            <>
              Prior Message: <span className="text-indigo-500">{group._id}</span>
            </>
          )}
        </div>
        <div className="text-gray-500 text-sm">Count: {group.count}</div>
      </div>
      <div className="flex-1">
        <ul className="space-y-2">
          {group.users.map((user) => (
            <li key={user._id} className="text-gray-700 text-base">
              <span className="font-medium">{user.senderUsername}</span>
              {user.senderHandle && <span className="text-gray-400 ml-1">(@{user.senderHandle})</span>}
              <span className="ml-2 text-gray-500">→ {user.recipientUsername}</span>
              {user.adLink && (
                <span className="ml-2 text-indigo-400 underline">
                  <a href={user.adLink} target="_blank" rel="noopener noreferrer">Ad</a>
                </span>
              )}
            </li>
          ))}
        </ul>
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
  const [tab, setTab] = useState('all');
  const [adGroups, setAdGroups] = useState([]);
  const [priorGroups, setPriorGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [adSearch, setAdSearch] = useState('');

  // Fetch all messages
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_ENDPOINT);
      if (!res.ok) throw new Error('Failed to fetch messages');
      const data = await res.json();
      setMessages(data);
      setLastUpdate(new Date());
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

  // Fetch ad link groups
  const fetchAdGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BY_ADLINK);
      if (!res.ok) throw new Error('Failed to fetch ad link groups');
      const data = await res.json();
      setAdGroups(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch prior message groups
  const fetchPriorGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BY_PRIOR);
      if (!res.ok) throw new Error('Failed to fetch prior message groups');
      const data = await res.json();
      setPriorGroups(data);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'all') fetchMessages();
    if (tab === 'adlink') fetchAdGroups();
    if (tab === 'prior') fetchPriorGroups();
    // eslint-disable-next-line
  }, [tab]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (tab === 'all') fetchMessages();
      if (tab === 'adlink') fetchAdGroups();
      if (tab === 'prior') fetchPriorGroups();
    }, 30000);
    const timer = setInterval(() => {
      setNextUpdate(prev => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
    // eslint-disable-next-line
  }, [tab]);

  // Filtered data
  const filteredMessages = messages.filter(msg =>
    (!search || msg.content.toLowerCase().includes(search.toLowerCase())) &&
    (!adSearch || (msg.adData && msg.adData.adLink && msg.adData.adLink.toLowerCase().includes(adSearch.toLowerCase())))
  );
  const filteredAdGroups = adGroups.filter(group =>
    !adSearch || (group._id && group._id.toLowerCase().includes(adSearch.toLowerCase()))
  );
  const filteredPriorGroups = priorGroups.filter(group =>
    !search || (group._id && group._id.toLowerCase().includes(search.toLowerCase()))
  );

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
        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-indigo-200">
          {TABS.map(t => (
            <button
              key={t.key}
              className={`px-4 py-2 font-semibold rounded-t-lg focus:outline-none transition-colors duration-200 ${tab === t.key ? 'bg-white text-indigo-700 shadow border-x border-t border-indigo-200 -mb-px' : 'text-gray-500 hover:text-indigo-600'}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {/* Stats */}
        {tab === 'all' && (
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
        )}
        {/* Content */}
        {loading && (
          <div className="text-center text-gray-500 text-lg py-8 bg-white/80 rounded-xl backdrop-blur">
            Loading...
          </div>
        )}
        {error && (
          <div className="text-center text-red-600 text-base py-4 bg-red-100 rounded-lg mb-8">
            {error}
          </div>
        )}
        {tab === 'all' && !loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {filteredMessages.length > 0 ? (
              filteredMessages.map((msg, idx) => (
                <MessageCard key={msg._id || idx} message={msg} />
              ))
            ) : (
              <div className="text-center text-gray-500 text-base py-8 bg-white/80 rounded-xl backdrop-blur col-span-full">
                No messages found.
              </div>
            )}
          </div>
        )}
        {tab === 'adlink' && !loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {filteredAdGroups.length > 0 ? (
              filteredAdGroups.map((group, idx) => (
                <GroupCard key={group._id || idx} group={group} type="adlink" />
              ))
            ) : (
              <div className="text-center text-gray-500 text-base py-8 bg-white/80 rounded-xl backdrop-blur col-span-full">
                No ad link groups found.
              </div>
            )}
          </div>
        )}
        {tab === 'prior' && !loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {filteredPriorGroups.length > 0 ? (
              filteredPriorGroups.map((group, idx) => (
                <GroupCard key={group._id || idx} group={group} type="prior" />
              ))
            ) : (
              <div className="text-center text-gray-500 text-base py-8 bg-white/80 rounded-xl backdrop-blur col-span-full">
                No prior message groups found.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
