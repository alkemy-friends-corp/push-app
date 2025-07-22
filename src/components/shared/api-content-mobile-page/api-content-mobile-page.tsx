
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { useLanguage } from '../../../contexts/LanguageContext';
import { Cloud, Thermometer, Droplets, Wind, Eye, Calendar, Clock, MapPin, Smartphone } from 'lucide-react';
import WeatherService, { WeatherData } from '../../../utils/weatherService';
import { MobilePageHeader } from '../mobile-page-header/mobile-page-header';

interface ApiContentMobilePageProps {
  contentType?: 'weather' | 'general';
  location?: string;
  customTitle?: string;
  customMessage?: string;
  isPreview?: boolean;
}

export function ApiContentMobilePage({ 
  contentType = 'weather',
  location = 'Toyosu,Tokyo,JP',
  customTitle,
  customMessage,
  isPreview = false
}: ApiContentMobilePageProps) {
  const { language } = useLanguage();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 天気データを取得
  useEffect(() => {
    const fetchWeatherData = async () => {
      if (contentType !== 'weather') return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await WeatherService.getWeatherData(location);
        setWeatherData(data);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('天気データの取得に失敗しました:', err);
        setError('天気データを取得できませんでした');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeatherData();
  }, [contentType, location]);

  // 更新ボタンの処理
  const handleRefresh = async () => {
    if (contentType === 'weather') {
      setIsLoading(true);
      try {
        const data = await WeatherService.getWeatherData(location);
        setWeatherData(data);
        setLastUpdated(new Date());
      } catch (err) {
        setError('天気データを取得できませんでした');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 服装アドバイスを生成
  const getClothingAdvice = (temperature: number) => {
    if (temperature >= 28) {
      return {
        icon: '🌞',
        text: language === 'ja' 
          ? '薄着で過ごしやすい気温です。日焼け止めをお忘れなく!'
          : 'Light clothing is comfortable. Don\'t forget sunscreen!'
      };
    } else if (temperature >= 23) {
      return {
        icon: '👕',
        text: language === 'ja'
          ? '半袖または薄い長袖が最適です。'
          : 'Short sleeves or light long sleeves are optimal.'
      };
    } else if (temperature >= 18) {
      return {
        icon: '🧥',
        text: language === 'ja'
          ? 'カーディガンやライトジャケットがあると良いでしょう。'
          : 'A cardigan or light jacket would be good.'
      };
    } else if (temperature >= 12) {
      return {
        icon: '🧥',
        text: language === 'ja'
          ? 'ジャケットやコートを着用することをお勧めします。'
          : 'We recommend wearing a jacket or coat.'
      };
    } else {
      return {
        icon: '🧥',
        text: language === 'ja'
          ? '厚手のコートや防寒着を着用してください。'
          : 'Please wear a thick coat or warm clothing.'
      };
    }
  };

  if (contentType !== 'weather') {
    // 一般コンテンツ表示
    return (
      <div className="min-h-screen bg-gray-50">
        <MobilePageHeader
          title={customTitle || (language === 'ja' ? '豊洲スポッツ' : 'Toyosu Spots')}
          subtitle="Tokyo Toyosu Area"
          icon={<Smartphone className="w-6 h-6" />}
          isPreview={isPreview}
        />

        <div className="p-4">
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="text-4xl">📱</div>
              <h2 className="text-xl font-bold">
                {language === 'ja' ? 'モバイル最適化コンテンツ' : 'Mobile Optimized Content'}
              </h2>
              {customMessage && (
                <p className="text-gray-600">{customMessage}</p>
              )}
              <div className="text-sm text-gray-500">
                {language === 'ja' 
                  ? 'このページはモバイルデバイス向けに最適化されています'
                  : 'This page is optimized for mobile devices'
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobilePageHeader
        title={customTitle || (language === 'ja' ? '豊洲の天気情報' : 'Toyosu Weather')}
        subtitle={language === 'ja' ? 'リアルタイム天気データ' : 'Real-time Weather Data'}
        icon={<Cloud className="w-6 h-6" />}
        isPreview={isPreview}
      />

      <div className="p-4 space-y-4">
        {isPreview && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Eye className="w-4 h-4" />
                <span>
                  {language === 'ja' ? 'プレビューモード - 実際の通知タップ時の表示' : 'Preview Mode - Shows actual notification tap display'}
                </span>
              </div>
            </CardContent>
          </Card>
        )}
        
        {isLoading ? (
          // ローディング状態
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">
                {language === 'ja' ? '天気データを取得中...' : 'Loading weather data...'}
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          // エラー状態
          <Card>
            <CardContent className="p-6 text-center space-y-4">
              <div className="text-red-500 text-4xl">⚠️</div>
              <h2 className="text-lg font-semibold text-red-600">
                {language === 'ja' ? 'データ取得エラー' : 'Data Loading Error'}
              </h2>
              <p className="text-gray-600">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                {language === 'ja' ? '再試行' : 'Retry'}
              </Button>
            </CardContent>
          </Card>
        ) : weatherData ? (
          // 天気データ表示
          <>
            {/* メインウェザーカード */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="text-6xl">
                    {WeatherService.getWeatherIcon(weatherData.icon)}
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-gray-900">
                      {weatherData.temperature}℃
                    </div>
                    <div className="text-lg text-gray-600 mt-1">
                      {weatherData.condition}
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">
                      {weatherData.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 詳細情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  {language === 'ja' ? '詳細情報' : 'Details'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">
                      {weatherData.humidity}%
                    </div>
                    <div className="text-sm text-blue-600">
                      {language === 'ja' ? '湿度' : 'Humidity'}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Wind className="w-6 h-6 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-700">
                      {weatherData.windSpeed}
                    </div>
                    <div className="text-sm text-green-600">
                      {language === 'ja' ? '風速 (m/s)' : 'Wind (m/s)'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 服装アドバイス */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'ja' ? '服装アドバイス' : 'Clothing Advice'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {(() => {
                  const advice = getClothingAdvice(weatherData.temperature);
                  return (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className="text-2xl">{advice.icon}</div>
                        <p className="text-yellow-800 text-sm flex-1">
                          {advice.text}
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* 更新情報 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {language === 'ja' ? '最終更新' : 'Last Updated'}
                    </span>
                  </div>
                  {lastUpdated && (
                    <span>
                      {lastUpdated.toLocaleString(language === 'ja' ? 'ja-JP' : 'en-US')}
                    </span>
                  )}
                </div>
                <Button 
                  onClick={handleRefresh} 
                  variant="outline" 
                   
                  className="w-full mt-3"
                  disabled={isLoading}
                >
                  <Cloud className="w-4 h-4 mr-2" />
                  {language === 'ja' ? '最新情報に更新' : 'Refresh Data'}
                </Button>
                {isPreview && (
                  <p className="text-center text-xs text-gray-500 mt-2">
                    {language === 'ja' ? 'プレビューモードでも更新可能です' : 'Updates available in preview mode'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* カスタムメッセージ */}
            {customMessage && (
              <Card>
                <CardContent className="p-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-gray-700 text-sm">{customMessage}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : null}

        {/* フッター */}
        <div className="text-center text-sm text-gray-500 py-4">
          <div className="flex items-center justify-center space-x-2 mb-1">
            <MapPin className="w-4 h-4" />
            <span>Toyosu Spots</span>
          </div>
          <div>
            {language === 'ja' ? '豊洲エリア観光ガイド' : 'Toyosu Area Tourism Guide'}
          </div>
        </div>
      </div>
    </div>
  );
}
