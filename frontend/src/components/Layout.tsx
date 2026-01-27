import type { ReactNode } from 'react';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import './Layout.css';

interface LayoutProps {
    children: ReactNode;
    showNav?: boolean;
}

const Layout = ({ children, showNav = true }: LayoutProps) => {
    return (
        <div className="layout-root">
            {/* Elegant Ambient Glows */}
            <div className="ambient-glow-1" />
            <div className="ambient-glow-2" />
            <div className="ambient-glow-3" />

            {showNav && <Navbar />}

            <main className={`main-content ${showNav ? 'main-with-nav' : ''}`}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                    {children}
                </motion.div>
            </main>

            <footer className="layout-footer">
                <div className="footer-container">
                    <div className="footer-copyright">
                        <span className="status-indicator" />
                        &copy; {new Date().getFullYear()} Eventify. The Gold Standard.
                    </div>
                    <div className="footer-links">
                        <span className="footer-link">Privacy</span>
                        <span className="footer-link">Terms</span>
                        <span className="footer-link">Contact</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;

