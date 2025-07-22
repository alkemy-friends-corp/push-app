import { useState, useEffect } from "react";
import { Card, CardContent } from "../../../ui/card";
import { WeatherAlert } from "../../../shared/weather-alert/weather-alert";
import { TouristForm } from "../../../shared/tourist-form/tourist-form";
import { PWAInstallGuide } from "../../../shared/pwainstall-guide/pwainstall-guide";
import { FloatingLanguageSelector } from "../../../shared/floating-language-selector/floating-language-selector";
import { HeroSection } from "../../../shared/hero-section/hero-section";
import { ServiceExplanation } from "../../../shared/service-explanation/service-explanation";
import { TouristMobilePage } from "../../../pages/tourist/tourist-mobile-page/tourist-mobile-page";
import { NotificationRedirectPage } from "../../../pages/notification/notification-redirect-page/notification-redirect-page";
import { ApiContentMobilePage } from "../../../shared/api-content-mobile-page/api-content-mobile-page";
import { LanguageProvider, useLanguage } from "../../../../contexts/LanguageContext";
import AdminApp from "../../../pages/admin/admin-app/admin-app";
import { Button } from "../../../ui/button";
import { Shield } from "lucide-react";

function AppContent() {
  const { t } = useLanguage();
  const [isFormCompleted, setIsFormCompleted] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [pageMode, setPageMode] = useState<'main' | 'mobile' | 'redirect' | 'api-content'>('main');
  const [redirectUrl, setRedirectUrl] = useState<string>('');
  const [notificationId, setNotificationId] = useState<string>('');

  const handleFormComplete = () => {
    setIsFormCompleted(true);
    // In a real app, this would save the user's preferences and enable notifications
  };

  // URLパラメータをチェックしてページモードを判定
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get('admin');
    const mobileParam = urlParams.get('mobile');
    const redirectParam = urlParams.get('redirect');
    const apiContentParam = urlParams.get('api-content');
    const disasterParam = urlParams.get('disaster');
    const urlParam = urlParams.get('url');
    const notificationParam = urlParams.get('notification');

    if (adminParam === 'true') {
      setIsAdminMode(true);
    } else if (mobileParam === 'true') {
      setPageMode('mobile');
    } else if (disasterParam) {
      setPageMode('redirect');
      setNotificationId(disasterParam);
    } else if (redirectParam === 'true') {
      setPageMode('redirect');
      if (urlParam) {
        setRedirectUrl(decodeURIComponent(urlParam));
      }
      if (notificationParam) {
        setNotificationId(notificationParam);
      }
    } else if (apiContentParam === 'true') {
      setPageMode('api-content');
    }
  }, []);

  // 管理画面モードの場合はAdminAppを表示
  if (isAdminMode) {
    return <AdminApp />;
  }

  // モバイル観光ページモード
  if (pageMode === 'mobile') {
    return <TouristMobilePage />;
  }

  // リダイレクトページモード（位置情報取得）
  if (pageMode === 'redirect') {
    // 災害情報IDが含まれている場合は災害詳細ページ
    const urlParams = new URLSearchParams(window.location.search);
    const disasterParam = urlParams.get('disaster');
    
    return (
      <NotificationRedirectPage 
        targetUrl={redirectUrl}
        notificationId={notificationId}
        disasterId={disasterParam || undefined}
      />
    );
  }

  // API コンテンツページモード
  if (pageMode === 'api-content') {
    const urlParams = new URLSearchParams(window.location.search);
    const contentType = urlParams.get('type') as 'weather' | 'general' || 'weather';
    const location = urlParams.get('location') || 'Toyosu,Tokyo,JP';
    const customTitle = urlParams.get('title') || undefined;
    const customMessage = urlParams.get('message') || undefined;

    return (
      <ApiContentMobilePage 
        contentType={contentType}
        location={location}
        customTitle={customTitle ? decodeURIComponent(customTitle) : undefined}
        customMessage={customMessage ? decodeURIComponent(customMessage) : undefined}
      />
    );
  }

  return (
    <div className="relative">
      {/* Floating Language Selector */}
      <FloatingLanguageSelector />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Content */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <div className="space-y-6">
            {/* Service Explanation */}
            <ServiceExplanation />

            {/* Tourist Information Form */}
            {!isFormCompleted ? (
              <TouristForm onComplete={handleFormComplete} />
            ) : (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🎉</div>
                    <h3 className="font-bold text-green-800 mb-2">{t('form.complete.title')}</h3>
                    <p className="text-green-700">
                      {t('form.complete.message')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* PWA Installation Guide */}
            <PWAInstallGuide />

            {/* Admin Access Button (Hidden) */}
            <div className="text-center py-4">
              <Button
                variant="ghost"
                
                onClick={() => setIsAdminMode(true)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                <Shield className="w-3 h-3 mr-1" />
                {t('admin.login.adminLogin')}
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground py-6">
              <p>{t('footer.enjoy')}</p>
              <p className="mt-1">{t('footer.support')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}