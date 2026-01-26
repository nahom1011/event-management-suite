import type { ReactNode } from 'react';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

interface LayoutProps {
    children: ReactNode;
    showNav?: boolean;
}

const Layout = ({ children, showNav = true }: LayoutProps) => {
    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col selection:bg-primary/30 selection:text-white">
            {/* Soft Ambient Glows */}
            <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[120px] rounded-full -z-10 animate-pulse" />
            <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 blur-[120px] rounded-full -z-10" />
            <div className="fixed top-[20%] right-[10%] w-[30%] h-[30%] bg-blue-600/5 blur-[100px] rounded-full -z-10" />

            {showNav && <Navbar />}

            <main className={`flex-grow container mx-auto px-4 md:px-8 ${showNav ? 'pt-28 pb-16' : ''}`}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    {children}
                </motion.div>
            </main>

            <footer className="py-12 border-t border-white/[0.03] backdrop-blur-sm">
                <div className="container mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-text-dim text-xs uppercase tracking-widest font-medium">
                    <div>&copy; {new Date().getFullYear()} Eventify. Digital Experience.</div>
                    <div className="flex gap-8">
                        <span className="hover:text-text cursor-pointer transition-colors">Privacy</span>
                        <span className="hover:text-text cursor-pointer transition-colors">Terms</span>
                        <span className="hover:text-text cursor-pointer transition-colors">Contact</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
