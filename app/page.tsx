import { Hero } from "@/components/hero";
import { Intro } from "@/components/intro";
import { Statement } from "@/components/statement";
import { Work } from "@/components/work";

export default function HomePage() {
  return (
    <>
      <Intro />
      <Hero />
      <Statement />
      <Work />
    </>
  );
}
