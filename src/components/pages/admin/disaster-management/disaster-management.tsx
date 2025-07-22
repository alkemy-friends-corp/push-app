
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { AlertTriangle, Bell, Clock, MapPin, Users, Send, RefreshCw, Eye, Filter, Calendar, TrendingUp, Activity, Smartphone, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import disasterService, { DisasterInfo, DisasterNotification } from '../../../../utils/disasterService';
import { useAdmin } from '../../../../contexts/AdminContext';
import { DisasterDetailMobilePage } from '../../disaster/disaster-detail-mobile-page/disaster-detail-mobile-page';
import { NotificationRedirectPage } from '../../notification/notification-redirect-page/notification-redirect-page';

// 統合された災害情報と通知のタイプ
type DisasterEntry = {
  id: string;
  type: 'disaster' | 'notification';
  disaster?: DisasterInfo;
  notification?: DisasterNotification;
  timestamp: string;
  title: string;
  severity: DisasterInfo['severity'];
  area?: string;
  status: 'active' | 'sent' | 'expired';
};

export function DisasterManagement() {
  const { addNotification } = useAdmin();
  const [disasters, setDisasters] = useState<DisasterInfo[]>([]);
  const [notifications, setNotifications] = useState<DisasterNotification[]>([]);
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterInfo | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [disasterToNotify, setDisasterToNotify] = useState<DisasterInfo | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'active' | 'urgent' | 'notifications'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('integrated');
  
  // モバイルプレビュー用の状態
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [previewEntry, setPreviewEntry] = useState<DisasterEntry | null>(null);

  // モバイルプレビューダイアログ
  const handleApiContentPreview = (contentType: 'weather' | 'general' = 'weather', customTitle?: string, customMessage?: string) => {
    const params = new URLSearchParams({
      'api-content': 'true',
      type: contentType,
      location: 'Toyosu,Tokyo,JP',
      ...(customTitle && { title: encodeURIComponent(customTitle) }),
      ...(customMessage && { message: encodeURIComponent(customMessage) })
    });
    window.open(`/?${params.toString()}`, '_blank');
  };

  // 災害情報の取得
  useEffect(() => {
    loadDisasters();
    loadNotifications();

    // 新しい災害情報の監視
    const handleNewDisaster = (disaster: DisasterInfo) => {
      setDisasters(prev => [disaster, ...prev]);

      // 緊急度の高い災害情報は自動で通知
      if (disaster.urgent || disaster.severity === 'emergency') {
        handleAutoNotification(disaster);
      }
    };

    disasterService.onNewDisaster(handleNewDisaster);
  }, []);

  const loadDisasters = () => {
    setIsLoading(true);
    try {
      const allDisasters = disasterService.getDisasters();
      setDisasters(allDisasters);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = () => {
    const allNotifications = disasterService.getNotifications();
    setNotifications(allNotifications);
  };

  // 統合されたエントリのリストを作成
  const getIntegratedEntries = (): DisasterEntry[] => {
    const entries: DisasterEntry[] = [];

    // 災害情報をエントリに変換
    disasters.forEach(disaster => {
      entries.push({
        id: disaster.id,
        type: 'disaster',
        disaster,
        timestamp: disaster.issuedAt,
        title: disaster.title,
        severity: disaster.severity,
        area: disaster.area,
        status: disaster.validUntil && new Date(disaster.validUntil) > new Date() ? 'active' : 'expired'
      });
    });

    // 通知をエントリに変換
    notifications.forEach(notification => {
      entries.push({
        id: notification.id,
        type: 'notification',
        notification,
        timestamp: notification.sentAt,
        title: notification.title,
        severity: notification.severity,
        area: notification.targetArea || '',
        status: 'sent'
      });
    });

    // 時間順でソート（新しい順）
    return entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const getFilteredEntries = () => {
    const entries = getIntegratedEntries();

    switch (filterType) {
      case 'active':
        return entries.filter(entry => 
          entry.type === 'disaster' && entry.status === 'active'
        );
      case 'urgent':
        return entries.filter(entry => 
          entry.type === 'disaster' && entry.disaster?.urgent
        );
      case 'notifications':
        return entries.filter(entry => entry.type === 'notification');
      default:
        return entries;
    }
  };

  const handleAutoNotification = async (disaster: DisasterInfo) => {
    try {
      const notification = await disasterService.sendDisasterNotification(disaster);

      // 管理システムにも通知を追加
      addNotification({
        title: disaster.title,
        message: notification.message,
        type: 'immediate',
        targetUsers: 'all',
        targetCountries: [],
        status: 'sent',
        sentAt: new Date().toISOString(),
        priority: disaster.severity === 'emergency' ? 'high' : 'medium',
        disasterId: disaster.id
      });

      setNotifications(prev => [notification, ...prev]);
      toast.success(`緊急災害情報「${disaster.title}」を自動送信しました`);
    } catch (error) {
      console.error('災害情報の自動通知に失敗しました:', error);
      toast.error('災害情報の自動通知に失敗しました');
    }
  };

  const handleManualNotification = async (disaster: DisasterInfo) => {
    try {
      const notification = await disasterService.sendDisasterNotification(disaster);

      // 管理システムにも通知を追加
      addNotification({
        title: disaster.title,
        message: notification.message,
        type: 'immediate',
        targetUsers: 'all',
        targetCountries: [],
        status: 'sent',
        sentAt: new Date().toISOString(),
        priority: disaster.severity === 'emergency' ? 'high' : 'medium',
        disasterId: disaster.id
      });

      setNotifications(prev => [notification, ...prev]);
      toast.success(`災害情報「${disaster.title}」を送信しました`);
    } catch (error) {
      console.error('災害情報の送信に失敗しました:', error);
      toast.error('災害情報の送信に失敗しました');
    }
  };

  const handleSendNotification = (disaster: DisasterInfo) => {
    setDisasterToNotify(disaster);
    setConfirmDialogOpen(true);
  };

  const confirmSendNotification = async () => {
    if (disasterToNotify) {
      await handleManualNotification(disasterToNotify);
      setConfirmDialogOpen(false);
      setDisasterToNotify(null);
    }
  };

  const handleViewDetails = (disaster: DisasterInfo) => {
    setSelectedDisaster(disaster);
    setDetailDialogOpen(true);
  };

  const handleMobilePreview = (entry: DisasterEntry) => {
    setPreviewEntry(entry);
    setMobilePreviewOpen(true);
  };

  const getSeverityColor = (severity: DisasterInfo['severity']) => {
    switch (severity) {
      case 'emergency':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'advisory':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityLabel = (severity: DisasterInfo['severity']) => {
    switch (severity) {
      case 'emergency':
        return '特別警報';
      case 'warning':
        return '警報';
      case 'advisory':
        return '注意報';
      default:
        return '情報';
    }
  };

  const getTypeLabel = (type: DisasterInfo['type']) => {
    const labels = {
      earthquake: '地震',
      heavyRain: '大雨',
      tsunami: '津波',
      typhoon: '台風',
      landslide: '土砂災害',
      flood: '洪水',
      storm: '暴風'
    };
    return labels[type] || type;
  };

  const getStatusBadge = (entry: DisasterEntry) => {
    if (entry.type === 'disaster') {
      if (entry.disaster?.urgent) {
        return <Badge variant="destructive" className="text-xs">緊急</Badge>;
      }
      return entry.status === 'active' ? 
        <Badge variant="outline" className="text-xs text-green-600">有効</Badge> :
        <Badge variant="outline" className="text-xs text-gray-600">期限切れ</Badge>;
    } else {
      return <Badge variant="secondary" className="text-xs">送信済み</Badge>;
    }
  };

  const statistics = disasterService.getStatistics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">災害情報管理</h1>
          <p className="text-gray-600">災害情報の監視・通知・管理</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadDisasters} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? '更新中...' : '更新'}
          </Button>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総災害情報数</p>
                <p className="text-2xl">{statistics.total}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">アクティブ</p>
                <p className="text-2xl text-green-600">{statistics.active}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">緊急情報</p>
                <p className="text-2xl text-red-600">{statistics.urgent}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">通知送信数</p>
                <p className="text-2xl">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* API コンテンツプレビューボタン */}
      <Card>
        <CardHeader>
          <CardTitle>API コンテンツプレビュー</CardTitle>
          <CardDescription>
            定期通知や API データのモバイル表示をプレビューします
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => handleApiContentPreview('weather')}
              className="flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              天気情報プレビュー
            </Button>
            <Button
              variant="outline"
              onClick={() => handleApiContentPreview('weather', '豊洲の天気情報', '今日の天気をお知らせします')}
              className="flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              カスタム天気通知
            </Button>
            <Button
              variant="outline"
              onClick={() => handleApiContentPreview('general', 'おすすめ情報', 'API取得のカスタムコンテンツです')}
              className="flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4" />
              一般APIコンテンツ
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="integrated">統合一覧</TabsTrigger>
          <TabsTrigger value="separate">個別管理</TabsTrigger>
        </TabsList>

        <TabsContent value="integrated" className="space-y-6">
          {/* フィルター */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">フィルター:</span>
            <div className="flex gap-2">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                
                onClick={() => setFilterType('all')}
              >
                すべて ({getIntegratedEntries().length})
              </Button>
              <Button
                variant={filterType === 'active' ? 'default' : 'outline'}
                
                onClick={() => setFilterType('active')}
              >
                アクティブ ({statistics.active})
              </Button>
              <Button
                variant={filterType === 'urgent' ? 'default' : 'outline'}
                
                onClick={() => setFilterType('urgent')}
              >
                緊急 ({statistics.urgent})
              </Button>
              <Button
                variant={filterType === 'notifications' ? 'default' : 'outline'}
                
                onClick={() => setFilterType('notifications')}
              >
                通知履歴 ({notifications.length})
              </Button>
            </div>
          </div>

          {/* 統合一覧 */}
          <Card>
            <CardHeader>
              <CardTitle>災害情報・通知統合一覧</CardTitle>
              <CardDescription>
                災害情報と送信済み通知を時系列で統合表示
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>種別</TableHead>
                      <TableHead>タイトル</TableHead>
                      <TableHead>重要度</TableHead>
                      <TableHead>対象地域</TableHead>
                      <TableHead>日時</TableHead>
                      <TableHead>状態</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredEntries().map((entry) => (
                      <TableRow key={`${entry.type}-${entry.id}`}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {entry.type === 'disaster' ? (
                              <>
                                <span className="text-xl">{disasterService.getDisasterIcon(entry.disaster!.type)}</span>
                                <span className="text-sm">{getTypeLabel(entry.disaster!.type)}</span>
                              </>
                            ) : (
                              <>
                                <Bell className="w-4 h-4 text-blue-600" />
                                <span className="text-sm">通知</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{entry.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {entry.type === 'disaster' 
                                ? entry.disaster!.description 
                                : entry.notification!.message.split('\n')[0]
                              }
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(entry.severity)}>
                            {getSeverityLabel(entry.severity)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{entry.area || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(entry.timestamp).toLocaleString('ja-JP')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(entry)}
                            {entry.type === 'notification' && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Users className="w-3 h-3" />
                                {entry.notification!.recipientCount.toLocaleString()}人
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              
                              variant="outline"
                              onClick={() => handleMobilePreview(entry)}
                              title="モバイルプレビュー"
                            >
                              <Smartphone className="w-3 h-3" />
                            </Button>
                            {entry.type === 'disaster' && (
                              <>
                                <Button
                                  
                                  variant="outline"
                                  onClick={() => handleViewDetails(entry.disaster!)}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button
                                  
                                  variant="outline"
                                  onClick={() => handleSendNotification(entry.disaster!)}
                                >
                                  <Send className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            {entry.type === 'notification' && false && (
                              <Button
                                
                                variant="outline"
                                onClick={() => {}}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="separate" className="space-y-6">
          {/* 災害情報一覧 */}
          <Card>
            <CardHeader>
              <CardTitle>災害情報一覧</CardTitle>
              <CardDescription>
                リアルタイムで監視している災害情報の一覧
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>種類</TableHead>
                      <TableHead>タイトル</TableHead>
                      <TableHead>重要度</TableHead>
                      <TableHead>対象地域</TableHead>
                      <TableHead>発表時刻</TableHead>
                      <TableHead>状態</TableHead>
                      <TableHead>操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {disasters.map((disaster) => (
                      <TableRow key={disaster.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{disasterService.getDisasterIcon(disaster.type)}</span>
                            <span className="text-sm">{getTypeLabel(disaster.type)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{disaster.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {disaster.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(disaster.severity)}>
                            {getSeverityLabel(disaster.severity)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{disaster.area}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(disaster.issuedAt).toLocaleString('ja-JP')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {disaster.urgent && (
                              <Badge variant="destructive" className="text-xs">
                                緊急
                              </Badge>
                            )}
                            {disaster.validUntil && new Date(disaster.validUntil) > new Date() && (
                              <Badge variant="outline" className="text-xs">
                                有効
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              
                              variant="outline"
                              onClick={() => window.open(`/?disaster=${disaster.id}`, '_blank')}
                              title="モバイルプレビュー"
                            >
                              <Smartphone className="w-3 h-3" />
                            </Button>
                            <Button
                              
                              variant="outline"
                              onClick={() => handleViewDetails(disaster)}
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              
                              variant="outline"
                              onClick={() => handleSendNotification(disaster)}
                            >
                              <Send className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* 通知履歴 */}
          <Card>
            <CardHeader>
              <CardTitle>通知履歴</CardTitle>
              <CardDescription>
                送信された災害情報通知の履歴
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.slice(0, 10).map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{notification.title}</span>
                        <Badge className={getSeverityColor(notification.severity)}>
                          {getSeverityLabel(notification.severity)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message.split('\n')[0]}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(notification.sentAt).toLocaleString('ja-JP')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {notification.recipientCount.toLocaleString()}人
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        
                        variant="outline"
                        onClick={() => {
                          const redirectUrl = '';
                          const params = new URLSearchParams({
                            redirect: 'true',
                            notification: notification.id
                          });
                          if (redirectUrl) {
                            params.set('url', encodeURIComponent(redirectUrl));
                          }
                          window.open(`/?${params.toString()}`, '_blank');
                        }}
                        title="モバイルプレビュー"
                      >
                        <Smartphone className="w-3 h-3" />
                      </Button>
                      {false && (
                        <Button
                          
                          variant="outline"
                          onClick={() => {}}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 詳細ダイアログ */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDisaster && disasterService.getDisasterIcon(selectedDisaster.type)}
              {selectedDisaster?.title}
            </DialogTitle>
            <DialogDescription>
              災害情報の詳細
            </DialogDescription>
          </DialogHeader>
          {selectedDisaster && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">種類</label>
                  <p className="text-sm text-gray-600">{getTypeLabel(selectedDisaster.type)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">重要度</label>
                  <div className="mt-1">
                    <Badge className={getSeverityColor(selectedDisaster.severity)}>
                      {getSeverityLabel(selectedDisaster.severity)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">対象地域</label>
                  <p className="text-sm text-gray-600">{selectedDisaster.area}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">発表機関</label>
                  <p className="text-sm text-gray-600">{selectedDisaster.source}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">発表時刻</label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedDisaster.issuedAt).toLocaleString('ja-JP')}
                  </p>
                </div>
                {selectedDisaster.validUntil && (
                  <div>
                    <label className="text-sm font-medium">有効期限</label>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedDisaster.validUntil).toLocaleString('ja-JP')}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">概要</label>
                <p className="text-sm text-gray-600 mt-1">{selectedDisaster.description}</p>
              </div>

              {selectedDisaster.details && (
                <div>
                  <label className="text-sm font-medium">詳細情報</label>
                  <div className="mt-1 space-y-1">
                    {selectedDisaster.details.magnitude && (
                      <p className="text-sm text-gray-600">
                        マグニチュード: {selectedDisaster.details.magnitude}
                      </p>
                    )}
                    {selectedDisaster.details.depth && (
                      <p className="text-sm text-gray-600">
                        深さ: {selectedDisaster.details.depth}km
                      </p>
                    )}
                    {selectedDisaster.details.epicenter && (
                      <p className="text-sm text-gray-600">
                        震源地: {selectedDisaster.details.epicenter}
                      </p>
                    )}
                    {selectedDisaster.details.rainfallAmount && (
                      <p className="text-sm text-gray-600">
                        予想雨量: {selectedDisaster.details.rainfallAmount}mm/h
                      </p>
                    )}
                    {selectedDisaster.details.windSpeed && (
                      <p className="text-sm text-gray-600">
                        最大風速: {selectedDisaster.details.windSpeed}m/s
                      </p>
                    )}
                    {selectedDisaster.details.waveHeight && (
                      <p className="text-sm text-gray-600">
                        予想津波高: {selectedDisaster.details.waveHeight}m
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedDisaster.instructions && selectedDisaster.instructions.length > 0 && (
                <div>
                  <label className="text-sm font-medium">行動指針</label>
                  <ul className="mt-1 space-y-1 text-sm text-gray-600">
                    {selectedDisaster.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 font-medium">{index + 1}.</span>
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDisaster.affectedPopulation && (
                <div>
                  <label className="text-sm font-medium">影響人口</label>
                  <p className="text-sm text-gray-600">
                    約{selectedDisaster.affectedPopulation.toLocaleString()}人
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 通知確認ダイアログ */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>通知送信の確認</DialogTitle>
            <DialogDescription>
              この災害情報を全ユーザーに送信しますか？
            </DialogDescription>
          </DialogHeader>
          {disasterToNotify && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{disasterService.getDisasterIcon(disasterToNotify.type)}</span>
                  <span className="font-medium">{disasterToNotify.title}</span>
                  <Badge className={getSeverityColor(disasterToNotify.severity)}>
                    {getSeverityLabel(disasterToNotify.severity)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{disasterToNotify.description}</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={confirmSendNotification}>
                  <Send className="w-4 h-4 mr-2" />
                  送信
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* モバイルプレビューダイアログ */}
      <Dialog open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
        <DialogContent className="max-w-md p-0 gap-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              モバイルプレビュー
            </DialogTitle>
            <DialogDescription>
              {previewEntry && (
                <span>
                  「{previewEntry.title}」の{previewEntry.type === 'disaster' ? '災害情報詳細' : '通知リダイレクト'}ページ
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="border-t">
            <div className="h-[600px] overflow-auto">
              {previewEntry?.type === 'disaster' && previewEntry.disaster ? (
                <DisasterDetailMobilePage 
                  disasterId={previewEntry.disaster.id}
                  isPreview={true}
                />
              ) : previewEntry?.type === 'notification' && previewEntry.notification ? (
                <NotificationRedirectPage 
                  targetUrl={''}
                  notificationId={previewEntry.notification.id}
                  isPreview={true}
                />
              ) : (
                <div className="p-6 text-center text-gray-500">
                  プレビューデータがありません
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
