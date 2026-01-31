import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { db } from '../firebase'
import {
    collection,
    addDoc,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore'

// Collection reference
const requestsRef = collection(db, 'songRequests')

// Export function to add request (used by Live component)
export const addSongRequest = async (request) => {
    await addDoc(requestsRef, {
        ...request,
        status: 'pending',
        createdAt: serverTimestamp()
    })
}

const Backstage = () => {
    const [requests, setRequests] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [loading, setLoading] = useState(true)

    // Subscribe to real-time updates from Firestore
    useEffect(() => {
        const q = query(requestsRef, orderBy('createdAt', 'desc'))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reqs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            }))
            setRequests(reqs)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const updateStatus = async (id, status) => {
        await updateDoc(doc(db, 'songRequests', id), { status })
        setSelectedId(null)
    }

    const deleteRequest = async (id) => {
        await deleteDoc(doc(db, 'songRequests', id))
        setSelectedId(null)
    }

    const pendingCount = requests.filter(r => r.status === 'pending').length
    const playingCount = requests.filter(r => r.status === 'playing').length

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return { bg: '#E8A87C', text: '⏳' }
            case 'playing': return { bg: '#7ECEC5', text: '🎵' }
            case 'played': return { bg: '#88D8C0', text: '✅' }
            default: return { bg: '#888', text: '•' }
        }
    }

    if (loading) {
        return (
            <div className="backstage">
                <div className="backstage-loading">
                    <span className="loading-icon">🎸</span>
                    <p>Loading requests...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="backstage">
            <div className="backstage-header">
                <h1>🎤 Song Requests</h1>
                <div className="backstage-stats">
                    {pendingCount > 0 && (
                        <span className="stat pending">{pendingCount} pending</span>
                    )}
                    {playingCount > 0 && (
                        <span className="stat playing">{playingCount} playing</span>
                    )}
                </div>
            </div>

            <div className="requests-list">
                <AnimatePresence>
                    {requests.length === 0 ? (
                        <motion.div
                            className="empty-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <span className="empty-icon">🎵</span>
                            <p>No requests yet</p>
                            <span className="empty-hint">Audience requests will appear here</span>
                        </motion.div>
                    ) : (
                        requests.map((request) => (
                            <motion.div
                                key={request.id}
                                className={`request-item ${request.status} ${selectedId === request.id ? 'selected' : ''}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                onClick={() => setSelectedId(selectedId === request.id ? null : request.id)}
                                layout
                            >
                                <div className="request-row">
                                    <span className="request-status-icon">
                                        {getStatusStyle(request.status).text}
                                    </span>

                                    {request.artwork && (
                                        <img
                                            src={request.artwork}
                                            alt=""
                                            className="request-thumb"
                                        />
                                    )}

                                    <div className="request-details">
                                        <span className="request-song-name">{request.song}</span>
                                        <span className="request-artist-name">{request.artist}</span>
                                    </div>

                                    {request.fanName && request.fanName !== 'Anonymous' && (
                                        <span className="request-fan">🙋 {request.fanName}</span>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {selectedId === request.id && (
                                        <motion.div
                                            className="request-actions-panel"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                        >
                                            <div className="action-buttons">
                                                {request.status === 'pending' && (
                                                    <>
                                                        <button
                                                            className="action-btn now-playing"
                                                            onClick={(e) => { e.stopPropagation(); updateStatus(request.id, 'playing') }}
                                                        >
                                                            🎵 Now Playing
                                                        </button>
                                                        <button
                                                            className="action-btn mark-done"
                                                            onClick={(e) => { e.stopPropagation(); updateStatus(request.id, 'played') }}
                                                        >
                                                            ✅ Done
                                                        </button>
                                                    </>
                                                )}
                                                {request.status === 'playing' && (
                                                    <button
                                                        className="action-btn mark-done"
                                                        onClick={(e) => { e.stopPropagation(); updateStatus(request.id, 'played') }}
                                                    >
                                                        ✅ Finished
                                                    </button>
                                                )}
                                                {request.status === 'played' && (
                                                    <button
                                                        className="action-btn pending-again"
                                                        onClick={(e) => { e.stopPropagation(); updateStatus(request.id, 'pending') }}
                                                    >
                                                        🔄 Play Again
                                                    </button>
                                                )}
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={(e) => { e.stopPropagation(); deleteRequest(request.id) }}
                                                >
                                                    🗑️ Remove
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="backstage-footer">
                <p>📱 Keep this open on your tablet near the stage</p>
                <span className="sync-status">🟢 Live sync enabled</span>
            </div>
        </div>
    )
}

export default Backstage
