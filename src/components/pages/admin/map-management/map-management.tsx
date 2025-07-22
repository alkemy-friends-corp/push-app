
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Switch } from '../../../ui/switch';
import { Textarea } from '../../../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../ui/tabs';
import { useAdmin } from '../../../../contexts/AdminContext';
import { useMapCache } from '../../../../hooks/useMapCache';
import { MapPin, Users, Bell, Eye, Navigation, AlertCircle, Download, RefreshCw, HardDrive, Plus, Edit, Trash2, Copy, Activity, Target, List, Settings } from 'lucide-react';
import { toast } from 'sonner';

// Google Maps types
declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

export function MapManagement() {
  const { 
    locationNotifications, 
    areas, 
    getUserCountsByCountry,
    addLocationNotification,
    updateLocationNotification,
    deleteLocationNotification
  } = useAdmin();
  const { cacheStatus, clearCache, preloadMapArea, getCacheStats } = useMapCache();
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCacheLoading, setIsCacheLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('map');

  // 位置通知フォーム関連の状態
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

  // マップ標準範囲設定関連の状態
  const [isMapSettingsOpen, setIsMapSettingsOpen] = useState(false);
  const [mapSettings, setMapSettings] = useState({
    centerLat: '35.6433',
    centerLng: '139.7714',
    defaultZoom: '14'
  });
  const [previewMap, setPreviewMap] = useState<any>(null);
  const previewMapRef = useRef<HTMLDivElement>(null);
  const [isPreviewMapLoaded, setIsPreviewMapLoaded] = useState(false);

  // 豊洲の中心座標
  const toyosuCenter = {
    lat: 35.6433,
    lng: 139.7714
  };

  // 豊洲周辺の重要エリア
  const toyosuAreas = [
    { lat: 35.6433, lng: 139.7714, name: '豊洲駅', zoom: 15 },
    { lat: 35.6495, lng: 139.7717, name: '豊洲市場', zoom: 16 },
    { lat: 35.6356, lng: 139.7756, name: 'お台場', zoom: 14 },
    { lat: 35.6343, lng: 139.7733, name: '豊洲ぐるり公園', zoom: 15 },
    { lat: 35.6403, lng: 139.7685, name: 'ららぽーと豊洲', zoom: 15 }
  ];

  // 豊洲の代表的な座標（プリセット用）
  const toyosuPresetLocations = [
    { name: '豊洲市場', lat: 35.6433, lng: 139.7714 },
    { name: 'ららぽーと豊洲', lat: 35.6458, lng: 139.7853 },
    { name: '豊洲公園', lat: 35.6542, lng: 139.7965 },
  ];

  // 地図上でクリックした位置を設定
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setFormData(prev => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString()
    }));
  }, []);

  // 豊洲周辺エリアの事前読み込み
  const preloadNearbyAreas = useCallback(async () => {
    if (!cacheStatus.isActive) return;
    
    setIsCacheLoading(true);
    try {
      for (const area of toyosuAreas) {
        await preloadMapArea(area.lat, area.lng, area.zoom);
        // 少し待機してAPI制限を回避
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      console.log('Nearby areas preloaded successfully');
    } catch (error) {
      console.error('Failed to preload nearby areas:', error);
    } finally {
      setIsCacheLoading(false);
    }
  }, [cacheStatus.isActive, preloadMapArea, toyosuAreas]);

  // Google Maps APIの非同期読み込み
  const loadGoogleMapsAPI = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      // 既に読み込み済みの場合
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      // 既にスクリプトが読み込み中の場合
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkInterval = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
        return;
      }

      // 新しくスクリプトを読み込み
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY_HERE&libraries=marker&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // APIが利用可能になるまで少し待つ
        const checkGoogle = () => {
          if (window.google && window.google.maps) {
            resolve();
          } else {
            setTimeout(checkGoogle, 10);
          }
        };
        checkGoogle();
      };
      
      script.onerror = () => {
        reject(new Error('Google Maps API failed to load'));
      };

      document.head.appendChild(script);
    });
  }, []);

  // マップの初期化
  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      setIsLoading(true);
      setMapError(null);

      await loadGoogleMapsAPI();

      // Advanced Marker Element が利用可能かチェック
      if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
        throw new Error('Advanced Marker Element is not available');
      }

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: toyosuCenter,
        zoom: 14,
        mapId: 'TOYOSU_MAP', // Advanced Markersに必要
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // マップ読み込み完了後に周辺エリアを事前読み込み
      window.google.maps.event.addListenerOnce(mapInstance, 'tilesloaded', () => {
        preloadNearbyAreas();
      });

      // 地図クリックイベントを追加（新規作成時のみ）
      mapInstance.addListener('click', (event: any) => {
        const dialogOpenNow = document.querySelector('[role="dialog"]') !== null;
        const editingNow = document.querySelector('[role="dialog"] [data-editing]') !== null;
        
        if (dialogOpenNow && !editingNow) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          handleMapClick(lat, lng);
          toast.success('地図上の位置を設定しました');
        }
      });

      setMap(mapInstance);
      setIsMapLoaded(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError(error instanceof Error ? error.message : '地図の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [loadGoogleMapsAPI, handleMapClick, preloadNearbyAreas]);

  // マップの初期化
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // 現在のマップ位置を設定に反映
  const getCurrentMapPosition = () => {
    if (map) {
      const center = map.getCenter();
      const zoom = map.getZoom();
      
      setMapSettings({
        centerLat: center.lat().toFixed(6),
        centerLng: center.lng().toFixed(6),
        defaultZoom: zoom.toString()
      });
      
      toast.success('現在のマップ位置を取得しました');
    }
  };

  // プレビューマップの初期化
  const initializePreviewMap = useCallback(async () => {
    if (!previewMapRef.current || !window.google?.maps) return;

    try {
      const centerLat = parseFloat(mapSettings.centerLat) || toyosuCenter.lat;
      const centerLng = parseFloat(mapSettings.centerLng) || toyosuCenter.lng;
      const zoom = parseInt(mapSettings.defaultZoom) || 14;

      const previewMapInstance = new window.google.maps.Map(previewMapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: zoom,
        mapId: 'TOYOSU_PREVIEW_MAP',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // プレビューマップでのクリックイベント
      previewMapInstance.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        
        setMapSettings(prev => ({
          ...prev,
          centerLat: lat.toFixed(6),
          centerLng: lng.toFixed(6)
        }));
        
        previewMapInstance.setCenter({ lat, lng });
        toast.success('地図上の位置を設定しました');
      });

      // ズーム変更イベント
      previewMapInstance.addListener('zoom_changed', () => {
        const newZoom = previewMapInstance.getZoom();
        setMapSettings(prev => ({
          ...prev,
          defaultZoom: newZoom.toString()
        }));
      });

      // ドラッグ終了イベント
      previewMapInstance.addListener('dragend', () => {
        const center = previewMapInstance.getCenter();
        setMapSettings(prev => ({
          ...prev,
          centerLat: center.lat().toFixed(6),
          centerLng: center.lng().toFixed(6)
        }));
      });

      setPreviewMap(previewMapInstance);
      setIsPreviewMapLoaded(true);
    } catch (error) {
      console.error('Error initializing preview map:', error);
    }
  }, [mapSettings.centerLat, mapSettings.centerLng, mapSettings.defaultZoom]);

  // プレビューマップの位置とズームを更新
  const updatePreviewMap = useCallback(() => {
    if (!previewMap || !isPreviewMapLoaded) return;

    const centerLat = parseFloat(mapSettings.centerLat);
    const centerLng = parseFloat(mapSettings.centerLng);
    const zoom = parseInt(mapSettings.defaultZoom);

    if (!isNaN(centerLat) && !isNaN(centerLng) && !isNaN(zoom)) {
      previewMap.setCenter({ lat: centerLat, lng: centerLng });
      previewMap.setZoom(zoom);
    }
  }, [previewMap, isPreviewMapLoaded, mapSettings]);

  // プレビューマップの設定が変更されたときに更新
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updatePreviewMap();
    }, 300); // デバウンス

    return () => clearTimeout(timeoutId);
  }, [updatePreviewMap]);

  // マップ設定ダイアログが開かれたときにプレビューマップを初期化
  useEffect(() => {
    if (isMapSettingsOpen && window.google?.maps && !isPreviewMapLoaded) {
      const timer = setTimeout(() => {
        initializePreviewMap();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isMapSettingsOpen, initializePreviewMap, isPreviewMapLoaded]);

  // マップ設定ダイアログが閉じられたときにプレビューマップをクリーンアップ
  useEffect(() => {
    if (!isMapSettingsOpen) {
      setPreviewMap(null);
      setIsPreviewMapLoaded(false);
    }
  }, [isMapSettingsOpen]);

  // プリセット位置への移動
  const moveToPresetLocation = (location: { name: string, lat: number, lng: number }) => {
    setMapSettings({
      centerLat: location.lat.toFixed(6),
      centerLng: location.lng.toFixed(6),
      defaultZoom: '15'
    });
    
    if (previewMap && isPreviewMapLoaded) {
      previewMap.setCenter({ lat: location.lat, lng: location.lng });
      previewMap.setZoom(15);
    }
  };

  // マップ標準範囲設定の処理
  const handleMapSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const centerLat = parseFloat(mapSettings.centerLat);
    const centerLng = parseFloat(mapSettings.centerLng);
    const zoom = parseInt(mapSettings.defaultZoom);
    
    if (map) {
      map.setCenter({ lat: centerLat, lng: centerLng });
      map.setZoom(zoom);
      
      // ローカルストレージに保存
      localStorage.setItem('toyosu-map-settings', JSON.stringify({
        centerLat,
        centerLng,
        defaultZoom: zoom
      }));
      
      toast.success('マップの標準範囲を設定しました');
    }
    
    setIsMapSettingsOpen(false);
  };

  // 保存された設定を読み込み
  useEffect(() => {
    const savedSettings = localStorage.getItem('toyosu-map-settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setMapSettings({
          centerLat: settings.centerLat.toString(),
          centerLng: settings.centerLng.toString(),
          defaultZoom: settings.defaultZoom.toString()
        });
      } catch (error) {
        console.error('Failed to load map settings:', error);
      }
    }
  }, []);

  // SVGアイコンの作成
  const createMarkerIcon = (color: string, isNotification: boolean) => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "32");
    svg.setAttribute("height", "32");
    svg.setAttribute("viewBox", "0 0 32 32");
    
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "16");
    circle.setAttribute("cy", "16");
    circle.setAttribute("r", "15");
    circle.setAttribute("fill", color);
    circle.setAttribute("stroke", "white");
    circle.setAttribute("stroke-width", "2");
    
    if (isNotification) {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M16 8L19 14H13L16 8Z");
      path.setAttribute("fill", "white");
      
      const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      innerCircle.setAttribute("cx", "16");
      innerCircle.setAttribute("cy", "20");
      innerCircle.setAttribute("r", "2");
      innerCircle.setAttribute("fill", "white");
      
      svg.appendChild(circle);
      svg.appendChild(path);
      svg.appendChild(innerCircle);
    } else {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", "10");
      rect.setAttribute("y", "10");
      rect.setAttribute("width", "12");
      rect.setAttribute("height", "12");
      rect.setAttribute("fill", "white");
      rect.setAttribute("rx", "2");
      
      const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      innerCircle.setAttribute("cx", "16");
      innerCircle.setAttribute("cy", "16");
      innerCircle.setAttribute("r", "2");
      innerCircle.setAttribute("fill", color);
      
      svg.appendChild(circle);
      svg.appendChild(rect);
      svg.appendChild(innerCircle);
    }
    
    return svg;
  };

  // マーカの追加
  useEffect(() => {
    if (!map || !isMapLoaded || !window.google?.maps?.marker?.AdvancedMarkerElement) return;

    // 既存のマーカーをクリア
    markers.forEach(marker => {
      if (marker.marker && marker.marker.map) {
        marker.marker.map = null;
      }
      if (marker.circle) {
        marker.circle.setMap(null);
      }
    });
    setMarkers([]);

    const newMarkers: any[] = [];

    try {
      // 位置通知エリアのマーカーを追加
      locationNotifications.forEach((notification) => {
        const markerIcon = createMarkerIcon('#3B82F6', true);
        
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: notification.latitude, lng: notification.longitude },
          map: map,
          title: notification.name,
          content: markerIcon
        });

        // 円形エリアを表示
        const circle = new window.google.maps.Circle({
          strokeColor: '#3B82F6',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#3B82F6',
          fillOpacity: 0.2,
          map: map,
          center: { lat: notification.latitude, lng: notification.longitude },
          radius: notification.radius
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-3 max-w-sm">
              <h3 class="font-medium text-lg mb-2">${notification.name}</h3>
              <p class="text-sm text-gray-600 mb-2">${notification.title}</p>
              <div class="flex items-center gap-2 text-xs">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded">位置通知</span>
                <span class="px-2 py-1 ${notification.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} rounded">
                  ${notification.isActive ? 'アクティブ' : '非アクティブ'}
                </span>
              </div>
              <div class="mt-2 text-xs text-gray-500">
                半径: ${notification.radius}m • クールダウン: ${notification.cooldownMinutes}分
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          setSelectedLocation({ ...notification, type: 'notification' });
        });

        newMarkers.push({ marker, circle });
      });

      // エリアのマーカーを追加
      areas.forEach((area) => {
        const markerIcon = createMarkerIcon('#10B981', false);
        
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          position: { lat: area.latitude, lng: area.longitude },
          map: map,
          title: area.name,
          content: markerIcon
        });

        // 円形エリアを表示
        const circle = new window.google.maps.Circle({
          strokeColor: '#10B981',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#10B981',
          fillOpacity: 0.2,
          map: map,
          center: { lat: area.latitude, lng: area.longitude },
          radius: area.radius
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-3 max-w-sm">
              <h3 class="font-medium text-lg mb-2">${area.name}</h3>
              <p class="text-sm text-gray-600 mb-2">${area.description}</p>
              <div class="flex items-center gap-2 text-xs">
                <span class="px-2 py-1 bg-green-100 text-green-800 rounded">エリア</span>
                <span class="px-2 py-1 ${area.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} rounded">
                  ${area.isActive ? 'アクティブ' : '非アクティブ'}
                </span>
              </div>
              <div class="mt-2 text-xs text-gray-500">
                半径: ${area.radius}m • 現在のユーザー: ${area.userCount}人
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
          setSelectedLocation({ ...area, type: 'area' });
        });

        newMarkers.push({ marker, circle });
      });

      setMarkers(newMarkers);
    } catch (error) {
      console.error('Error adding markers:', error);
      setMapError('マーカーの追加に失敗しました');
    }
  }, [map, isMapLoaded, locationNotifications, areas]);

  // キャッシュの手動更新
  const handleCacheRefresh = async () => {
    setIsCacheLoading(true);
    try {
      await clearCache();
      await preloadNearbyAreas();
    } catch (error) {
      console.error('Failed to refresh cache:', error);
    } finally {
      setIsCacheLoading(false);
    }
  };

  // 統計情報の更新
  const handleUpdateStats = async () => {
    try {
      await getCacheStats();
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  };

  // 位置通知フォーム関連の関数
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

  const setPresetLocation = (location: { name: string, lat: number, lng: number }) => {
    setFormData({
      ...formData,
      name: location.name + 'エリア',
      latitude: location.lat.toString(),
      longitude: location.lng.toString()
    });
  };

  const centerOnToyosu = () => {
    if (map) {
      map.setCenter(toyosuCenter);
      map.setZoom(14);
    }
  };

  const retryMapLoad = () => {
    setMapError(null);
    initializeMap();
  };

  const totalLocations = locationNotifications.length + areas.length;
  const activeLocations = locationNotifications.filter(n => n.isActive).length + areas.filter(a => a.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">地点通知管理</h1>
          <p className="text-gray-600">位置通知とエリア設定の統合管理</p>
          
          {/* キャッシュ状態表示 */}
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${
              cacheStatus.isActive ? 'bg-green-500' : 
              cacheStatus.isSupported ? 'bg-yellow-500' : 'bg-gray-400'
            }`}></div>
            <span className="text-sm text-gray-600">
              キャッシュ: {
                cacheStatus.isActive ? 'アクティブ' : 
                cacheStatus.isSupported ? '初期化中' : '非対応'
              }
            </span>
            {cacheStatus.cacheSize > 0 && (
              <Badge variant="outline" className="text-xs">
                {cacheStatus.cacheSize}件
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {/* 位置通知作成ボタン */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  新規位置通知
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" data-editing={editingNotification ? 'true' : 'false'}>
                <DialogHeader>
                  <DialogTitle>
                    {editingNotification ? '位置通知を編集' : '新規位置通知作成'}
                  </DialogTitle>
                  <DialogDescription>
                    特定の場所でトリガーされる通知を設定してください
                    {!editingNotification && ' (地図をクリックして位置を設定できます)'}
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
                      {toyosuPresetLocations.map((location) => (
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
                      <Label htmlFor="cooldownMinutes">クールダウン（分）</Label>
                      <Input
                        id="cooldownMinutes"
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
                      placeholder="例: 豊洲市場へようこそ"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">通知メッセージ</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="例: 豊洲市場の新鮮な魚介類をお楽しみください"
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
                      {editingNotification ? '更新' : '作成'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
            {/* マップ設定ボタン */}
            <Dialog open={isMapSettingsOpen} onOpenChange={setIsMapSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" >
                  <Settings className="w-4 h-4 mr-2" />
                  マップ設定
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>マップ標準範囲設定</DialogTitle>
                  <DialogDescription>
                    マップの初期表示位置とズームレベルを設定してください
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      
                      onClick={getCurrentMapPosition}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      現在のマップ位置を取得
                    </Button>
                    <span className="text-sm text-gray-600">
                      メインマップの現在の位置とズームレベルを取得できます
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>プリセット位置</Label>
                        <div className="space-y-2">
                          {toyosuPresetLocations.map((location) => (
                            <Button
                              key={location.name}
                              type="button"
                              variant="outline"
                              
                              onClick={() => moveToPresetLocation(location)}
                              className="w-full"
                            >
                              {location.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      <form onSubmit={handleMapSettingsSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="centerLat">中心座標 - 緯度</Label>
                          <Input
                            id="centerLat"
                            type="number"
                            step="any"
                            value={mapSettings.centerLat}
                            onChange={(e) => setMapSettings({...mapSettings, centerLat: e.target.value})}
                            placeholder="35.6433"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="centerLng">中心座標 - 経度</Label>
                          <Input
                            id="centerLng"
                            type="number"
                            step="any"
                            value={mapSettings.centerLng}
                            onChange={(e) => setMapSettings({...mapSettings, centerLng: e.target.value})}
                            placeholder="139.7714"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="defaultZoom">デフォルトズーム</Label>
                          <Input
                            id="defaultZoom"
                            type="number"
                            min="1"
                            max="20"
                            value={mapSettings.defaultZoom}
                            onChange={(e) => setMapSettings({...mapSettings, defaultZoom: e.target.value})}
                            placeholder="14"
                            required
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setIsMapSettingsOpen(false)}>
                            キャンセル
                          </Button>
                          <Button type="submit">
                            設定を保存
                          </Button>
                        </div>
                      </form>
                    </div>

                    <div className="space-y-2">
                      <Label>プレビュー</Label>
                      <div className="border rounded-lg overflow-hidden">
                        <div 
                          ref={previewMapRef}
                          className="w-full h-96 bg-gray-100 flex items-center justify-center"
                        >
                          {!isPreviewMapLoaded && (
                            <span className="text-gray-500">プレビューマップを読み込み中...</span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        プレビューマップをクリックして位置を調整できます
                      </p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">総地点数</p>
                <p className="text-2xl">{totalLocations}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">位置通知</p>
                <p className="text-2xl text-blue-600">{locationNotifications.length}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-4 h-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">アクティブ</p>
                <p className="text-2xl text-orange-600">{activeLocations}</p>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            地図表示
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            位置通知一覧
          </TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* マップ */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>地点マップ</CardTitle>
                      <CardDescription>
                        設定済みの位置通知とエリアを地図上で確認
                        {isDialogOpen && !editingNotification && ' (地図をクリックして位置を設定)'}
                      </CardDescription>
                    </div>
                    <Dialog open={isMapSettingsOpen} onOpenChange={setIsMapSettingsOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" >
                          <Settings className="w-4 h-4 mr-2" />
                          マップ設定
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>マップ標準範囲設定</DialogTitle>
                          <DialogDescription>
                            マップの初期表示位置と縮尺を設定します
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleMapSettingsSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="centerLat">中心緯度</Label>
                              <Input
                                id="centerLat"
                                type="number"
                                step="any"
                                value={mapSettings.centerLat}
                                onChange={(e) => setMapSettings({...mapSettings, centerLat: e.target.value})}
                                placeholder="35.6433"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="centerLng">中心経度</Label>
                              <Input
                                id="centerLng"
                                type="number"
                                step="any"
                                value={mapSettings.centerLng}
                                onChange={(e) => setMapSettings({...mapSettings, centerLng: e.target.value})}
                                placeholder="139.7714"
                                required
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="defaultZoom">標準ズームレベル</Label>
                            <Input
                              id="defaultZoom"
                              type="number"
                              min="1"
                              max="20"
                              value={mapSettings.defaultZoom}
                              onChange={(e) => setMapSettings({...mapSettings, defaultZoom: e.target.value})}
                              placeholder="14"
                              required
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={getCurrentMapPosition}
                              disabled={!isMapLoaded}
                              className="flex-1"
                            >
                              <Target className="w-4 h-4 mr-2" />
                              現在位置取得
                            </Button>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsMapSettingsOpen(false)}>
                              キャンセル
                            </Button>
                            <Button type="submit">
                              <Settings className="w-4 h-4 mr-2" />
                              設定
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {!mapError && (
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-sm">位置通知</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center relative">
                    {mapError ? (
                      <div className="text-center p-8">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                        <p className="text-red-600 mb-2">マップの読み込みに失敗しました</p>
                        <p className="text-sm text-gray-500 mb-4">{mapError}</p>
                        <div className="space-y-2">
                          <Button onClick={retryMapLoad} variant="outline">
                            再試行
                          </Button>
                          <p className="text-xs text-gray-400">
                            実際の使用時にはGoogle Maps APIキーを設定してください
                          </p>
                        </div>
                      </div>
                    ) : isLoading ? (
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">マップを読み込み中...</p>
                        {isCacheLoading && (
                          <p className="text-xs text-blue-500 mt-2">
                            周辺エリアをキャッシュ中...
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <div 
                          ref={mapRef} 
                          className="w-full h-full rounded-lg"
                        />
                        {/* キャッシュ読み込み中のオーバーレイ */}
                        {isCacheLoading && (
                          <div className="absolute bottom-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            キャッシュ中...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* サイドパネル */}
            <div className="space-y-4">
              {/* 位置通知一覧 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">位置通知</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {locationNotifications.map((notification) => (
                      <div 
                        key={notification.id}
                        className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                          selectedLocation?.id === notification.id && selectedLocation?.type === 'notification'
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          if (map && !mapError) {
                            map.setCenter({ lat: notification.latitude, lng: notification.longitude });
                            map.setZoom(16);
                          }
                          setSelectedLocation({ ...notification, type: 'notification' });
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              <h4 className="font-medium text-sm">{notification.name}</h4>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{notification.title}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant={notification.isActive ? "default" : "secondary"} className="text-xs">
                                {notification.isActive ? 'アクティブ' : '非アクティブ'}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(notification);
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(notification.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          {/* 位置通知統計 */}
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

          {/* 位置通知一覧テーブル */}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
