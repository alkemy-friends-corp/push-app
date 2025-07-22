
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Textarea } from '../../../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../ui/dialog';
import { Label } from '../../../ui/label';
import { Checkbox } from '../../../ui/checkbox';
import { useAdmin } from '../../../../contexts/AdminContext';
import { Send, Clock, Copy, Edit, Trash2, Plus, Calendar, Globe, Settings } from 'lucide-react';
import { toast } from 'sonner';

export function NotificationSender() {
  const { 
    notifications, 
    addNotification, 
    updateNotification, 
    deleteNotification, 
    users,
    getAvailableCountries,
    getUserCountsByCountry
  } = useAdmin();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    url: '',
    type: 'immediate' as 'immediate' | 'scheduled',
    targetUsers: 'all' as 'all' | 'countries',
    targetCountries: [] as string[],
    scheduledDate: '',
    repeat: 'none' as 'none' | 'daily' | 'weekly' | 'monthly'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      url: '',
      type: 'immediate',
      targetUsers: 'all',
      targetCountries: [],
      scheduledDate: '',
      repeat: 'none'
    });
    setEditingNotification(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNotification) {
      updateNotification(editingNotification, {
        ...formData,
        status: formData.type === 'immediate' ? 'sent' : 'scheduled',
        sentAt: formData.type === 'immediate' ? new Date().toISOString() : undefined
      });
      toast.success('通知を更新しました');
    } else {
      addNotification({
        ...formData,
        status: formData.type === 'immediate' ? 'sent' : 'scheduled',
        sentAt: formData.type === 'immediate' ? new Date().toISOString() : undefined
      });
      toast.success(formData.type === 'immediate' ? '通知を送信しました' : '通知を予約しました');
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (notification: any) => {
    setEditingNotification(notification.id);
    setFormData({
      title: notification.title,
      message: notification.message,
      url: notification.url || '',
      type: notification.type,
      targetUsers: notification.targetUsers,
      targetCountries: notification.targetCountries || [],
      scheduledDate: notification.scheduledDate || '',
      repeat: notification.repeat
    });
    setIsDialogOpen(true);
  };

  const handleCopy = (notification: any) => {
    setFormData({
      title: notification.title + ' (コピー)',
      message: notification.message,
      url: notification.url || '',
      type: notification.type,
      targetUsers: notification.targetUsers,
      targetCountries: notification.targetCountries || [],
      scheduledDate: '',
      repeat: notification.repeat
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('この通知を削除してもよろしいですか？')) {
      deleteNotification(id);
      toast.success('通知を削除しました');
    }
  };

  const handleCancel = (id: string) => {
    if (window.confirm('この予約通知をキャンセルしてもよろしいですか？')) {
      updateNotification(id, { status: 'cancelled' });
      toast.success('通知をキャンセルしました');
    }
  };

  const activeUsers = users.filter(u => u.notificationStatus === 'active').length;
  const availableCountries = getAvailableCountries();
  const userCountsByCountry = getUserCountsByCountry();

  const handleCountryToggle = (country: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        targetCountries: [...formData.targetCountries, country]
      });
    } else {
      setFormData({
        ...formData,
        targetCountries: formData.targetCountries.filter(c => c !== country)
      });
    }
  };

  const getTargetUserCount = () => {
    if (formData.targetUsers === 'all') {
      return activeUsers;
    } else if (formData.targetUsers === 'countries') {
      return formData.targetCountries.reduce((total, country) => {
        return total + (userCountsByCountry[country] || 0);
      }, 0);
    }
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">随時通知</h1>
          <p className="text-gray-600">ユーザーへの通知を管理・送信</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                新規通知作成
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingNotification ? '通知を編集' : '新規通知作成'}
                </DialogTitle>
                <DialogDescription>
                  ユーザーに送信する通知の内容を設定してください
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
                      placeholder="通知のタイトルを入力"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">送信タイプ</Label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">即時送信</SelectItem>
                        <SelectItem value="scheduled">予約送信</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">通知メッセージ</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="通知の内容を入力してください"
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">リンク先URL（オプション）</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    placeholder="https://example.com"
                  />
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>※ URLが設定されている場合：位置情報取得後に指定URLへリダイレクト</p>
                    <p>※ URLが未設定の場合：豊洲観光ページを表示</p>
                    <p>※ 特別なページ：</p>
                    <ul className="ml-4 space-y-1">
                      <li>• 天気情報ページ: <code>?api-content=true&type=weather</code></li>
                      <li>• 観光ページ: <code>?mobile=true</code></li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetUsers">送信対象</Label>
                    <Select value={formData.targetUsers} onValueChange={(value: any) => setFormData({...formData, targetUsers: value, targetCountries: []})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">全ユーザー ({activeUsers}人)</SelectItem>
                        <SelectItem value="countries">国別選択</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="repeat">繰り返し設定</Label>
                    <Select value={formData.repeat} onValueChange={(value: any) => setFormData({...formData, repeat: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">繰り返しなし</SelectItem>
                        <SelectItem value="daily">毎日</SelectItem>
                        <SelectItem value="weekly">毎週</SelectItem>
                        <SelectItem value="monthly">毎月</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.targetUsers === 'countries' && (
                  <div className="space-y-2">
                    <Label>対象国を選択 ({formData.targetCountries.length}国選択中、計{getTargetUserCount()}人)</Label>
                    <div className="border rounded-md p-4 max-h-48 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-2">
                        {availableCountries.map((country) => (
                          <div key={country} className="flex items-center space-x-2">
                            <Checkbox
                              id={`country-${country}`}
                              checked={formData.targetCountries.includes(country)}
                              onCheckedChange={(checked: boolean) => handleCountryToggle(country, checked)}
                            />
                            <Label htmlFor={`country-${country}`} className="text-sm cursor-pointer flex-1">
                              <Globe className="w-3 h-3 inline mr-1" />
                              {country} ({userCountsByCountry[country] || 0}人)
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    {formData.targetCountries.length === 0 && (
                      <p className="text-sm text-red-500">少なくとも1つの国を選択してください</p>
                    )}
                  </div>
                )}

                {formData.type === 'scheduled' && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">送信予定日時</Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
                      required={formData.type === 'scheduled'}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    キャンセル
                  </Button>
                  <Button 
                    type="submit"
                    disabled={formData.targetUsers === 'countries' && formData.targetCountries.length === 0}
                  >
                    {formData.type === 'immediate' ? (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        今すぐ送信 ({getTargetUserCount()}人)
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        予約登録 ({getTargetUserCount()}人)
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総通知数</p>
                <p className="text-2xl">{notifications.length}</p>
              </div>
              <Send className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">送信済み</p>
                <p className="text-2xl text-green-600">{notifications.filter(n => n.status === 'sent').length}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Send className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">予約済み</p>
                <p className="text-2xl text-orange-600">{notifications.filter(n => n.status === 'scheduled').length}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">アクティブユーザー</p>
                <p className="text-2xl text-blue-600">{activeUsers}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 通知一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>通知履歴・管理</CardTitle>
          <CardDescription>
            送信済み・予約済みの通知を管理
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>タイトル</TableHead>
                  <TableHead>タイプ</TableHead>
                  <TableHead>対象</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>作成日時</TableHead>
                  <TableHead>送信日時</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {notification.message}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {notification.type === 'immediate' ? '即時' : '予約'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {notification.targetUsers === 'all' ? '全ユーザー' : 
                       notification.targetUsers === 'countries' ? 
                       `国別選択 (${notification.targetCountries?.length || 0}国)` : 
                       '設定なし'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        notification.status === 'sent' ? 'default' :
                        notification.status === 'scheduled' ? 'secondary' :
                        notification.status === 'cancelled' ? 'destructive' : 'outline'
                      }>
                        {notification.status === 'sent' ? '送信済み' :
                         notification.status === 'scheduled' ? '予約済み' :
                         notification.status === 'cancelled' ? 'キャンセル' : 'ドラフト'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(notification.createdAt).toLocaleString('ja-JP')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {notification.sentAt ? new Date(notification.sentAt).toLocaleString('ja-JP') :
                       notification.scheduledDate ? new Date(notification.scheduledDate).toLocaleString('ja-JP') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          
                          variant="outline"
                          onClick={() => handleEdit(notification)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          
                          variant="outline"
                          onClick={() => handleCopy(notification)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        {notification.status === 'scheduled' && (
                          <Button
                            
                            variant="outline"
                            onClick={() => handleCancel(notification.id)}
                          >
                            <Calendar className="w-3 h-3" />
                          </Button>
                        )}
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
    </div>
  );
}
