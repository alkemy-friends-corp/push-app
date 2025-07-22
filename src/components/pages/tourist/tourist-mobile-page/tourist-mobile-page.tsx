import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Badge } from '../../../ui/badge';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { MapPin, Cloud, Clock, Navigation, Camera, Utensils, ShoppingBag, Star, Phone, Calendar, Wind, Droplets } from 'lucide-react';
import { ImageWithFallback } from '../../../shared/figma/image-with-fallback/image-with-fallback';
import WeatherService, { WeatherData } from '../../../../utils/weatherService';
import { MobilePageHeader } from '../../../shared/mobile-page-header/mobile-page-header';

interface TouristSpot {
  id: string;
  name: { ja: string; en: string };
  description: { ja: string; en: string };
  category: 'shopping' | 'restaurant' | 'attraction' | 'transportation';
  rating: number;
  image: string;
  location: string;
  openHours: { ja: string; en: string };
  phoneNumber?: string;
}

interface TouristMobilePageProps {
  isPreview?: boolean;
}

export function TouristMobilePage({ isPreview = false }: TouristMobilePageProps) {
  const { language, t } = useLanguage();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'spots' | 'weather'>('overview');

  // 観光スポットデータ
  const touristSpots: TouristSpot[] = [
    {
      id: '1',
      name: { ja: '豊洲市場', en: 'Toyosu Fish Market' },
      description: { 
        ja: '東京の台所として親しまれる豊洲市場。新鮮な魚介類とマグロの競りが有名です。',
        en: 'Known as Tokyo\'s kitchen, Toyosu Market is famous for fresh seafood and tuna auctions.'
      },
      category: 'attraction',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
      location: '豊洲6-6-1',
      openHours: { ja: '5:00-17:00', en: '5:00-17:00' },
      phoneNumber: '03-3520-8205'
    },
    {
      id: '2',
      name: { ja: 'アクアシティお台場', en: 'Aqua City Odaiba' },
      description: { 
        ja: '豊洲から近いお台場の大型ショッピングモール。レインボーブリッジの絶景が楽しめます。',
        en: 'Large shopping mall near Toyosu with spectacular views of Rainbow Bridge.'
      },
      category: 'shopping',
      rating: 4.2,
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      location: 'お台場1-7-1',
      openHours: { ja: '11:00-21:00', en: '11:00-21:00' },
      phoneNumber: '03-3599-4700'
    },
    {
      id: '3',
      name: { ja: 'ゆりかもめ新橋駅', en: 'Yurikamome Shimbashi Station' },
      description: { 
        ja: '豊洲へのアクセスに便利な新交通システム。東京湾の景色を楽しみながら移動できます。',
        en: 'Convenient transportation system to Toyosu with beautiful Tokyo Bay views.'
      },
      category: 'transportation',
      rating: 4.0,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop',
      location: '新橋2-20-15',
      openHours: { ja: '5:00-24:00', en: '5:00-24:00' }
    },
    {
      id: '4',
      name: { ja: '豊洲ぐるり公園', en: 'Toyosu Gururi Park' },
      description: { 
        ja: '豊洲市場周辺の水辺公園。東京湾とレインボーブリッジの絶景スポットです。',
        en: 'Waterfront park around Toyosu Market with stunning views of Tokyo Bay and Rainbow Bridge.'
      },
      category: 'attraction',
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1516820206080-0c4d3d94d999?w=400&h=300&fit=crop',
      location: '豊洲6-1-23',
      openHours: { ja: '24時間', en: '24 hours' }
    }
  ];

  // 天気データを取得
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const weather = await WeatherService.getWeatherData('Toyosu,Tokyo,JP');
        setWeatherData(weather);
      } catch (error) {
        console.error('天気データの取得に失敗しました:', error);
      }
    };
    fetchWeather();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'shopping': return <ShoppingBag className="w-4 h-4" />;
      case 'restaurant': return <Utensils className="w-4 h-4" />;
      case 'attraction': return <Camera className="w-4 h-4" />;
      case 'transportation': return <Navigation className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      shopping: { ja: 'ショッピング', en: 'Shopping' },
      restaurant: { ja: 'レストラン', en: 'Restaurant' },
      attraction: { ja: '観光地', en: 'Attraction' },
      transportation: { ja: '交通', en: 'Transportation' }
    };
    return labels[category as keyof typeof labels]?.[language] || category;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <MobilePageHeader
        title={language === 'ja' ? '豊洲観光ガイド' : 'Toyosu Tourism Guide'}
        subtitle="Tokyo Toyosu Area"
        icon={<MapPin className="w-6 h-6" />}
        isPreview={isPreview}
      />

      {/* タブナビゲーション */}
      <div className="bg-white border-b sticky top-24 z-40">
        <div className="flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin className="w-4 h-4 mx-auto mb-1" />
            {language === 'ja' ? '概要' : 'Overview'}
          </button>
          <button
            onClick={() => setActiveTab('spots')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'spots'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Camera className="w-4 h-4 mx-auto mb-1" />
            {language === 'ja' ? 'スポット' : 'Spots'}
          </button>
          <button
            onClick={() => setActiveTab('weather')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'weather'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Cloud className="w-4 h-4 mx-auto mb-1" />
            {language === 'ja' ? '天気' : 'Weather'}
          </button>
        </div>
      </div>

      {/* コンテンツエリア */}
      <div className="p-4 pb-20">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* ウェルカムカード */}
            <Card>
              <CardContent className="p-4">
                <div className="text-center space-y-3">
                  <div className="text-4xl">🏙️</div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {language === 'ja' ? '豊洲エリアへようこそ！' : 'Welcome to Toyosu Area!'}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {language === 'ja' 
                      ? '東京の新しい観光地、豊洲エリアをご案内します。新鮮な市場グルメから最新のショッピング施設まで、魅力的なスポットをお楽しみください。'
                      : 'Discover the new tourist destination of Tokyo, Toyosu Area. From fresh market cuisine to modern shopping facilities, enjoy attractive spots.'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 今日の天気（概要） */}
            {weatherData && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">
                        {WeatherService.getWeatherIcon(weatherData.icon)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {language === 'ja' ? '今日の天気' : 'Today\'s Weather'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {weatherData.condition} • {weatherData.temperature}℃
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      
                      onClick={() => setActiveTab('weather')}
                    >
                      {language === 'ja' ? '詳細' : 'Details'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* おすすめスポット */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  {language === 'ja' ? 'おすすめスポット' : 'Recommended Spots'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {touristSpots.slice(0, 2).map((spot) => (
                  <div key={spot.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                    <ImageWithFallback
                      src={spot.image}
                      alt={spot.name[language]}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {spot.name[language]}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        {getCategoryLabel(spot.category)}
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {spot.description[language]}
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab('spots')}
                >
                  {language === 'ja' ? 'すべてのスポットを見る' : 'View All Spots'}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'spots' && (
          <div className="space-y-4">
            {touristSpots.map((spot) => (
              <Card key={spot.id}>
                <CardContent className="p-0">
                  <ImageWithFallback
                    src={spot.image}
                    alt={spot.name[language]}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {spot.name[language]}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {getCategoryIcon(spot.category)}
                            <span className="ml-1">{getCategoryLabel(spot.category)}</span>
                          </Badge>
                          <div className="flex items-center text-yellow-500">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm ml-1">{spot.rating}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm">
                      {spot.description[language]}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-500">
                        <MapPin className="w-4 h-4 mr-2" />
                        {spot.location}
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-2" />
                        {spot.openHours[language]}
                      </div>
                      {spot.phoneNumber && (
                        <div className="flex items-center text-gray-500">
                          <Phone className="w-4 h-4 mr-2" />
                          {spot.phoneNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'weather' && weatherData && (
          <div className="space-y-4">
            {/* 現在の天気 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  {language === 'ja' ? '現在の天気' : 'Current Weather'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-center space-y-4">
                  <div className="text-6xl">
                    {WeatherService.getWeatherIcon(weatherData.icon)}
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {weatherData.temperature}℃
                    </div>
                    <div className="text-lg text-gray-600">
                      {weatherData.condition}
                    </div>
                  </div>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {weatherData.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 詳細情報 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'ja' ? '詳細情報' : 'Detailed Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-700">
                      {weatherData.humidity}%
                    </div>
                    <div className="text-sm text-blue-600">
                      {language === 'ja' ? '湿度' : 'Humidity'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-yellow-800 text-sm">
                    {weatherData.temperature >= 25 
                      ? (language === 'ja' 
                          ? '🌞 薄着で快適にお過ごしください。日焼け止めをお忘れなく!'
                          : '🌞 Light clothing recommended. Don\'t forget sunscreen!')
                      : weatherData.temperature >= 15
                      ? (language === 'ja'
                          ? '🧥 軽いジャケットがあると良いでしょう。'
                          : '🧥 A light jacket would be good.')
                      : (language === 'ja'
                          ? '🧥 暖かい服装でお出かけください。'
                          : '🧥 Please dress warmly.')
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="text-center text-sm text-gray-500">
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