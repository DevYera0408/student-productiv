import { Outlet } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <main className="min-h-[calc(100vh-64px)]">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
