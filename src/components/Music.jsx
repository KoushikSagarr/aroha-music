import { motion, useInView, animate } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

const tracks = [
    { id: 1, name: 'Demo Track 1', duration: '3:45' },
    { id: 2, name: 'Demo Track 2', duration: '4:12' },
    { id: 3, name: 'Demo Track 3', duration: '3:58' },
]

const Music = () => {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '-100px' })
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTrack, setCurrentTrack] = useState(0)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState('0:00')

    useEffect(() => {
        let interval
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 100) {
                        setCurrentTrack((t) => (t + 1) % tracks.length)
                        return 0
                    }
                    return prev + 0.5
                })
            }, 500)
        }
        return () => clearInterval(interval)
    }, [isPlaying])

    useEffect(() => {
        const totalSeconds = 225 // 3:45
        const currentSeconds = Math.floor((progress / 100) * totalSeconds)
        const minutes = Math.floor(currentSeconds / 60)
        const seconds = currentSeconds % 60
        setCurrentTime(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }, [progress])

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying)
    }

    const handleTrackSelect = (index) => {
        setCurrentTrack(index)
        setProgress(0)
        if (!isPlaying) setIsPlaying(true)
    }

    const handlePrev = () => {
        setCurrentTrack((t) => (t - 1 + tracks.length) % tracks.length)
        setProgress(0)
    }

    const handleNext = () => {
        setCurrentTrack((t) => (t + 1) % tracks.length)
        setProgress(0)
    }

    const handleProgressClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const clickX = e.clientX - rect.left
        const newProgress = (clickX / rect.width) * 100
        setProgress(newProgress)
    }

    return (
        <section className="music" id="music" ref={ref}>
            <div className="container">
                <motion.div
                    className="section-header center"
                    initial={{ y: 40, opacity: 0 }}
                    animate={isInView ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 0.8 }}
                >
                    <span className="section-tag">Our Sound</span>
                    <h2 className="section-title">Listen To AROHA</h2>
                    <p className="section-subtitle">Get a taste of what we bring to the stage</p>
                </motion.div>

                <motion.div
                    className="music-player"
                    initial={{ y: 50, opacity: 0 }}
                    animate={isInView ? { y: 0, opacity: 1 } : {}}
                    transition={{ duration: 1, delay: 0.2 }}
                >
                    <div className="player-visual">
                        <div className="vinyl-container">
                            <motion.div
                                className="vinyl"
                                animate={{ rotate: isPlaying ? 360 : 0 }}
                                transition={{
                                    duration: 3,
                                    repeat: isPlaying ? Infinity : 0,
                                    ease: 'linear'
                                }}
                            >
                                <img src="/logo.jpg" alt="AROHA" className="vinyl-label" />
                            </motion.div>
                            <motion.div
                                className="tone-arm"
                                animate={{ rotate: isPlaying ? -10 : -25 }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    <div className="player-controls">
                        <div className="now-playing">
                            <span className="track-title">{tracks[currentTrack].name}</span>
                            <span className="track-artist">AROHA Music</span>
                        </div>

                        <div className="progress-bar" onClick={handleProgressClick}>
                            <motion.div
                                className="progress-fill"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="time-display">
                            <span>{currentTime}</span>
                            <span>{tracks[currentTrack].duration}</span>
                        </div>

                        <div className="controls">
                            <motion.button
                                className="control-btn"
                                onClick={handlePrev}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Previous"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                                </svg>
                            </motion.button>

                            <motion.button
                                className="control-btn play-btn"
                                onClick={handlePlayPause}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                                {isPlaying ? (
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </motion.button>

                            <motion.button
                                className="control-btn"
                                onClick={handleNext}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                aria-label="Next"
                            >
                                <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                                </svg>
                            </motion.button>
                        </div>

                        <div className="playlist">
                            {tracks.map((track, index) => (
                                <motion.button
                                    key={track.id}
                                    className={`track ${index === currentTrack ? 'active' : ''}`}
                                    onClick={() => handleTrackSelect(index)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="track-num">{String(index + 1).padStart(2, '0')}</span>
                                    <span className="track-name">{track.name}</span>
                                    <span className="track-duration">{track.duration}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

export default Music
