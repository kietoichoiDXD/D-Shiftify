import Header from '@/components/header-nav/header-nav'
import { CTASection } from '@/pages/home/components/cta-section'
import { FeaturesSection } from '@/pages/home/components/features-section'
import { FooterSection } from '@/pages/home/components/footer-section'
import { HeroSection } from '@/pages/home/components/hero-section'
import { TechStackSection } from '@/pages/home/components/tech-stack-section'

const HomePage = () => {
  return (
    <div className='min-h-screen bg-[#0A0A0C] text-white'>
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TechStackSection />
        <CTASection />
      </main>
      <FooterSection />
    </div>
  )
}

export default HomePage
