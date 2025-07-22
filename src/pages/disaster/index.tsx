import React from "react";
import { LanguageProvider } from "../../contexts/LanguageContext";
import { DisasterDetailMobilePage } from "../../components/pages/disaster/disaster-detail-mobile-page/disaster-detail-mobile-page";

export default function DisasterPage() {
  return (
    <LanguageProvider>
      <DisasterDetailMobilePage disasterId="demo-disaster" />
    </LanguageProvider>
  );
} 