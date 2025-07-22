import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Textarea } from '../../../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../ui/dialog';
import { Label } from '../../../ui/label';
import { Switch } from '../../../ui/switch';
import { useAdmin } from '../../../../contexts/AdminContext';
import { MapPin, Plus, Edit, Trash2, Copy, Activity } from 'lucide-react';
import { toast } from 'sonner';

export function LocationNotifications() {
  const { locationNotifications, addLocationNotification, updateLocationNotification, deleteLocationNotification } = useAdmin();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    message: '',
    url: '',
    latitude: '',
    longitude: '',
    radius: '100',
    isActive: true,
    cooldownMinutes: '60'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      message: '',
      url: '',
      latitude: '',
      longitude: '',
      radius: '100',
      isActive: true,
      cooldownMinutes: '60'
    });
    setEditingNotification(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const locationData = {
      name: formData.name,
      title: formData.title,
      message: formData.message,
      url: formData.url,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radius: parseInt(formData.radius),
      isActive: formData.isActive,
      cooldownMinutes: parseInt(formData.cooldownMinutes)
    };

    if (editingNotification) {
      updateLocationNotification(editingNotification, locationData);
      toast.success('位置通知を更新しました');
    } else {
      addLocationNotification(locationData);
      toast.success('位置通知を作成しました');
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (notification: any) => {
    setEditingNotification(notification.id);
    setFormData({
      name: notification.name,
      title: notification.title,
      message: notification.message,
      url: notification.url || '',
      latitude: notification.latitude.toString(),
      longitude: notification.longitude.toString(),
      radius: notification.radius.toString(),
      isActive: notification.isActive,
      cooldownMinutes: notification.cooldownMinutes.toString()
    });
    setIsDialogOpen(true);
  };

  const handleCopy = (notification: any) => {
    setFormData({
      name: notification.name + ' (コピー)',
      title: notification.title,
      message: notification.message,
      url: notification.url || '',
      latitude: notification.latitude.toString(),
      longitude: notification.longitude.toString(),
      radius: notification.radius.toString(),
      isActive: notification.isActive,
      cooldownMinutes: notification.cooldownMinutes.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('この位置通知を削除してもよろしいですか？')) {
      deleteLocationNotification(id);
      toast.success('位置通知を削除しました');
    }
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    updateLocationNotification(id, { isActive });
    toast.success(isActive ? '位置通知を有効化しました' : '位置通知を無効化しました');
  };

  // 豊洲の代表的な座標
  const toyosuLocations = [
    { name: '豊洲市場', lat: 35.6433, lng: 139.7714 },
    { name: 'ららぽーと豊洲', lat: 35.6458, lng: 139.7853 },
    { name: '豊洲公園', lat: 35.6542, lng: 139.7965 },
  ];

  const setPresetLocation = (location: { name: string, lat: number, lng: number }) => {
    setFormData({
      ...formData,
      name: location.name + 'エリア',
      latitude: location.lat.toString(),
      longitude: location.lng.toString()
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">位置ベース通知</h1>
          <p className="text-gray-600">ジオフェンス機能を使った位置連動通知の管理</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              新規位置通知作成
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingNotification ? '位置通知を編集' : '新規位置通知作成'}
              </DialogTitle>
              <DialogDescription>
                特定の場所でトリガーされる通知を設定してください
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">エリア名</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="例: 豊洲市場エリア"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>プリセット位置</Label>
                <div className="flex gap-2">
                  {toyosuLocations.map((location) => (
                    <Button
                      key={location.name}
                      type="button"
                      variant="outline"
                      
                      onClick={() => setPresetLocation(location)}
                    >
                      {location.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">緯度</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                    placeholder="35.6433"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">経度</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                    placeholder="139.7714"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="radius">半径（メートル）</Label>
                  <Input
                    id="radius"
                    type="number"
                    value={formData.radius}
                    onChange={(e) => setFormData({...formData, radius: e.target.value})}
                    placeholder="100"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cooldown">クールダウン（分）</Label>
                  <Input
                    id="cooldown"
                    type="number"
                    value={formData.cooldownMinutes}
                    onChange={(e) => setFormData({...formData, cooldownMinutes: e.target.value})}
                    placeholder="60"
                    required
                  />
                </div>
              </div>

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
                <Label htmlFor="message">通知メッセージ</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="通知の内容を入力してください"
                  rows={3}
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
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked: boolean) => setFormData({...formData, isActive: checked})}
                />
                <Label htmlFor="isActive">通知を有効化</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button type="submit">
                  <MapPin className="w-4 h-4 mr-2" />
                  {editingNotification ? '更新' : '作成'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総位置通知数</p>
                <p className="text-2xl">{locationNotifications.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">アクティブ通知</p>
                <p className="text-2xl text-green-600">{locationNotifications.filter(ln => ln.isActive).length}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">非アクティブ</p>
                <p className="text-2xl text-gray-600">{locationNotifications.filter(ln => !ln.isActive).length}</p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均半径</p>
                <p className="text-2xl text-blue-600">
                  {locationNotifications.length > 0 
                    ? Math.round(locationNotifications.reduce((sum, ln) => sum + ln.radius, 0) / locationNotifications.length)
                    : 0}m
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-blue-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 位置通知一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>位置通知一覧</CardTitle>
          <CardDescription>
            設定されたジオフェンス通知の管理
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>エリア名</TableHead>
                  <TableHead>通知タイトル</TableHead>
                  <TableHead>位置情報</TableHead>
                  <TableHead>半径</TableHead>
                  <TableHead>クールダウン</TableHead>
                  <TableHead>ステータス</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locationNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <div className="font-medium">{notification.name}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{notification.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {notification.message}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{notification.latitude.toFixed(6)}</div>
                      <div>{notification.longitude.toFixed(6)}</div>
                    </TableCell>
                    <TableCell>{notification.radius}m</TableCell>
                    <TableCell>{notification.cooldownMinutes}分</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={notification.isActive}
                          onCheckedChange={(checked: boolean) => handleToggleActive(notification.id, checked)}
                          
                        />
                        <Badge variant={notification.isActive ? 'default' : 'secondary'}>
                          {notification.isActive ? 'アクティブ' : '停止中'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(notification.createdAt).toLocaleDateString('ja-JP')}
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