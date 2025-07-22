import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../ui/tooltip';
import { useLanguage, Language } from '../../../contexts/LanguageContext';
import { Languages, Home, Calendar, Globe, Clock, Users } from 'lucide-react';

interface MobilePageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  isPreview?: boolean;
}

const LANGUAGES = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'ja', label: '日本語', flag: '🇯🇵' },
];

const STAY_PERIODS = [
  { value: '1', label: { ja: '1日', en: '1 Day' } },
  { value: '2', label: { ja: '2日', en: '2 Days' } },
  { value: '3', label: { ja: '3日', en: '3 Days' } },
  { value: '4', label: { ja: '4日', en: '4 Days' } },
  { value: '5', label: { ja: '5日', en: '5 Days' } },
  { value: '7', label: { ja: '1週間', en: '1 Week' } },
  { value: '14', label: { ja: '2週間', en: '2 Weeks' } },
];

export function MobilePageHeader({ title, subtitle, icon, isPreview = false }: MobilePageHeaderProps) {
  const { language, setLanguage } = useLanguage();
  const [selectedStayPeriod, setSelectedStayPeriod] = useState('3');
  const [isStayDialogOpen, setIsStayDialogOpen] = useState(false);

  const handleLPRedirect = () => {
    if (!isPreview) {
      // メインLPページにリダイレクト
      window.location.href = '/';
    }
  };

  const handleStayExtension = (days: string) => {
    setSelectedStayPeriod(days);
    // プレビューモードでない場合のみ実際の処理を行う
    if (!isPreview) {
      // ここで実際の滞在期間延長処理を行う
      // 例: API呼び出し、ローカルストレージ更新など
      console.log(`滞在期間を${days}日に設定しました`);
    }
    setIsStayDialogOpen(false);
  };

  const handleLanguageChange = (value: Language) => {
    setLanguage(value);
  };

  const previewTooltipText = language === 'ja' 
    ? 'プレビューモードでは利用できません' 
    : 'Not available in preview mode';

  return (
    <div className="bg-blue-600 text-white p-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-lg font-bold">{title}</h1>
          <p className="text-blue-100 text-sm">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-2">
          {icon && (
            <div className="opacity-75">
              {icon}
            </div>
          )}
        </div>
      </div>
      
      {/* ツールバー */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-blue-500">
        <div className="flex items-center space-x-2">
          {/* 言語切り替え - プレビューでも有効 */}
          <Select 
            value={language} 
            onValueChange={handleLanguageChange}
          >
            <SelectTrigger className="w-auto bg-blue-500 border-blue-400 text-white text-xs h-8">
              <div className="flex items-center gap-1">
                <Languages className="h-3 w-3" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* LPへのリンク - プレビューでは無効 */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  
                  onClick={handleLPRedirect}
                  disabled={isPreview}
                  className={`h-8 px-2 text-xs bg-blue-500 hover:bg-blue-400 border-blue-400 ${
                    isPreview ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Home className="h-3 w-3 mr-1" />
                  {language === 'ja' ? 'ホーム' : 'Home'}
                </Button>
              </TooltipTrigger>
              {isPreview && (
                <TooltipContent>
                  <p>{previewTooltipText}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center space-x-2">
          {/* 滞在期間延長 - プレビューでも有効 */}
          <Dialog open={isStayDialogOpen} onOpenChange={setIsStayDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                
                className="h-8 px-2 text-xs bg-blue-500 hover:bg-blue-400 border-blue-400"
              >
                <Calendar className="h-3 w-3 mr-1" />
                {language === 'ja' ? '滞在' : 'Stay'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {language === 'ja' ? '滞在期間の設定' : 'Set Stay Period'}
                </DialogTitle>
                <DialogDescription>
                  {language === 'ja' 
                    ? '豊洲エリアでの滞在期間を選択してください。選択した期間に応じて最適な情報をお届けします。'
                    : 'Select your stay period in Toyosu area. We will provide optimal information based on your selected period.'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {STAY_PERIODS.map((period) => (
                    <Button
                      key={period.value}
                      variant={selectedStayPeriod === period.value ? "default" : "outline"}
                      onClick={() => handleStayExtension(period.value)}
                      className="justify-start"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {period.label[language]}
                    </Button>
                  ))}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    {language === 'ja' 
                      ? `現在の設定: ${STAY_PERIODS.find(p => p.value === selectedStayPeriod)?.label.ja}`
                      : `Current setting: ${STAY_PERIODS.find(p => p.value === selectedStayPeriod)?.label.en}`
                    }
                  </p>
                  {isPreview && (
                    <p className="text-blue-600 text-xs mt-1">
                      {language === 'ja' ? 'プレビューモードです' : 'Preview mode'}
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* 現在時刻表示 */}
          <div className="text-right text-xs opacity-90">
            <div>{new Date().toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US')}</div>
            <div className="opacity-75">
              {new Date().toLocaleTimeString(language === 'ja' ? 'ja-JP' : 'en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}