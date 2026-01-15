import Footer from "@/components/Footer";
import HeroSection from "@/components/sections/HeroSection";
import Navbar from "@/components/Navbar";
import CategorySection from "@/components/sections/CategorySection";
import AboutSection from "@/components/sections/AboutSection";
import TestiSection from "@/components/sections/TestiSection";
import DataSection from "@/components/sections/DataSection";
import ReasonSection from "@/components/sections/ReasonSection";
import KatalogSection from "@/components/sections/KatalogSection";

export default function Home() {
  return (
   <>
    <Navbar />
    <HeroSection />
    <CategorySection />
    <KatalogSection />
    <AboutSection />
    <ReasonSection />
    <DataSection />
    <TestiSection />
    <Footer />
    </>
  );
}
