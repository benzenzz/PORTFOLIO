import type { Metadata } from "next";
import { MeadowLab } from "@/components/meadow-lab";

// Trang thử cảnh 3D, xóa khi phase 3 đưa cảnh lên trang chủ.
export const metadata: Metadata = {
  title: "Lab",
  robots: { index: false, follow: false },
};

export default function LabPage() {
  return <MeadowLab />;
}
