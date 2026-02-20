import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

const questions = [
    { q: "Is CreativeBoard really free?", a: "Yes! Creating boards and inviting unlimited collaborators is 100% free." },
    { q: "Do I need to download anything?", a: "No. CreativeBoard works entirely in your browser. Just sign in and start creating." },
    { q: "Can I collaborate with others?", a: "Absolutely. Just share your board link and work together in real-time." },
    { q: "Is my data secure?", a: "We use industry-standard encryption to protect your data. Your boards are private by default." },
    { q: "Can I export my boards?", a: "Yes, you can export your boards as images or JSON data at any time." },
];

const FAQItem = ({ q, a }: any) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-white/10 last:border-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-6 flex items-center justify-between text-left group"
            >
                <span className="text-lg font-medium text-gray-200 group-hover:text-white transition-colors">{q}</span>
                <Plus className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-45 text-white' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-gray-400 leading-relaxed">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const FAQ = () => {
    return (
        <section id="faq" className="py-24 bg-black">
            <div className="max-w-3xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                </div>

                <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
                    {questions.map((item, i) => (
                        <FAQItem key={i} {...item} />
                    ))}
                </div>
            </div>
        </section>
    );
};
