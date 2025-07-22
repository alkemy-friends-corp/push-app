import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../ui/dialog';
import { useAdmin } from '../../../../contexts/AdminContext';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { Search, Filter, Download, Users, Copy, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function UserManagement() {
  const { users } = useAdmin();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.deviceToken.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.notificationStatus === statusFilter;
    const matchesCountry = countryFilter === 'all' || user.country === countryFilter;
    
    return matchesSearch && matchesStatus && matchesCountry;
  });

  const countries = [...new Set(users.map(u => u.country))];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t('language') === 'ja' ? 'デバイストークンをクリップボードにコピーしました' : 'Device token copied to clipboard');
    } catch (err) {
      toast.error(t('language') === 'ja' ? 'コピーに失敗しました' : 'Failed to copy');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', t('admin.users.table.deviceToken'), t('admin.users.table.country'), t('admin.users.table.stayEnd'), t('admin.users.table.status'), t('admin.users.table.lastAccess'), t('admin.users.table.registration')];
    const csvData = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.id,
        `"${user.deviceToken}"`, // トークンは長いので引用符で囲む
        user.country,
        user.stayEndDate,
        user.notificationStatus === 'active' ? t('admin.users.filter.active') : t('admin.users.filter.expired'),
        user.lastAccess,
        user.registrationDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">{t('admin.users.title')}</h1>
          <p className="text-gray-600">{t('admin.users.subtitle')}</p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          {t('admin.users.export')}
        </Button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.users.totalUsers')}</p>
                <p className="text-2xl">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.users.activeUsers')}</p>
                <p className="text-2xl text-green-600">{users.filter(u => u.notificationStatus === 'active').length}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.users.expiredUsers')}</p>
                <p className="text-2xl text-red-600">{users.filter(u => u.notificationStatus === 'expired').length}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('admin.users.todayAccess')}</p>
                <p className="text-2xl text-blue-600">{users.filter(u => {
                  const today = new Date().toDateString();
                  return new Date(u.lastAccess).toDateString() === today;
                }).length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* フィルターとセクション */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.users.list.title')}</CardTitle>
          <CardDescription>
            {t('admin.users.list.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('admin.users.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('admin.users.filter.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.users.filter.allStatus')}</SelectItem>
                <SelectItem value="active">{t('admin.users.filter.active')}</SelectItem>
                <SelectItem value="expired">{t('admin.users.filter.expired')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={t('admin.users.filter.country')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.users.filter.allCountries')}</SelectItem>
                {countries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.users.table.userId')}</TableHead>
                  <TableHead>{t('admin.users.table.deviceToken')}</TableHead>
                  <TableHead>{t('admin.users.table.country')}</TableHead>
                  <TableHead>{t('admin.users.table.stayEnd')}</TableHead>
                  <TableHead>{t('admin.users.table.status')}</TableHead>
                  <TableHead>{t('admin.users.table.lastAccess')}</TableHead>
                  <TableHead>{t('admin.users.table.registration')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-sm">{user.id}</TableCell>
                    <TableCell className="font-mono text-xs max-w-xs">
                      <div className="flex items-center gap-2">
                        <div className="truncate flex-1" title={user.deviceToken}>
                          {user.deviceToken.substring(0, 20)}...
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost"  className="h-6 w-6 p-0">
                              <Eye className="w-3 h-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{t('admin.users.table.deviceToken')}</DialogTitle>
                              <DialogDescription>
                                {t('admin.users.table.userId')}: {user.id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700">{t('admin.users.table.deviceToken')}</label>
                                <div className="mt-1 p-3 bg-gray-50 rounded-md border font-mono text-sm break-all">
                                  {user.deviceToken}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => copyToClipboard(user.deviceToken)}
                                  variant="outline"
                                  
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  {t('language') === 'ja' ? 'コピー' : 'Copy'}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                    <TableCell>{user.country}</TableCell>
                    <TableCell>{new Date(user.stayEndDate).toLocaleDateString('ja-JP')}</TableCell>
                    <TableCell>
                      <Badge variant={user.notificationStatus === 'active' ? 'default' : 'secondary'}>
                        {user.notificationStatus === 'active' ? t('admin.users.filter.active') : t('admin.users.filter.expired')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(user.lastAccess).toLocaleString('ja-JP')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(user.registrationDate).toLocaleString('ja-JP')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>{t('admin.users.noResults')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}