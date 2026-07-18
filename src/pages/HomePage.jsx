import Hero from '../components/Hero'
import About from '../components/About'
import Services from '../components/Services'
import InvitationCardTeaser from '../components/InvitationCardTeaser'
import BudgetSimulator from '../components/BudgetSimulator'
import Gallery from '../components/Gallery'
import Testimonials from '../components/Testimonials'
import Contact from '../components/Contact'
import FloralDivider from '../components/FloralDivider'

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <InvitationCardTeaser />
      <BudgetSimulator />
      <Gallery />
      <Testimonials />
      <Contact />
      <FloralDivider />
    </>
  )
}
