import React from "react";
import { LanguageProvider } from "../../contexts/LanguageContext";
import { TouristMobilePage } from "../../components/pages/tourist/tourist-mobile-page/tourist-mobile-page";

export default function TouristPage() {
  return (
    <LanguageProvider>
      <TouristMobilePage />
    </LanguageProvider>
  );
} 