import React from "react";
import { AgencyMasterConsole } from "@/components/AgencyMasterConsole";
import LandingFooter from "@/components/LandingFooter";

export const metadata = {
  title: "Agency Master Console | VaniEdge",
};

export default function AgencyPage() {
  return (
    <main className="min-h-screen bg-black selection:bg-white/20">
      <div className="pt-24 pb-12 max-w-6xl mx-auto px-4 sm:px-6">
        <AgencyMasterConsole />
      </div>
      <LandingFooter />
    </main>
  );
}
