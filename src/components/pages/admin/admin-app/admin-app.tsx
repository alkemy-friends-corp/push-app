import React, { useState } from 'react';
import { AdminProvider, useAdmin } from '../../../../contexts/AdminContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { AdminLogin } from '../admin-login/admin-login';
import { AdminDashboard } from '../admin-dashboard/admin-dashboard';
import { UserManagement } from '../user-management/user-management';
import { NotificationSender } from '../notification-sender/notification-sender';
import { ScheduledNotifications } from '../scheduled-notifications/scheduled-notifications';
import { MapManagement } from '../map-management/map-management';
import { DisasterManagement } from '../disaster-management/disaster-management';
import { LanguageSelector } from '../../../shared/language-selector/language-selector';
import { Button } from '../../../ui/button';
import { Separator } from '../../../ui/separator';
import { Badge } from '../../../ui/badge';
import { 
  LayoutDashboard, 
  Users, 
  Bell, 
  MapPin, 
  LogOut, 
  Menu,
  X,
  ArrowLeft,
  Map,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { Toaster } from 'sonner';

type Page = 'dashboard' | 'users' | 'notifications' | 'scheduled' | 'map' | 'disaster';

function AdminLayout() {
  const { logout, users, notifications, locationNotifications, areas } = useAdmin();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeUsers = users.filter(u => u.notificationStatus === 'active').length;
  const scheduledNotifications = notifications.filter(n => n.status === 'scheduled').length;
  const activeLocationNotifications = locationNotifications.filter(ln => ln.isActive).length;
  const totalMapPoints = locationNotifications.length + areas.length;
  const urgentDisasters = 3; // 災害情報の緊急件数 (実際の値はdisasterServiceから取得)

  const menuItems = [
    {
      id: 'dashboard' as Page,
      label: t('admin.menu.dashboard'),
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'users' as Page,
      label: t('admin.menu.users'),
      icon: Users,
      badge: activeUsers
    },
    {
      id: 'notifications' as Page,
      label: t('admin.menu.notifications'),
      icon: Bell,
      badge: scheduledNotifications
    },
    {
      id: 'scheduled' as Page,
      label: t('admin.menu.scheduled'),
      icon: Clock,
      badge: null
    },
    {
      id: 'map' as Page,
      label: t('admin.menu.map'),
      icon: Map,
      badge: totalMapPoints
    },
    {
      id: 'disaster' as Page,
      label: t('admin.menu.disaster'),
      icon: AlertTriangle,
      badge: urgentDisasters
    }
  ];

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'notifications':
        return <NotificationSender />;
      case 'scheduled':
        return <ScheduledNotifications />;
      case 'map':
        return <MapManagement />;
      case 'disaster':
        return <DisasterManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* モバイル用オーバーレイ */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <div className={`
        fixed lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        w-64 bg-white shadow-lg z-30 flex flex-col h-full
      `}>
        {/* ヘッダー */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-xl">{t('app.title')}</h1>
            <Button
              variant="ghost"
              
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">{t('admin.title')}</p>
        </div>

        {/* ナビゲーション */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon className="w-4 h-4 mr-3" />
                {item.label}
                {item.badge !== null && item.badge > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </nav>

        <Separator />

        {/* 言語セレクター */}
        <div className="p-4">
          <LanguageSelector />
        </div>

        <Separator />

        {/* アクション */}
        <div className="p-4 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              // メインアプリに戻る
              const url = new URL(window.location.href);
              url.searchParams.delete('admin');
              window.location.href = url.toString();
            }}
          >
            <ArrowLeft className="w-4 h-4 mr-3" />
            {t('admin.returnToMain')}
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            {t('admin.logout')}
          </Button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* トップバー */}
        <header className="bg-white shadow-sm border-b px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {t('admin.lastUpdated')}: {new Date().toLocaleString('ja-JP')}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">{t('admin.systemStatus')}</span>
            </div>
          </div>
        </header>

        {/* メインコンテンツエリア */}
        <main className="flex-1 overflow-auto p-6">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}

export default function AdminApp() {
  return (
    <AdminProvider>
      <AdminContent />
      <Toaster position="top-right" />
    </AdminProvider>
  );
}

function AdminContent() {
  const { isAuthenticated } = useAdmin();
  
  if (!isAuthenticated) {
    return <AdminLogin />;
  }
  
  return <AdminLayout />;
}