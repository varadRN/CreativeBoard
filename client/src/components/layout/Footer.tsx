import { Link } from 'react-router-dom';
import { Github, Linkedin, Disc } from 'lucide-react'; // Disc as Discord placeholder
import { Logo } from '../shared/Logo';

export const Footer = () => {
    return (
        <footer className="bg-black border-t border-white/10 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12">
                    {/* Brand */}
                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <Logo size="md" />
                            <span className="text-xl font-bold text-white">CreativeBoard</span>
                        </Link>
                        <p className="text-gray-400 text-sm max-w-sm">
                            The free, open-source collaborative whiteboard for teams who dream big.
                        </p>
                    </div>

                    {/* Socials on top right or just here */}
                    <div className="flex gap-4 mt-6 md:mt-0">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Disc className="w-5 h-5" /></a>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>© {new Date().getFullYear()} CreativeBoard. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};
