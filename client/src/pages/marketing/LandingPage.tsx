import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/marketing/Hero';
import { Features } from '@/components/marketing/Features';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { Stats } from '@/components/marketing/Stats';
import { CTA } from '@/components/marketing/CTA';
import { Footer } from '@/components/layout/Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0F172A] via-[#1E1B4B] to-[#0F172A] text-gray-200 selection:bg-primary/30 overflow-x-hidden">
            <Navbar />
            <main>
                <Hero />
                <Stats />
                <Features />
                <HowItWorks />
                <CTA />
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
