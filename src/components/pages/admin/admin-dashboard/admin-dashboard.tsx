import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { useAdmin } from '../../../../contexts/AdminContext';
import { Users, Bell, MapPin, Calendar, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import disasterService from '../../../../utils/disasterService';


export function AdminDashboard() {
  const { users, notifications, locationNotifications } = useAdmin();

  const activeUsers = users.filter(u => u.notificationStatus === 'active').length;
  const expiredUsers = users.filter(u => u.notificationStatus === 'expired').length;
  const scheduledNotifications = notifications.filter(n => n.status === 'scheduled').length;
  const activeLocationNotifications = locationNotifications.filter(ln => ln.isActive).length;

  const todayNotifications = notifications.filter(n => {
    const today = new Date().toDateString();
    return new Date(n.createdAt).toDateString() === today;
  }).length;

  const countryStats = users.reduce((acc, user) => {
    acc[user.country] = (acc[user.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const disasterStats = disasterService.getStatistics();



  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl mb-2">ダッシュボード</h1>
        <p className="text-gray-600">Toyosu Spots 管理画面へようこそ</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">総ユーザー数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{users.length}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default">アクティブ: {activeUsers}</Badge>
              <Badge variant="secondary">期限切れ: {expiredUsers}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">通知管理</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{notifications.length}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">予約済み: {scheduledNotifications}</Badge>
              <Badge variant="default">今日: {todayNotifications}</Badge>
              <Badge variant="secondary">送信予定: {scheduledNotifications}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">位置通知</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{locationNotifications.length}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default">アクティブ: {activeLocationNotifications}</Badge>
            </div>
          </CardContent>
        </Card>



        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">災害情報</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{disasterStats.total}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="default">アクティブ: {disasterStats.active}</Badge>
              <Badge variant="destructive">緊急: {disasterStats.urgent}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">今日のアクセス</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{users.filter(u => {
              const today = new Date().toDateString();
              return new Date(u.lastAccess).toDateString() === today;
            }).length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              今日アクセスしたユーザー
            </p>
          </CardContent>
        </Card>


      </div>



      {/* 国別統計 */}
      <Card>
        <CardHeader>
          <CardTitle>国別ユーザー統計</CardTitle>
          <CardDescription>登録ユーザーの国別分布</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(countryStats).map(([country, count]) => (
              <div key={country} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-xl">{count}</div>
                <div className="text-sm text-gray-600">{country}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 最近の登録ユーザー */}
      <Card>
        <CardHeader>
          <CardTitle>最近の登録ユーザー</CardTitle>
          <CardDescription>新規登録されたユーザー</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users
              .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
              .slice(0, 5)
              .map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">ユーザーID: {user.id}</div>
                    <div className="text-sm text-gray-600">
                      {user.country} • 
                      {new Date(user.registrationDate).toLocaleString('ja-JP')}
                    </div>
                  </div>
                  <Badge variant={user.notificationStatus === 'active' ? 'default' : 'secondary'}>
                    {user.notificationStatus === 'active' ? 'アクティブ' : '期限切れ'}
                  </Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* 最近の通知活動 */}
      <Card>
        <CardHeader>
          <CardTitle>最近の通知活動</CardTitle>
          <CardDescription>システムの最新の通知状況</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div key={notification.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{notification.title}</div>
                  <div className="text-sm text-gray-600">
                    {notification.type === 'scheduled' ? '予約送信' : '即時送信'} • 
                    {new Date(notification.createdAt).toLocaleString('ja-JP')}
                  </div>
                </div>
                <Badge variant={notification.status === 'sent' ? 'default' : 'secondary'}>
                  {notification.status === 'sent' ? '送信済み' : notification.status === 'scheduled' ? '予約済み' : 'ドラフト'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}