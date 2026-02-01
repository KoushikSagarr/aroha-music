import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'

const Gallery = () => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })
    const [photos, setPhotos] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedPhoto, setSelectedPhoto] = useState(null)

    // Fetch photos from Firestore
    useEffect(() => {
        const photosRef = collection(db, 'photos')
        const q = query(photosRef, orderBy('uploadedAt', 'desc'))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const photoData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setPhotos(photoData)
            setLoading(false)
        }, (error) => {
            console.error('Error fetching photos:', error)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    }

    return (
        <section className="gallery" id="gallery" ref={ref}>
            <div className="container">
                <motion.div
                    className="section-header"
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                >
                    <span className="section-tag">📸 Captured Moments</span>
                    <h2 className="section-title">Photo Gallery</h2>
                    <p className="section-subtitle">
                        Relive the magic from our live performances
                    </p>
                </motion.div>

                {loading ? (
                    <div className="gallery-loading">
                        <span className="loading-emoji">🎵</span>
                        <p>Loading photos...</p>
                    </div>
                ) : photos.length === 0 ? (
                    <motion.div
                        className="gallery-empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <span className="empty-icon">📷</span>
                        <p>No photos yet</p>
                        <span className="empty-hint">Check back after our next show!</span>
                    </motion.div>
                ) : (
                    <motion.div
                        className="gallery-grid"
                        variants={containerVariants}
                        initial="hidden"
                        animate={isInView ? "visible" : "hidden"}
                    >
                        {photos.map((photo) => (
                            <motion.div
                                key={photo.id}
                                className="gallery-item"
                                variants={itemVariants}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedPhoto(photo)}
                            >
                                <img src={photo.url} alt={photo.caption || 'Performance photo'} />
                                {photo.caption && (
                                    <div className="gallery-caption">
                                        <p>{photo.caption}</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        className="lightbox-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPhoto(null)}
                    >
                        <motion.div
                            className="lightbox-content"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="lightbox-close"
                                onClick={() => setSelectedPhoto(null)}
                            >
                                ✕
                            </button>
                            <img
                                src={selectedPhoto.url}
                                alt={selectedPhoto.caption || 'Performance photo'}
                            />
                            {selectedPhoto.caption && (
                                <p className="lightbox-caption">{selectedPhoto.caption}</p>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}

export default Gallery
