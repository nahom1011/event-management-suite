import { ReactNode } from 'react';
import Navbar from './Navbar';
import { motion } from 'framer-motion';

interface LayoutProps {
    children: ReactNode;
    showNav?: boolean;
}

const Layout = ({ children, showNav = true }: LayoutProps) => {
    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col">
            {/* Background blobs for depth */}
            <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
            <div className="fixed bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full -z-10" />

            {showNav && <Navbar />}

            <main className={`flex-grow container mx-auto px-6 ${showNav ? 'pt-24 pb-12' : ''}`}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                >
                    {children}
                </motion.div>
            </main>

            <footer className="py-8 text-center text-text-dim text-sm mt-auto border-t border-white/5">
                &copy; {new Date().getFullYear()} Eventify. Built with passion.
            </footer>
        </div>
    );
};

export default Layout;
