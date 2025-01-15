import Astro from "@/components/landing-page/About";
import Faqs from "@/components/landing-page/Faq";
import Feature from "@/components/landing-page/Features";
import Footer from "@/components/landing-page/Footer";
import Intro from "@/components/landing-page/Intro";
import Joinus from "@/components/landing-page/Joinus";
import Roadmap from "@/components/landing-page/Roadmap";

export default function Home() {
  return (
    <div className="items-center justify-items-center gap-16 font-[family-name:var(--font-geist-sans)] w-full">
      <main className="flex flex-col">
        <Astro />
        <Intro />
        <Feature />
        <Roadmap />
        <Joinus />
        <Faqs />
      </main>
      <Footer />
    </div>
  );
}
