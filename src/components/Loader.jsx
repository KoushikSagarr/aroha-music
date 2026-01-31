import { motion } from 'framer-motion'

const Loader = () => {
    return (
        <motion.div
            className="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="loader-content">
                <motion.img
                    src="/logo.jpg"
                    alt="AROHA Music"
                    className="loader-logo"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                />
                <div className="loader-bar">
                    <motion.div
                        className="loader-progress"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, ease: 'easeInOut' }}
                    />
                </div>
            </div>
        </motion.div>
    )
}

export default Loader
