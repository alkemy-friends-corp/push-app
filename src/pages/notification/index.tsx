import React from "react";
import { LanguageProvider } from "../../contexts/LanguageContext";
import { NotificationRedirectPage } from "../../components/pages/notification/notification-redirect-page/notification-redirect-page";

export default function NotificationPage() {
  return (
    <LanguageProvider>
      <NotificationRedirectPage />
    </LanguageProvider>
  );
} 