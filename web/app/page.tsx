import CTASection from "@/components/landing/CTASection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import GallerySection from "@/components/landing/GallerySection";
import HeroSection from "@/components/landing/HeroSection";

export default function Home() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      <HeroSection />
      <FeaturesSection />
      <GallerySection />
      <CTASection />
    </div>
  );
}
