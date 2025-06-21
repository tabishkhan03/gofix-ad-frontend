"use client"
import { useEffect, useState } from "react"
import {
  MessageSquare,
  Users,
  Clock,
  TrendingUp,
  ExternalLink,
  Search,
  RefreshCw,
  BarChart3,
  Activity,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Cell,
  AreaChart,
  Area,
} from "recharts"

const API_ENDPOINT = `/api/message`
const API_BY_ADLINK = `api/message/by-adlink`
const API_BY_PRIOR = `/api/message/by-prior-message`

// Mock data for charts (replace with real data from your API)
const generateMockChartData = (messages) => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      messages: Math.floor(Math.random() * 50) + 10,
      users: Math.floor(Math.random() * 20) + 5,
    }
  })

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    messages: Math.floor(Math.random() * 20) + 1,
  }))

  const topUsers = messages.slice(0, 5).map((msg, i) => ({
    name: msg.senderUsername || `User ${i + 1}`,
    messages: Math.floor(Math.random() * 30) + 5,
  }))

  const pieData = [
    { name: "Regular", value: 65 },
    { name: "Ad Links", value: 25 },
    { name: "Replies", value: 10 },
  ]

  return { last7Days, hourlyData, topUsers, pieData }
}

const COLORS = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"]

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function StatCard({ title, value, icon: Icon, trend, description }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">
              <span className={trend > 0 ? "text-green-600" : "text-red-600"}>
                {trend > 0 ? "+" : ""}
                {trend}%
              </span>{" "}
              from last period
            </p>
          )}
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <div className="ml-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageCard({ message }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              From: {message.senderUsername}
            </span>
            {message.senderHandle && <span className="text-xs text-gray-500">@{message.senderHandle}</span>}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              To: {message.recipientUsername}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500 ml-4">{formatDate(message.createdAt || message.timestamp)}</div>
      </div>

      <div className="flex-1 mb-4">
        <div className="text-sm text-gray-800 bg-gray-50 rounded-lg p-4 leading-relaxed">
          {message.content}
          {message.priorMessage && (
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-600">
              <strong>Prior Message:</strong> {message.priorMessage}
            </div>
          )}
        </div>
      </div>

      {message.adData && message.adData.adLink && (
        <div className="mt-auto">
          <a
            href={message.adData.adLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Ad
          </a>
        </div>
      )}
    </div>
  )
}

function GroupCard({ group, type }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {type === "adlink" ? "Ad Link Group" : "Prior Message Group"}
        </h3>
        <div className="text-sm text-gray-600 mb-3">
          {type === "adlink" ? (
            <a
              href={group._id}
              className="text-indigo-600 hover:text-indigo-800 underline break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {group._id}
            </a>
          ) : (
            <span className="break-words">{group._id}</span>
          )}
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {group.count} messages
        </span>
      </div>

      <div className="flex-1">
        <div className="space-y-3 max-h-40 overflow-y-auto">
          {group.users.map((user) => (
            <div key={user._id} className="flex items-center justify-between text-sm">
              <div className="flex-1 min-w-0">
                <span className="font-medium text-gray-900">{user.senderUsername}</span>
                {user.senderHandle && <span className="text-gray-500 ml-1">@{user.senderHandle}</span>}
                <span className="text-gray-400 mx-2">→</span>
                <span className="text-gray-700">{user.recipientUsername}</span>
              </div>
              {user.adLink && (
                <a
                  href={user.adLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 p-1 text-gray-400 hover:text-indigo-600 transition-colors duration-200"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
        active
          ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  )
}

function Button({ onClick, variant = "primary", size = "md", children, className = "", disabled = false }) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  }

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : ""

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  )
}

function Input({ placeholder, value, onChange, className = "" }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${className}`}
    />
  )
}

function Select({ value, onChange, options, className = "" }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`block px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white ${className}`}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) {
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Items per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Show</span>
          <Select 
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            options={[
              { value: 10, label: "10" },
              { value: 50, label: "50" },
              { value: 100, label: "100" },
              { value: 500, label: "500" },
              { value: 1000, label: "1000" },
            ]}
            className="w-20 text-gray-700"
          />
          <span className="text-sm text-gray-700">per page</span>
        </div>

        {/* Page info */}
        <div className="text-sm text-gray-700">
          Showing {startItem} to {endItem} of {totalItems} results
        </div>

        {/* Pagination controls */}
        <div className="flex items-center gap-1">
          {/* First page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          {/* Previous page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1 mx-2">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === "number" && onPageChange(page)}
                disabled={page === "..."}
                className={`min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  page === currentPage
                    ? "bg-indigo-600 text-white"
                    : page === "..."
                      ? "text-gray-400 cursor-default"
                      : "text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Last page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MessageDashboard() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [nextUpdate, setNextUpdate] = useState(30)
  const [stats, setStats] = useState({
    totalMessages: 0,
    activeUsers: 0,
    newMessages: 0,
    avgResponseTime: 0,
  })
  const [activeTab, setActiveTab] = useState("overview")
  const [adGroups, setAdGroups] = useState([])
  const [priorGroups, setPriorGroups] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [chartData, setChartData] = useState({ last7Days: [], hourlyData: [], topUsers: [], pieData: [] })
  const [sessionToken, setSessionToken] = useState("")
  const [sessionStatus, setSessionStatus] = useState({ loading: false, message: null, error: false })

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [adGroupsPage, setAdGroupsPage] = useState(1)
  const [priorGroupsPage, setPriorGroupsPage] = useState(1)

  // Fetch all messages
  const fetchMessages = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(API_ENDPOINT)
      if (!res.ok) throw new Error("Failed to fetch messages")
      const data = await res.json()
      setMessages(data)
      setLastUpdate(new Date())

      // Calculate stats
      const uniqueUsers = new Set(data.map((msg) => msg.senderUsername)).size
      const last24h = data.filter(
        (msg) => new Date(msg.createdAt || msg.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000),
      ).length

      setStats({
        totalMessages: data.length,
        activeUsers: uniqueUsers,
        newMessages: last24h,
        avgResponseTime: Math.floor(Math.random() * 120) + 30, // Mock data
      })

      // Generate chart data
      setChartData(generateMockChartData(data))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch ad link groups
  const fetchAdGroups = async () => {
    try {
      const res = await fetch(API_BY_ADLINK)
      if (!res.ok) throw new Error("Failed to fetch ad link groups")
      const data = await res.json()
      setAdGroups(data)
    } catch (err) {
      setError(err.message)
    }
  }

  // Fetch prior message groups
  const fetchPriorGroups = async () => {
    try {
      const res = await fetch(API_BY_PRIOR)
      if (!res.ok) throw new Error("Failed to fetch prior message groups")
      const data = await res.json()
      setPriorGroups(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSessionSubmit = async (e) => {
    e.preventDefault()
    setSessionStatus({ loading: true, message: null, error: false })

    try {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to update session")
      }

      setSessionStatus({ loading: false, message: "Session token updated successfully!", error: false })
      setSessionToken("") // Clear input after successful submission
    } catch (err) {
      setSessionStatus({ loading: false, message: err.message, error: true })
    }
  }

  useEffect(() => {
    fetchMessages()
    fetchAdGroups()
    fetchPriorGroups()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages()
      fetchAdGroups()
      fetchPriorGroups()
    }, 30000)

    const timer = setInterval(() => {
      setNextUpdate((prev) => (prev <= 1 ? 30 : prev - 1))
    }, 1000)

    return () => {
      clearInterval(interval)
      clearInterval(timer)
    }
  }, [])

  // Filter and paginate data
  const filteredMessages = messages.filter(
    (msg) =>
      !searchTerm ||
      msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.senderUsername.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.recipientUsername.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalMessages = filteredMessages.length
  const totalPages = Math.ceil(totalMessages / itemsPerPage)
  const paginatedMessages = filteredMessages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalAdGroups = adGroups.length
  const totalAdPages = Math.ceil(totalAdGroups / itemsPerPage)
  const paginatedAdGroups = adGroups.slice((adGroupsPage - 1) * itemsPerPage, adGroupsPage * itemsPerPage)

  const totalPriorGroups = priorGroups.length
  const totalPriorPages = Math.ceil(totalPriorGroups / itemsPerPage)
  const paginatedPriorGroups = priorGroups.slice((priorGroupsPage - 1) * itemsPerPage, priorGroupsPage * itemsPerPage)

  const refreshData = () => {
    fetchMessages()
    fetchAdGroups()
    fetchPriorGroups()
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage)
    setCurrentPage(1)
    setAdGroupsPage(1)
    setPriorGroupsPage(1)
  }

  const handleAdGroupsPageChange = (page) => {
    setAdGroupsPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePriorGroupsPageChange = (page) => {
    setPriorGroupsPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Message Analytics Dashboard</h1>
            <p className="text-gray-600">Monitor and analyze your message data in real-time</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              Next update: {nextUpdate}s
            </div>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Messages"
            value={stats.totalMessages.toLocaleString()}
            icon={MessageSquare}
            trend={12}
            description="All time messages"
          />
          <StatCard
            title="Active Users"
            value={stats.activeUsers.toLocaleString()}
            icon={Users}
            trend={8}
            description="Unique senders"
          />
          <StatCard
            title="New Messages (24h)"
            value={stats.newMessages.toLocaleString()}
            icon={TrendingUp}
            trend={-3}
            description="Last 24 hours"
          />
          <StatCard
            title="Avg Response Time"
            value={`${stats.avgResponseTime}m`}
            icon={Activity}
            trend={-15}
            description="Average response time"
          />
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg w-fit">
            <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
              Overview
            </TabButton>
            <TabButton active={activeTab === "messages"} onClick={() => setActiveTab("messages")}>
              Messages ({totalMessages})
            </TabButton>
            <TabButton active={activeTab === "adlinks"} onClick={() => setActiveTab("adlinks")}>
              Ad Links ({totalAdGroups})
            </TabButton>
            <TabButton active={activeTab === "prior"} onClick={() => setActiveTab("prior")}>
              Prior Messages ({totalPriorGroups})
            </TabButton>
            <TabButton active={activeTab === "session"} onClick={() => setActiveTab("session")}>
              Session
            </TabButton>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Message Trends (7 Days)</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData.last7Days}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="messages" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                    <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Hourly Activity</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="messages" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Top Active Users</h3>
                <p className="text-gray-600 text-sm mb-6">Users with the most messages</p>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData.topUsers} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="messages" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Message Distribution</h3>
                <p className="text-gray-600 text-sm mb-6">By message type</p>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Tooltip />
                    <PieChart data={chartData.pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                      {chartData.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </PieChart>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="space-y-6">
            {/* <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search messages, users..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1) // Reset to first page when searching
                  }}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div> */}

            {loading && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-center">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
                    <span className="text-gray-600">Loading messages...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {!loading && !error && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedMessages.length > 0 ? (
                    paginatedMessages.map((msg, idx) => <MessageCard key={msg._id || idx} message={msg} />)
                  ) : (
                    <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                      <p className="text-center text-gray-500">No messages found.</p>
                    </div>
                  )}
                </div>

                {totalMessages > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalMessages}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "adlinks" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedAdGroups.length > 0 ? (
                paginatedAdGroups.map((group, idx) => <GroupCard key={group._id || idx} group={group} type="adlink" />)
              ) : (
                <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <p className="text-center text-gray-500">No ad link groups found.</p>
                </div>
              )}
            </div>

            {totalAdGroups > 0 && (
              <Pagination
                currentPage={adGroupsPage}
                totalPages={totalAdPages}
                totalItems={totalAdGroups}
                itemsPerPage={itemsPerPage}
                onPageChange={handleAdGroupsPageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </div>
        )}

        {activeTab === "prior" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedPriorGroups.length > 0 ? (
                paginatedPriorGroups.map((group, idx) => (
                  <GroupCard key={group._id || idx} group={group} type="prior" />
                ))
              ) : (
                <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                  <p className="text-center text-gray-500">No prior message groups found.</p>
                </div>
              )}
            </div>

            {totalPriorGroups > 0 && (
              <Pagination
                currentPage={priorGroupsPage}
                totalPages={totalPriorPages}
                totalItems={totalPriorGroups}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePriorGroupsPageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </div>
        )}

        {activeTab === "session" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Update Session Token</h3>
              <p className="text-sm text-gray-600 mt-1">
                Enter the session token below. This will create a new session if one doesn't exist, or update the
                existing one.
              </p>
            </div>
            <form onSubmit={handleSessionSubmit} className="space-y-4">
              <div>
                <label htmlFor="session-token" className="block text-sm font-medium text-gray-700 mb-1">
                  Session Token
                </label>
                <Input
                  id="session-token"
                  placeholder="Enter your session token"
                  value={sessionToken}
                  onChange={(e) => setSessionToken(e.target.value)}
                  className="text-gray-700"
                />
              </div>
              <Button type="submit" variant="primary" disabled={sessionStatus.loading || !sessionToken}>
                {sessionStatus.loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Session"
                )}
              </Button>
            </form>
            {sessionStatus.message && (
              <div
                className={`mt-4 text-sm rounded-lg p-3 ${
                  sessionStatus.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                }`}
              >
                {sessionStatus.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
