import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const testimonials = [
    {
        name: "Sarah Chen",
        role: "Product Designer",
        avatar: "S",
        color: "bg-blue-500",
        quote: "CreativeBoard has completely changed how our remote team collaborates. The infinite canvas is a game changer."
    },
    {
        name: "Alex Rivera",
        role: "Engineering Lead",
        avatar: "A",
        color: "bg-purple-500",
        quote: "Finally, a whiteboard tool that doesn't feel clunky. It's fast, intuitive, and most importantly, free."
    },
    {
        name: "Emily Watson",
        role: "Marketing Director",
        avatar: "E",
        color: "bg-green-500",
        quote: "I use it for everything from strategy planning to mood boards. The real-time collaboration is silky smooth."
    }
];

export const Testimonials = () => {
    return (
        <section className="py-24 bg-gradient-to-b from-black to-gray-900 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Loved by Creators</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: i * 0.2 }}
                            viewport={{ once: true }}
                            className="bg-white/5 border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors"
                        >
                            <div className="flex gap-1 mb-4 text-yellow-500">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <p className="text-gray-300 mb-6 text-lg leading-relaxed">"{t.quote}"</p>

                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold`}>
                                    {t.avatar}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">{t.name}</h4>
                                    <p className="text-sm text-gray-500">{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
