import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, User, Menu, X, PlusCircle, Ticket, ShieldAlert, BarChart3, ShieldCheck, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/AuthContext';

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
    const isAdmin = user?.role === 'admin' || isSuperAdmin;
    const isOrganizer = user?.role === 'organizer';

    const navLinks = [
        { name: 'Events', path: '/', icon: <Calendar size={18} /> },
        { name: 'My Tickets', path: '/orders', icon: <Ticket size={18} /> },
        { name: 'Profile', path: '/profile', icon: <User size={18} /> },
    ];

    if (isOrganizer || isAdmin) {
        navLinks.push({ name: 'Dashboard', path: '/organizer', icon: <BarChart3 size={18} /> });
    }

    if (isAdmin) {
        navLinks.push({ name: 'Admin', path: '/admin', icon: <ShieldAlert size={18} /> });
    }

    if (isSuperAdmin) {
        navLinks.push({ name: 'Super Admin', path: '/super-admin', icon: <ShieldCheck size={18} className="text-rose-500" /> });
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 md:px-12 flex items-center justify-between ${scrolled ? 'h-16 glass-morphism' : 'h-20 bg-transparent'
                }`}
        >
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                    <Calendar className="text-white" size={20} />
                </div>
                <span className="text-2xl font-black font-['Space_Grotesk'] tracking-tighter text-text">Eventify</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                    const isActive = location.pathname === link.path;
                    return (
                        <button
                            key={link.name}
                            onClick={() => navigate(link.path)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-all ${isActive
                                    ? 'text-primary bg-primary/10'
                                    : 'text-text-dim hover:text-text hover:bg-white/5'
                                }`}
                        >
                            {link.icon}
                            {link.name}
                        </button>
                    );
                })}

                <div className="w-px h-6 bg-white/10 mx-4" />

                {(isOrganizer || isAdmin) && (
                    <button
                        onClick={() => navigate('/events/create')}
                        className="btn-primary flex items-center gap-2 mr-4"
                    >
                        <PlusCircle size={18} />
                        Create
                    </button>
                )}

                {user && (
                    <button
                        onClick={handleLogout}
                        className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text-dim hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                )}
            </div>

            <div className="md:hidden flex items-center gap-4">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-text"
                >
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-20 left-6 right-6 glass-morphism rounded-radius-lg p-6 flex flex-col gap-2 md:hidden overflow-hidden"
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
                                    className={`flex items-center gap-4 p-4 rounded-xl text-lg font-bold transition-all ${isActive ? 'text-primary bg-primary/10' : 'text-text-dim'
                                        }`}
                                >
                                    {link.icon}
                                    {link.name}
                                </button>
                            );
                        })}

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {(isOrganizer || isAdmin) && (
                                <button
                                    onClick={() => {
                                        navigate('/events/create');
                                        setIsOpen(false);
                                    }}
                                    className="bg-primary text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    <PlusCircle size={20} />
                                    <span>Create</span>
                                </button>
                            )}

                            {user && (
                                <button
                                    onClick={handleLogout}
                                    className="bg-rose-500/10 text-rose-500 p-4 rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    <LogOut size={20} />
                                    <span>Logout</span>
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
