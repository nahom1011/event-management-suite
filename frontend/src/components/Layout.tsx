import type { ReactNode } from 'react';
import Navbar from './Navbar';
import { motion } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import './Layout.css';

interface LayoutProps {
    children: ReactNode;
    showNav?: boolean;
}

const Layout = ({ children, showNav = true }: LayoutProps) => {
    const { user } = useAuth();
    const theme = user?.role || 'user';

    return (
        <div className="layout-root" data-theme={theme}>
            {/* Elegant Ambient Glows */}
            <div className={`ambient-glow-1 ${theme}`} />
            <div className={`ambient-glow-2 ${theme}`} />

            {showNav && <Navbar />}

            <main className={`main-content ${showNav ? 'main-with-nav' : ''}`}>
                <motion.div
                    key={theme} // Trigger re-animation on theme change
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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

