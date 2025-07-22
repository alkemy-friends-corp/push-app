import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { Separator } from '../../../ui/separator';
import { ArrowLeft, MapPin, Clock, AlertTriangle, Info, Users, Phone, Navigation, Home, Globe, Calendar } from 'lucide-react';
import { useLanguage } from '../../../../contexts/LanguageContext';
import disasterService, { DisasterInfo } from '../../../../utils/disasterService';

interface DisasterDetailMobilePageProps {
  disasterId?: string;
  onClose?: () => void;
  isPreview?: boolean;
}

export function DisasterDetailMobilePage({ disasterId, onClose, isPreview = false }: DisasterDetailMobilePageProps) {
  const { language, setLanguage } = useLanguage();
  const [disaster, setDisaster] = useState<DisasterInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (disasterId) {
      const disasterInfo = disasterService.getDisasterById(disasterId);
      setDisaster(disasterInfo);
    }
    setIsLoading(false);
  }, [disasterId]);

  const getText = (key: string) => {
    const texts = {
      ja: {
        disasterInfo: '災害情報',
        backToHome: 'ホームに戻る',
        details: '詳細情報',
        instructions: '行動指針',
        area: '対象地域',
        severity: '重要度',
        issuedTime: '発表時刻',
        validUntil: '有効期限',
        source: '発表機関',
        affectedPopulation: '影響人口',
        emergencyContacts: '緊急連絡先',
        safetyTips: '安全のためのお願い',
        stayCalm: '冷静に行動してください',
        followInstructions: '避難指示に従ってください',
        contactEmergency: '緊急時は119番（消防）または110番（警察）に連絡してください',
        checkUpdates: '最新情報を定期的に確認してください',
        advisory: '注意報',
        warning: '警報',
        emergency: '特別警報',
        earthquake: '地震',
        heavyRain: '大雨',
        tsunami: '津波',
        typhoon: '台風',
        landslide: '土砂災害',
        flood: '洪水',
        storm: '暴風',
        magnitude: 'マグニチュード',
        depth: '深さ',
        epicenter: '震源地',
        rainfallAmount: '予想雨量',
        windSpeed: '最大風速',
        waveHeight: '予想津波高',
        people: '人',
        noData: 'データが見つかりません',
        loading: '読み込み中...',
        preview: 'プレビューモード',
        autoSent: '自動送信済み',
        notSent: '未送信',
        sentAt: '送信時刻',
        close: '閉じる'
      },
      en: {
        disasterInfo: 'Disaster Information',
        backToHome: 'Back to Home',
        details: 'Details',
        instructions: 'Safety Instructions',
        area: 'Target Area',
        severity: 'Severity',
        issuedTime: 'Issued Time',
        validUntil: 'Valid Until',
        source: 'Issued By',
        affectedPopulation: 'Affected Population',
        emergencyContacts: 'Emergency Contacts',
        safetyTips: 'Safety Tips',
        stayCalm: 'Stay calm and act rationally',
        followInstructions: 'Follow evacuation instructions',
        contactEmergency: 'In emergency, call 119 (Fire) or 110 (Police)',
        checkUpdates: 'Check for updates regularly',
        advisory: 'Advisory',
        warning: 'Warning',
        emergency: 'Emergency Alert',
        earthquake: 'Earthquake',
        heavyRain: 'Heavy Rain',
        tsunami: 'Tsunami',
        typhoon: 'Typhoon',
        landslide: 'Landslide',
        flood: 'Flood',
        storm: 'Storm',
        magnitude: 'Magnitude',
        depth: 'Depth',
        epicenter: 'Epicenter',
        rainfallAmount: 'Expected Rainfall',
        windSpeed: 'Max Wind Speed',
        waveHeight: 'Expected Wave Height',
        people: 'people',
        noData: 'No data found',
        loading: 'Loading...',
        preview: 'Preview Mode',
        autoSent: 'Auto Sent',
        notSent: 'Not Sent',
        sentAt: 'Sent At',
        close: 'Close'
      }
    };

    return (texts as any)[language]?.[key] || (texts as any).ja[key] || key;
  };

  const getSeverityColor = (severity: DisasterInfo['severity']) => {
    switch (severity) {
      case 'emergency':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-orange-500 text-white';
      case 'advisory':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSeverityLabel = (severity: DisasterInfo['severity']) => {
    return getText(severity);
  };

  const getTypeLabel = (type: DisasterInfo['type']) => {
    return getText(type);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'ja' ? 'ja-JP' : 'en-US');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{getText('loading')}</p>
        </div>
      </div>
    );
  }

  if (!disaster) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{getText('noData')}</p>
            {onClose && (
              <Button onClick={onClose} className="mt-4">
                {getText('close')}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {onClose ? (
              <Button 
                variant="ghost" 
                 
                onClick={onClose}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                 
                onClick={() => window.history.back()}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-lg font-semibold">{getText('disasterInfo')}</h1>
              {isPreview && (
                <p className="text-xs text-orange-600">{getText('preview')}</p>
              )}
            </div>
          </div>
          
          {/* 言語切り替え */}
          <div className="flex items-center gap-2">
            <Button
              variant={language === 'ja' ? 'default' : 'outline'}
              
              onClick={() => setLanguage('ja')}
              className="text-xs px-2 py-1"
            >
              日本語
            </Button>
            <Button
              variant={language === 'en' ? 'default' : 'outline'}
              
              onClick={() => setLanguage('en')}
              className="text-xs px-2 py-1"
            >
              English
            </Button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="p-4 space-y-4">
        {/* 災害情報カード */}
        <Card className="border-l-4 border-red-500">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{disasterService.getDisasterIcon(disaster.type)}</span>
              <div className="flex-1">
                <CardTitle className="text-lg">{disaster.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getSeverityColor(disaster.severity)}>
                    {getSeverityLabel(disaster.severity)}
                  </Badge>
                  <Badge variant="outline">
                    {getTypeLabel(disaster.type)}
                  </Badge>
                  {disaster.urgent && (
                    <Badge variant="destructive" className="text-xs">
                      URGENT
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{disaster.description}</p>
            
            {/* 基本情報 */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{getText('area')}:</span>
                <span className="font-medium">{disaster.area}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{getText('issuedTime')}:</span>
                <span className="font-medium">{formatDateTime(disaster.issuedAt)}</span>
              </div>
              
              {disaster.validUntil && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{getText('validUntil')}:</span>
                  <span className="font-medium">{formatDateTime(disaster.validUntil)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">{getText('source')}:</span>
                <span className="font-medium">{disaster.source}</span>
              </div>

              {disaster.affectedPopulation && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{getText('affectedPopulation')}:</span>
                  <span className="font-medium">
                    {disaster.affectedPopulation.toLocaleString()}{getText('people')}
                  </span>
                </div>
              )}

              {/* 通知状況 */}
              {disaster.autoNotificationSent && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-600">{getText('sentAt')}:</span>
                  <span className="font-medium text-green-600">
                    {disaster.autoNotificationSentAt && formatDateTime(disaster.autoNotificationSentAt)}
                  </span>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {getText('autoSent')}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 詳細情報 */}
        {disaster.details && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{getText('details')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {disaster.details.magnitude && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{getText('magnitude')}:</span>
                  <span className="font-medium">{disaster.details.magnitude}</span>
                </div>
              )}
              {disaster.details.depth && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{getText('depth')}:</span>
                  <span className="font-medium">{disaster.details.depth}km</span>
                </div>
              )}
              {disaster.details.epicenter && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{getText('epicenter')}:</span>
                  <span className="font-medium">{disaster.details.epicenter}</span>
                </div>
              )}
              {disaster.details.rainfallAmount && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{getText('rainfallAmount')}:</span>
                  <span className="font-medium">{disaster.details.rainfallAmount}mm/h</span>
                </div>
              )}
              {disaster.details.windSpeed && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{getText('windSpeed')}:</span>
                  <span className="font-medium">{disaster.details.windSpeed}m/s</span>
                </div>
              )}
              {disaster.details.waveHeight && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{getText('waveHeight')}:</span>
                  <span className="font-medium">{disaster.details.waveHeight}m</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 行動指針 */}
        {disaster.instructions && disaster.instructions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                {getText('instructions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {disaster.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* 安全のお願い */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base text-blue-800">{getText('safetyTips')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-blue-700 text-sm">• {getText('stayCalm')}</p>
            <p className="text-blue-700 text-sm">• {getText('followInstructions')}</p>
            <p className="text-blue-700 text-sm">• {getText('contactEmergency')}</p>
            <p className="text-blue-700 text-sm">• {getText('checkUpdates')}</p>
          </CardContent>
        </Card>

        {/* 緊急連絡先 */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-base text-red-800 flex items-center gap-2">
              <Phone className="w-5 h-5" />
              {getText('emergencyContacts')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-red-700 font-medium">消防署 (Fire Department):</span>
              <a href="tel:119" className="text-red-600 font-bold text-lg">119</a>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-red-700 font-medium">警察署 (Police):</span>
              <a href="tel:110" className="text-red-600 font-bold text-lg">110</a>
            </div>
          </CardContent>
        </Card>

        {/* ナビゲーションボタン（プレビューモードでない場合） */}
        {!isPreview && !onClose && (
          <div className="sticky bottom-4 pt-4">
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Home className="w-5 h-5 mr-2" />
              {getText('backToHome')}
            </Button>
          </div>
        )}

        {/* 余白 */}
        <div className="h-8"></div>
      </div>
    </div>
  );
}