import React from "react";
import { LanguageProvider } from "../../contexts/LanguageContext";
import { AdminProvider } from "../../contexts/AdminContext";
import AdminApp from "../../components/pages/admin/admin-app/admin-app";

export default function AdminPage() {
  return (
    <LanguageProvider>
      <AdminProvider>
        <AdminApp />
      </AdminProvider>
    </LanguageProvider>
  );
} 