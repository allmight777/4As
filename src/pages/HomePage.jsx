import Hero from '../components/Hero'
import About from '../components/About'
import Services from '../components/Services'
import BudgetSimulator from '../components/BudgetSimulator'
import Gallery from '../components/Gallery'
import Testimonials from '../components/Testimonials'
import Contact from '../components/Contact'

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <BudgetSimulator />
      <Gallery />
      <Testimonials />
      <Contact />
    </>
  )
}
