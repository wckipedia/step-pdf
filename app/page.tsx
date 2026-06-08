import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Ticker from "@/components/Ticker";
import ConversionFlow from "@/components/ConversionFlow";
import ToolGrid from "@/components/ToolGrid";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Ticker />
        <ConversionFlow />
        <ToolGrid />
        <HowItWorks />
        <Ticker />
      </main>
      <Footer />
    </>
  );
}
