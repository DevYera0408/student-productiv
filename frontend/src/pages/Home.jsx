import Hero from "../sections/Hero";
import Features from "../sections/Features";
import Statistics from "../sections/Statistics";
import Testimonials from "../sections/Testimonials";
import FAQ from "../sections/FAQ";
import Contact from "../sections/Contact";
import DashboardPreview from "../sections/DashboardPreview";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <Statistics />
      <DashboardPreview />
      <Testimonials />
      <FAQ />
      <Contact />
    </>
  );
}
