import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight, Layout, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Logo } from '../shared/Logo';

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { label: 'Features', href: '#features' },
        { label: 'How it Works', href: '#how-it-works' },
        { label: 'Impact', href: '#community' },
    ];

    const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const targetId = href.replace('#', '');
        const elem = document.getElementById(targetId);
        if (elem) {
            const offset = 100; // Account for fixed navbar
            const bodyRect = document.body.getBoundingClientRect().top;
            const elemRect = elem.getBoundingClientRect().top;
            const elemPosition = elemRect - bodyRect;
            const offsetPosition = elemPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <header
            className={cn(
                "fixed top-4 left-1/2 -translate-x-1/2 -ml-[0.25px] w-[95%] max-w-7xl z-50 transition-all duration-300 rounded-2xl border",
                scrolled
                    ? "bg-black/60 backdrop-blur-xl border-white/10 shadow-lg shadow-purple-500/10 py-3"
                    : "bg-transparent border-transparent py-5"
            )}
        >
            <div className="px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <Logo size="md" />
                    <span className="text-xl font-bold text-white tracking-tight">
                        CreativeBoard
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <a
                            key={link.label}
                            href={link.href}
                            onClick={(e) => handleScrollTo(e, link.href)}
                            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-full transition-all flex items-center gap-1 group"
                        >
                            {link.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-4">
                    <Link
                        to="/login"
                        className="relative text-sm font-medium text-gray-300 hover:text-white transition-colors group"
                    >
                        Sign In
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full duration-300" />
                    </Link>
                    <motion.div
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95, y: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                        <Link
                            to="/register"
                            className="relative px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 flex items-center gap-2 overflow-hidden group"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Get Started
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                            {/* 3D Shine Effect */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out z-0" />
                            {/* Bottom 3D Border for depth */}
                            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/20" />
                        </Link>
                    </motion.div>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 text-gray-300 hover:text-white bg-white/5 rounded-lg backdrop-blur-sm"
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="absolute top-full left-0 right-0 mt-2 p-4 bg-[#0F0D1A]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                    >
                        <div className="space-y-2 flex flex-col">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={(e) => {
                                        setMobileMenuOpen(false);
                                        handleScrollTo(e, link.href);
                                    }}
                                    className="p-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <hr className="border-white/10 my-2" />
                            <Link
                                to="/login"
                                className="p-3 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 rounded-xl text-center"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="p-3 bg-primary text-white font-bold rounded-xl text-center hover:bg-primary-hover transition-colors"
                            >
                                Get Started Free
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
