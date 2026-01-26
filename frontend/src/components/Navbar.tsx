import { useNavigate } from 'react-router-dom';
import { Calendar, User, Menu, X, PlusCircle, Ticket, ShieldAlert, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/AuthContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
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

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass-morphism h-16 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="text-white" size={18} />
                </div>
                <span className="text-xl font-bold font-['Space_Grotesk'] tracking-tight">Eventify</span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8">
                {navLinks.map((link) => (
                    <button
                        key={link.name}
                        onClick={() => navigate(link.path)}
                        className="text-text-dim hover:text-primary transition-colors flex items-center gap-2 font-medium"
                    >
                        {link.icon}
                        {link.name}
                    </button>
                ))}
                {(isOrganizer || isAdmin) && (
                    <button
                        onClick={() => navigate('/events/create')}
                        className="bg-primary hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        <PlusCircle size={18} />
                        Create Event
                    </button>
                )}
            </div>

            <div className="md:hidden">
                <button onClick={() => setIsOpen(!isOpen)} className="text-text">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-16 left-0 right-0 glass-morphism p-6 flex flex-col gap-4 md:hidden border-t border-glass-border"
                    >
                        {navLinks.map((link) => (
                            <button
                                key={link.name}
                                onClick={() => {
                                    navigate(link.path);
                                    setIsOpen(false);
                                }}
                                className="text-text-dim hover:text-primary transition-colors flex items-center gap-3 py-2 text-lg font-medium"
                            >
                                {link.icon}
                                {link.name}
                            </button>
                        ))}
                        {(isOrganizer || isAdmin) && (
                            <button
                                onClick={() => {
                                    navigate('/events/create');
                                    setIsOpen(false);
                                }}
                                className="bg-primary text-white p-3 rounded-lg font-semibold flex items-center justify-center gap-2 mt-2"
                            >
                                <PlusCircle size={20} />
                                Create Event
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
