import { Hero } from "@/components/home/Hero";
import { FeaturedCourses } from "@/components/home/FeaturedCourses";
import { HowItWorks } from "@/components/home/HowItWorks";

export default function HomePage() {
  return (
    <>
      <Hero/>
      <FeaturedCourses />
      <HowItWorks />
    </>
  );
}