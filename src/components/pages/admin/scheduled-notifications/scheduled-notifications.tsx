import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Textarea } from '../../../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../ui/dialog';
import { Label } from '../../../ui/label';
import { Switch } from '../../../ui/switch';
import { useAdmin } from '../../../../contexts/AdminContext';
import { Clock, Cloud, Sun, CloudRain, Plus, Edit, Trash2, Play, Pause, Settings, AlertCircle, Smartphone, Eye } from 'lucide-react';
import { toast } from 'sonner';
import WeatherService, { WeatherData } from '../../../../utils/weatherService';
import { TouristMobilePage } from '../../tourist/tourist-mobile-page/tourist-mobile-page';
import { ApiContentMobilePage } from '../../../shared/api-content-mobile-page/api-content-mobile-page';

interface ScheduledNotification {
  id: string;
  title: string;
  messageTemplate: string;
  type: 'weather' | 'custom';
  schedule: {
    time: string; // "09:00" format
    days: string[]; // ["monday", "tuesday", etc.]
    timezone: string;
  };
  isActive: boolean;
  lastSent?: string;
  nextSend?: string;
  targetUsers: 'all' | 'countries';
  targetCountries: string[];
  createdAt: string;
  updatedAt: string;
}

export function ScheduledNotifications() {
  const { users, addNotification, getAvailableCountries, getUserCountsByCountry } = useAdmin();
  
  // サンプルデータを含む初期状態
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([
    {
      id: 'sample-weather-notification',
      title: '豊洲の天気情報',
      messageTemplate: 'おはようございます！今日（{{date}}）の豊洲の天気は{{condition}}、気温{{temperature}}℃です。{{description}} 素敵な一日をお過ごしください！',
      type: 'weather',
      schedule: {
        time: '09:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timezone: 'Asia/Tokyo'
      },
      isActive: true,
      targetUsers: 'all',
      targetCountries: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      nextSend: (() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        return tomorrow.toISOString();
      })()
    }
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewNotification, setPreviewNotification] = useState<ScheduledNotification | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    messageTemplate: '',
    type: 'weather' as 'weather' | 'custom',
    time: '09:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as string[],
    timezone: 'Asia/Tokyo',
    targetUsers: 'all' as 'all' | 'countries',
    targetCountries: [] as string[],
    isActive: true
  });

  // Template variables for display
  const templateVariables = "{{date}}, {{temperature}}, {{condition}}, {{humidity}}, {{windSpeed}}, {{description}}";
  const weatherPlaceholder = "おはようございます！今日（{{date}}）の豊洲の天気は{{condition}}、気温{{temperature}}℃です。{{description}}";

  // 天気データを取得する関数
  const fetchWeatherData = async (): Promise<WeatherData> => {
    setIsLoadingWeather(true);
    try {
      const weatherData = await WeatherService.getWeatherData('Toyosu,Tokyo,JP');
      return weatherData;
    } catch (error) {
      console.error('天気データの取得に失敗しました:', error);
      throw error;
    } finally {
      setIsLoadingWeather(false);
    }
  };

  // 天気情報を含むメッセージを生成
  const generateWeatherMessage = (template: string, weather: WeatherData): string => {
    return WeatherService.generateWeatherMessage(template, weather);
  };

  // 定期通知の実行チェック
  const checkScheduledNotifications = async () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    for (const notification of scheduledNotifications) {
      if (!notification.isActive) continue;
      
      const shouldSend = notification.schedule.days.includes(currentDay) && 
                        notification.schedule.time === currentTime;
      
      if (shouldSend) {
        try {
          let message = notification.messageTemplate;
          
          if (notification.type === 'weather') {
            const weather = await fetchWeatherData();
            message = generateWeatherMessage(notification.messageTemplate, weather);
          }
          
          // 実際の通知送信
          addNotification({
            title: notification.title,
            message: message,
            type: 'immediate',
            targetUsers: notification.targetUsers,
            targetCountries: notification.targetCountries,
            status: 'sent',
            sentAt: new Date().toISOString(),
            scheduledNotificationId: notification.id
          });
          
          // 最終送信日時を更新
          setScheduledNotifications(prev => 
            prev.map(n => 
              n.id === notification.id 
                ? { ...n, lastSent: new Date().toISOString() }
                : n
            )
          );
          
          toast.success(`定期通知「${notification.title}」を送信しました`);
        } catch (error) {
          console.error('定期通知の送信に失敗しました:', error);
          toast.error(`定期通知「${notification.title}」の送信に失敗しました`);
        }
      }
    }
  };

  // 定期的にチェック（実際の本番環境では適切なcronジョブを使用）
  useEffect(() => {
    const interval = setInterval(checkScheduledNotifications, 60000); // 1分ごとにチェック
    return () => clearInterval(interval);
  }, [scheduledNotifications]);

  // 次回送信日時を計算
  const calculateNextSend = (schedule: ScheduledNotification['schedule']): string => {
    const now = new Date();
    const [hours, minutes] = schedule.time.split(':').map(Number);
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(now.getDate() + i);
      const dayName = checkDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      if (schedule.days.includes(dayName)) {
        checkDate.setHours(hours, minutes, 0, 0);
        if (checkDate > now) {
          return checkDate.toISOString();
        }
      }
    }
    
    return '';
  };

  const resetForm = () => {
    setFormData({
      title: '',
      messageTemplate: '',
      type: 'weather',
      time: '09:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      timezone: 'Asia/Tokyo',
      targetUsers: 'all',
      targetCountries: [],
      isActive: true
    });
    setEditingNotification(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newNotification: ScheduledNotification = {
      id: editingNotification || Date.now().toString(),
      title: formData.title,
      messageTemplate: formData.messageTemplate,
      type: formData.type,
      schedule: {
        time: formData.time,
        days: formData.days,
        timezone: formData.timezone
      },
      isActive: formData.isActive,
      targetUsers: formData.targetUsers,
      targetCountries: formData.targetCountries,
      createdAt: editingNotification ? 
        scheduledNotifications.find(n => n.id === editingNotification)?.createdAt || new Date().toISOString() :
        new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    newNotification.nextSend = calculateNextSend(newNotification.schedule);

    if (editingNotification) {
      setScheduledNotifications(prev => 
        prev.map(n => n.id === editingNotification ? newNotification : n)
      );
      toast.success('定期通知を更新しました');
    } else {
      setScheduledNotifications(prev => [...prev, newNotification]);
      toast.success('定期通知を作成しました');
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (notification: ScheduledNotification) => {
    setEditingNotification(notification.id);
    setFormData({
      title: notification.title,
      messageTemplate: notification.messageTemplate,
      type: notification.type,
      time: notification.schedule.time,
      days: notification.schedule.days,
      timezone: notification.schedule.timezone,
      targetUsers: notification.targetUsers,
      targetCountries: notification.targetCountries,
      isActive: notification.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('この定期通知を削除してもよろしいですか？')) {
      setScheduledNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('定期通知を削除しました');
    }
  };

  const handleToggleActive = (id: string) => {
    setScheduledNotifications(prev => 
      prev.map(n => 
        n.id === id 
          ? { ...n, isActive: !n.isActive, updatedAt: new Date().toISOString() }
          : n
      )
    );
  };

  const handleTestWeather = async () => {
    try {
      const weather = await fetchWeatherData();
      setWeatherData(weather);
      toast.success('天気データを取得しました');
    } catch (error) {
      toast.error('天気データの取得に失敗しました');
    }
  };

  const handlePreview = (notification: ScheduledNotification) => {
    setPreviewNotification(notification);
    setPreviewDialogOpen(true);
  };

  const dayOptions = [
    { value: 'monday', label: '月曜日' },
    { value: 'tuesday', label: '火曜日' },
    { value: 'wednesday', label: '水曜日' },
    { value: 'thursday', label: '木曜日' },
    { value: 'friday', label: '金曜日' },
    { value: 'saturday', label: '土曜日' },
    { value: 'sunday', label: '日曜日' }
  ];

  const activeUsers = users.filter(u => u.notificationStatus === 'active').length;
  const availableCountries = getAvailableCountries();
  const userCountsByCountry = getUserCountsByCountry();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">定期通知管理</h1>
          <p className="text-gray-600">天気情報などの定期通知を自動送信</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestWeather} disabled={isLoadingWeather}>
            <Cloud className="w-4 h-4 mr-2" />
            {isLoadingWeather ? '取得中...' : '天気テスト'}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                新規定期通知
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {editingNotification ? '定期通知を編集' : '新規定期通知作成'}
                </DialogTitle>
                <DialogDescription>
                  定期的に自動送信される通知を設定してください
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">通知タイトル</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="豊洲の天気情報"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">通知タイプ</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weather">天気情報</SelectItem>
                        <SelectItem value="custom">カスタム</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="messageTemplate">メッセージテンプレート</Label>
                  <Textarea
                    id="messageTemplate"
                    value={formData.messageTemplate}
                    onChange={(e) => setFormData({...formData, messageTemplate: e.target.value})}
                    placeholder={formData.type === 'weather' ? weatherPlaceholder : "定期通知のメッセージを入力してください"}
                    rows={4}
                    required
                  />
                  {formData.type === 'weather' && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        変数: {templateVariables}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          
                          onClick={() => setFormData({
                            ...formData, 
                            messageTemplate: "おはようございます！今日（{{date}}）の豊洲の天気は{{condition}}、気温{{temperature}}℃です。{{description}} 素敵な一日をお過ごしください！"
                          })}
                        >
                          基本テンプレート
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          
                          onClick={() => setFormData({
                            ...formData, 
                            messageTemplate: "🌤️ 豊洲の天気情報 🌤️\n{{date}}\n\n天気: {{condition}} {{temperature}}℃\n湿度: {{humidity}}%\n風速: {{windSpeed}}m/s\n\n{{description}}\n\n#豊洲 #天気 #ToyosuSpots"
                          })}
                        >
                          詳細テンプレート
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">送信時刻</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetUsers">送信対象</Label>
                    <Select value={formData.targetUsers} onValueChange={(value: any) => setFormData({...formData, targetUsers: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全ユーザー ({activeUsers}人)</SelectItem>
                        <SelectItem value="countries">国別選択</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>送信曜日</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {dayOptions.map((day) => (
                      <div key={day.value} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={day.value}
                          checked={formData.days.includes(day.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                days: [...formData.days, day.value]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                days: formData.days.filter(d => d !== day.value)
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={day.value} className="text-sm cursor-pointer">
                          {day.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked: boolean) => setFormData({...formData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">通知を有効にする</Label>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button type="submit">
                    <Settings className="w-4 h-4 mr-2" />
                    {editingNotification ? '更新' : '作成'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 天気情報テスト結果 */}
      {weatherData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5" />
              天気情報テスト結果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-3xl">{WeatherService.getWeatherIcon(weatherData.icon)}</div>
                <div className="text-sm text-gray-600">天気</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">{weatherData.temperature}℃</div>
                <div className="text-sm text-gray-600">気温</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">{weatherData.condition}</div>
                <div className="text-sm text-gray-600">状況</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">{weatherData.humidity}%</div>
                <div className="text-sm text-gray-600">湿度</div>
              </div>
              <div className="text-center">
                <div className="text-2xl">{weatherData.windSpeed}m/s</div>
                <div className="text-sm text-gray-600">風速</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{weatherData.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総定期通知数</p>
                <p className="text-2xl">{scheduledNotifications.length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">アクティブ</p>
                <p className="text-2xl text-green-600">{scheduledNotifications.filter(n => n.isActive).length}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">一時停止</p>
                <p className="text-2xl text-orange-600">{scheduledNotifications.filter(n => !n.isActive).length}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Pause className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 定期通知一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>定期通知一覧</CardTitle>
          <CardDescription>
            設定された定期通知の管理
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>タイトル</TableHead>
                  <TableHead>タイプ</TableHead>
                  <TableHead>スケジュール</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>最終送信</TableHead>
                  <TableHead>次回送信</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {notification.messageTemplate}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {notification.type === 'weather' ? '天気' : 'カスタム'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{notification.schedule.time}</div>
                        <div className="text-gray-500">
                          {notification.schedule.days.map(day => 
                            dayOptions.find(d => d.value === day)?.label.slice(0, 1)
                          ).join(',')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={notification.isActive ? 'default' : 'secondary'}>
                        {notification.isActive ? 'アクティブ' : '一時停止'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {notification.lastSent ? 
                        new Date(notification.lastSent).toLocaleString('ja-JP') : 
                        '-'
                      }
                    </TableCell>
                    <TableCell className="text-sm">
                      {notification.nextSend ? 
                        new Date(notification.nextSend).toLocaleString('ja-JP') : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          
                          variant="outline"
                          onClick={() => handlePreview(notification)}
                          title="モバイルページプレビュー"
                        >
                          <Smartphone className="w-3 h-3" />
                        </Button>
                        <Button
                          
                          variant="outline"
                          onClick={() => handleEdit(notification)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          
                          variant="outline"
                          onClick={() => handleToggleActive(notification.id)}
                        >
                          {notification.isActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </Button>
                        <Button
                          
                          variant="outline"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="w-3 h-3" />
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

      {/* モバイルページプレビューダイアログ */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-md p-0 gap-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              モバイルページプレビュー
            </DialogTitle>
            <DialogDescription>
              {previewNotification && (
                <span>
                  「{previewNotification.title}」通知をタップした時に表示されるページ
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="border-t">
            <div className="h-[600px] overflow-auto">
              {previewNotification?.type === 'weather' ? (
                <ApiContentMobilePage 
                  contentType="weather"
                  location="Toyosu,Tokyo,JP"
                  customTitle={previewNotification.title}
                  isPreview={true}
                />
              ) : (
                <TouristMobilePage isPreview={true} />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}