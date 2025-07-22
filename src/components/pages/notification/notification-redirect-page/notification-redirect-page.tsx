
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { MapPin, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { DisasterDetailMobilePage } from '../../disaster/disaster-detail-mobile-page/disaster-detail-mobile-page';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface NotificationRedirectPageProps {
  targetUrl?: string;
  notificationId?: string;
  showContent?: boolean;
  disasterId?: string;
  isPreview?: boolean;
}

export function NotificationRedirectPage({ 
  targetUrl, 
  notificationId,
  showContent = false,
  disasterId,
  isPreview = false
}: NotificationRedirectPageProps) {
  const [locationStatus, setLocationStatus] = useState<'requesting' | 'success' | 'denied' | 'error'>('requesting');
  const [countdown, setCountdown] = useState(5);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 位置情報を取得する関数
  const getCurrentLocation = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('お使いのブラウザでは位置情報がサポートされていません'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            timestamp: Date.now()
          };
          resolve(locationData);
        },
        (error) => {
          let errorMessage = '位置情報を取得できませんでした';
          let errorCode = 'unknown';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = '位置情報の許可が拒否されました';
              errorCode = 'permission_denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = '位置情報が利用できません';
              errorCode = 'position_unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = '位置情報の取得がタイムアウトしました';
              errorCode = 'timeout';
              break;
            default:
              errorMessage = `位置情報エラー: ${error.message}`;
              errorCode = 'unknown';
              break;
          }
          
          // エラーの詳細情報を含むオブジェクトを作成
          const detailedError = new Error(errorMessage);
          (detailedError as any).code = errorCode;
          (detailedError as any).originalError = error;
          
          reject(detailedError);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // 1分間はキャッシュを使用
        }
      );
    });
  };

  // 位置情報をサーバーに送信（実際の実装では適切なAPIエンドポイントを使用）
  const sendLocationData = async (location: LocationData) => {
    try {
      // プレビューモードでは位置情報を保存しない
      if (isPreview) {
        console.log('プレビューモード: 位置情報の保存をスキップ');
        return;
      }

      // 位置情報をローカルストレージに保存（実際の実装ではAPIに送信）
      const locationHistory = JSON.parse(localStorage.getItem('toyosu-location-history') || '[]');
      locationHistory.push({
        ...location,
        notificationId,
        userAgent: navigator.userAgent,
        url: targetUrl
      });
      // 最新の100件のみ保持
      if (locationHistory.length > 100) {
        locationHistory.splice(0, locationHistory.length - 100);
      }
      localStorage.setItem('toyosu-location-history', JSON.stringify(locationHistory));
      
      console.log('位置情報を保存しました:', location);
    } catch (error) {
      console.error('位置情報の送信に失敗しました:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // コンポーネントマウント時に位置情報を取得
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setLocationData(location);
        setLocationStatus('success');
        
        // 位置情報をサーバーに送信
        await sendLocationData(location);
        
        console.log('位置情報取得成功:', location);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '位置情報の取得中に予期しないエラーが発生しました';
        setErrorMessage(errorMessage);
        
        // エラーの種類に応じて適切なステータスを設定
        if (error instanceof Error && (error as any).code === 'permission_denied') {
          setLocationStatus('denied');
          console.warn('位置情報の許可が拒否されました');
        } else if (error instanceof Error && (error as any).code === 'timeout') {
          setLocationStatus('error');
          console.warn('位置情報の取得がタイムアウトしました');
        } else if (error instanceof Error && (error as any).code === 'position_unavailable') {
          setLocationStatus('error');
          console.warn('位置情報が利用できません');
        } else {
          setLocationStatus('error');
          console.error('位置情報取得エラー:', errorMessage);
        }
      }
    };

    fetchLocation();
  }, []);

  // カウントダウンとリダイレクト
  useEffect(() => {
    if (!targetUrl || showContent || isPreview) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // リダイレクト実行
          window.location.href = targetUrl;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetUrl, showContent, isPreview]);

  // 手動リダイレクト
  const handleManualRedirect = () => {
    if (targetUrl && !isPreview) {
      window.location.href = targetUrl;
    }
  };

  // 災害情報の場合は直接詳細ページを表示
  if (disasterId) {
    return <DisasterDetailMobilePage disasterId={disasterId} isPreview={isPreview} />;
  }

  if (showContent) {
    // コンテンツ表示モード（API情報表示用）
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center space-y-4">
            <div className="text-4xl">📍</div>
            <h2 className="text-xl font-bold">位置情報を取得中...</h2>
            <p className="text-gray-600">
              より良いサービス提供のため、位置情報を取得しています
            </p>
            
            {isPreview && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-center text-blue-600 mb-2">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  プレビューモード
                </div>
                <p className="text-sm text-blue-700">
                  これは管理画面のプレビューです
                </p>
              </div>
            )}
            
            {locationStatus === 'success' && locationData && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-center text-green-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  位置情報取得完了
                </div>
                <div className="text-sm text-green-700">
                  緯度: {locationData.latitude.toFixed(6)}<br />
                  経度: {locationData.longitude.toFixed(6)}
                </div>
              </div>
            )}
            
            {locationStatus === 'denied' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center justify-center text-yellow-600 mb-2">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  位置情報の許可が必要です
                </div>
                <p className="text-sm text-yellow-700">
                  ブラウザの設定から位置情報の許可をしてください
                </p>
              </div>
            )}
            
            {locationStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center justify-center text-red-600 mb-2">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  位置情報取得エラー
                </div>
                <p className="text-sm text-red-700">
                  {errorMessage || '位置情報を取得できませんでした'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center space-y-6">
          {/* ヘッダー */}
          <div>
            <div className="text-4xl mb-3">🌟</div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              豊洲スポッツ
            </h1>
            <p className="text-gray-600 text-sm">
              より良いサービス提供のため位置情報を取得しています
            </p>
          </div>

          {/* プレビューモード表示 */}
          {isPreview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-center text-blue-600 mb-2">
                <AlertCircle className="w-4 h-4 mr-1" />
                プレビューモード
              </div>
              <p className="text-sm text-blue-700">
                これは管理画面のプレビューです
              </p>
            </div>
          )}

          {/* 位置情報取得状況 */}
          <div className="space-y-3">
            {locationStatus === 'requesting' && (
              <div className="flex items-center justify-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm">位置情報を取得中...</span>
              </div>
            )}
            
            {locationStatus === 'success' && (
              <div className="flex items-center justify-center space-x-2 text-green-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">位置情報取得完了</span>
              </div>
            )}
            
            {locationStatus === 'denied' && (
              <div className="text-yellow-600 text-sm">
                <AlertCircle className="w-4 h-4 mx-auto mb-1" />
                位置情報の許可が拒否されました
                <div className="text-xs text-gray-500 mt-1">
                  ブラウザの設定で位置情報を許可してください
                </div>
              </div>
            )}
            
            {locationStatus === 'error' && (
              <div className="text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mx-auto mb-1" />
                位置情報を取得できませんでした
                {errorMessage && (
                  <div className="text-xs text-gray-500 mt-1">
                    {errorMessage}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* リダイレクト情報 */}
          {targetUrl && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-center space-x-2 text-gray-700">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {isPreview 
                    ? 'プレビューモード: リダイレクト無効' 
                    : `${countdown}秒後に自動的にページが開きます`
                  }
                </span>
              </div>
              
              <div className="text-xs text-gray-500 break-all">
                {targetUrl}
              </div>
              
              <Button 
                onClick={handleManualRedirect}
                className="w-full"
                
                disabled={isPreview}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {isPreview ? 'プレビューモード' : '今すぐ開く'}
              </Button>
            </div>
          )}

          {/* フッター */}
          <div className="text-xs text-gray-500">
            <p>Toyosu Spots Tourism Guide</p>
            <p>© 2024 Tokyo Toyosu Area</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
