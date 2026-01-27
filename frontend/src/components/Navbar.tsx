import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, User, Menu, X, PlusCircle, Ticket, ShieldAlert, BarChart3, ShieldCheck, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isSuperAdmin = user?.role === 'super_admin';
    const isAdmin = user?.role === 'admin';
    const isOrganizer = user?.role === 'organizer';

    const navLinks = [
        { name: 'Events', path: '/', icon: <Calendar size={18} /> },
        { name: 'My Tickets', path: '/orders', icon: <Ticket size={18} /> },
        { name: 'Profile', path: '/profile', icon: <User size={18} /> },
    ];

    if (isOrganizer) {
        navLinks.push({ name: 'Hub', path: '/organizer', icon: <BarChart3 size={18} /> });
    }

    if (isAdmin) {
        navLinks.push({ name: 'Control', path: '/admin', icon: <ShieldAlert size={18} /> });
    }

    if (isSuperAdmin) {
        navLinks.push({ name: 'Protocol', path: '/super-admin', icon: <ShieldCheck size={18} /> });
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className={`nav-container ${scrolled ? 'nav-scrolled' : 'nav-default'}`}>
            <div className="nav-brand" onClick={() => navigate('/')}>
                <div className="brand-icon-box">
                    <div className="brand-shimmer" />
                    <Calendar className="text-white relative z-10" size={22} />
                </div>
                <div className="brand-text-group">
                    <span className="brand-name">Eventify</span>
                    <span className="brand-tagline">Premium Console</span>
                </div>
            </div>

            {/* Desktop Menu */}
            <div className="nav-menu-desktop">
                <div className="nav-links-wrapper">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <button
                                key={link.name}
                                onClick={() => navigate(link.path)}
                                className={`nav-link-btn ${isActive ? 'active' : ''}`}
                            >
                                <span className={`nav-link-icon`}>{link.icon}</span>
                                {link.name}
                            </button>
                        );
                    })}
                </div>

                <div className="nav-divider" />

                <div className="nav-actions">
                    {(isOrganizer || isAdmin) && (
                        <button onClick={() => navigate('/events/create')} className="launch-btn">
                            <PlusCircle size={18} />
                            Launch
                        </button>
                    )}

                    {user && (
                        <button onClick={handleLogout} className="logout-btn" title="Sign Out">
                            <LogOut size={20} />
                        </button>
                    )}
                </div>
            </div>

            <div className="md:hidden">
                <button onClick={() => setIsOpen(!isOpen)} className="mobile-toggle">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="mobile-menu"
                    >
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <button
                                    key={link.name}
                                    onClick={() => {
                                        navigate(link.path);
                                        setIsOpen(false);
                                    }}
                                    className={`mobile-link-btn ${isActive ? 'active' : ''}`}
                                >
                                    <span>{link.icon}</span>
                                    {link.name}
                                </button>
                            );
                        })}

                        <div className="mobile-actions">
                            {(isOrganizer || isAdmin) && (
                                <button
                                    onClick={() => {
                                        navigate('/events/create');
                                        setIsOpen(false);
                                    }}
                                    className="mobile-action-btn btn-launch-mobile"
                                >
                                    <PlusCircle size={20} />
                                    <span>Launch</span>
                                </button>
                            )}

                            {user && (
                                <button onClick={handleLogout} className="mobile-action-btn btn-exit-mobile">
                                    <LogOut size={20} />
                                    <span>Exit</span>
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
