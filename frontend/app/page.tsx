import Hero from "../components/Hero";
import ProblemCards from "../components/ProblemCards";
import Engines from "../components/Engines";
import WhyChooseUs from "../components/WhyChooseUs";
import HowItWorks from "../components/HowItWorks";
import Audience from "../components/Audience";
import Faq from "../components/Faq";
import WaitlistCta from "../components/WaitlistCta";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <main className="overflow-hidden bg-paper">
      <Hero />
      <ProblemCards />
      <Engines />
      <WhyChooseUs />
      <HowItWorks />
      <Audience />
      <Faq />
      <WaitlistCta />
      <Footer />
    </main>
  );
}
