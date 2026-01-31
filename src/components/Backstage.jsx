import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Simple in-memory store for song requests (shared across components)
// In production, you'd use Firebase, Supabase, or a backend API
export const songRequestStore = {
    requests: [],
    listeners: new Set(),

    addRequest(request) {
        this.requests.unshift({
            ...request,
            id: Date.now(),
            timestamp: new Date().toISOString(),
            status: 'pending'
        })
        this.notify()
    },

    updateStatus(id, status) {
        const request = this.requests.find(r => r.id === id)
        if (request) {
            request.status = status
            this.notify()
        }
    },

    clearCompleted() {
        this.requests = this.requests.filter(r => r.status !== 'played')
        this.notify()
    },

    subscribe(listener) {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    },

    notify() {
        this.listeners.forEach(listener => listener([...this.requests]))
    }
}

const Backstage = () => {
    const [requests, setRequests] = useState([])
    const [filter, setFilter] = useState('all') // all, pending, playing, played

    useEffect(() => {
        // Subscribe to request updates
        const unsubscribe = songRequestStore.subscribe(setRequests)
        setRequests([...songRequestStore.requests])
        return unsubscribe
    }, [])

    const filteredRequests = requests.filter(req => {
        if (filter === 'all') return true
        return req.status === filter
    })

    const handleStatusChange = (id, newStatus) => {
        songRequestStore.updateStatus(id, newStatus)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#E8A87C'
            case 'playing': return '#7ECEC5'
            case 'played': return '#88D8C0'
            default: return '#888'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return '⏳'
            case 'playing': return '🎵'
            case 'played': return '✅'
            default: return '•'
        }
    }

    return (
        <div className="backstage">
            <div className="backstage-header">
                <div className="backstage-title">
                    <h1>🎤 Song Requests</h1>
                    <span className="request-count">{requests.filter(r => r.status === 'pending').length} pending</span>
                </div>
                <p className="backstage-subtitle">Live requests from your audience</p>
            </div>

            <div className="backstage-filters">
                {['all', 'pending', 'playing', 'played'].map((f) => (
                    <button
                        key={f}
                        className={`filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? '📋 All' :
                            f === 'pending' ? '⏳ Pending' :
                                f === 'playing' ? '🎵 Playing' : '✅ Played'}
                    </button>
                ))}
            </div>

            <div className="requests-list">
                <AnimatePresence>
                    {filteredRequests.length === 0 ? (
                        <motion.div
                            className="empty-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <span className="empty-icon">🎸</span>
                            <p>No song requests yet</p>
                            <span className="empty-hint">Requests will appear here in real-time</span>
                        </motion.div>
                    ) : (
                        filteredRequests.map((request, index) => (
                            <motion.div
                                key={request.id}
                                className="request-card"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                style={{
                                    borderLeft: `4px solid ${getStatusColor(request.status)}`,
                                    opacity: request.status === 'played' ? 0.6 : 1
                                }}
                            >
                                <div className="request-main">
                                    {request.artwork && (
                                        <img
                                            src={request.artwork}
                                            alt={request.song}
                                            className="request-artwork"
                                        />
                                    )}
                                    <div className="request-info">
                                        <h3 className="request-song">{request.song}</h3>
                                        <p className="request-artist">{request.artist}</p>
                                        {request.fanName && (
                                            <span className="request-from">
                                                Requested by <strong>{request.fanName}</strong>
                                            </span>
                                        )}
                                    </div>
                                    <span className="request-status-badge">
                                        {getStatusIcon(request.status)}
                                    </span>
                                </div>

                                <div className="request-actions">
                                    {request.status === 'pending' && (
                                        <>
                                            <button
                                                className="action-btn play-btn"
                                                onClick={() => handleStatusChange(request.id, 'playing')}
                                            >
                                                🎵 Now Playing
                                            </button>
                                            <button
                                                className="action-btn skip-btn"
                                                onClick={() => handleStatusChange(request.id, 'played')}
                                            >
                                                ⏭️ Skip
                                            </button>
                                        </>
                                    )}
                                    {request.status === 'playing' && (
                                        <button
                                            className="action-btn done-btn"
                                            onClick={() => handleStatusChange(request.id, 'played')}
                                        >
                                            ✅ Done
                                        </button>
                                    )}
                                    {request.status === 'played' && (
                                        <span className="played-label">Completed</span>
                                    )}
                                </div>

                                <span className="request-time">
                                    {new Date(request.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {requests.some(r => r.status === 'played') && (
                <button
                    className="clear-btn"
                    onClick={() => songRequestStore.clearCompleted()}
                >
                    🗑️ Clear Completed
                </button>
            )}

            <div className="backstage-footer">
                <p>Open this page on a tablet near the stage 📱</p>
                <span className="backstage-url">{window.location.origin}/backstage</span>
            </div>
        </div>
    )
}

export default Backstage
