import type { Metadata } from "next";
import { ProjectGallery } from "@/components/project-gallery";

// Nội dung đang là của Emotion, không cho index trước khi Demi thay.
export const metadata: Metadata = {
  title: "Work",
  robots: { index: false, follow: false },
};

export default function ProjectsPage() {
  return <ProjectGallery />;
}
