
import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'ja';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    'app.title': 'Toyosu Spots',
    'app.subtitle': 'Discover amazing experiences in Toyosu area',
    'app.welcome': '🇯🇵 Welcome to Japan!',
    
    // Service Benefits
    'benefits.title': 'Special Benefits for Visitors',
    'benefits.subtitle': 'Unlock exclusive deals and insider tips for your Toyosu adventure',
    'benefits.restaurant': 'Restaurant Deals',
    'benefits.photo': 'Photo Spots',
    'benefits.shopping': 'Shopping Discounts',
    'benefits.transport': 'Transport Guide',
    
    // Service Explanation
    'service.title': 'Make Toyosu tourism more convenient and fun.',
    'service.subtitle': 'We deliver perfect information tailored to your current location.',
    'service.notification.title': 'When you turn on notifications,',
    'service.notification.description': 'you can receive real-time information about great shops and exclusive coupons around your current location, as well as important weather and disaster information.',
    'service.conclusion': 'Delicious, fun, and safe. Your smart travel companion for those who want to enjoy Toyosu to the fullest.',
    
    // Weather
    'weather.title': 'Weather & Safety Information',
    'weather.subtitle': 'Stay informed about current conditions for a safe and enjoyable visit',
    'weather.current': 'Current Weather in Toyosu',
    'weather.partlyCloudy': 'Partly Cloudy',
    'weather.safe': 'No weather alerts or disasters reported. Safe for sightseeing! 🌟',
    
    // Tourist Form
    'form.title': 'Let\'s receive notifications!',
    'form.subtitle': 'Please enter your stay information and consent to receive notifications.',
    'form.country.label': 'Which country are you visiting from?',
    'form.country.placeholder': 'Select your country',
    'form.duration.label': 'How long will you be staying in the Toyosu area?',
    'form.duration.placeholder': 'Select your stay duration',
    'form.location.label': 'Location-based Notifications',
    'form.location.description': 'Receive essential safety alerts, local recommendations, and exclusive deals based on your location',
    'form.location.required': 'Location permission is required to receive important notifications during your stay',
    'form.notifications.title': 'You\'ll receive notifications about:',
    'form.notifications.weather': 'Weather warnings and alerts',
    'form.notifications.disasters': 'Disaster and emergency information',
    'form.notifications.safety': 'Safety and security updates',
    'form.notifications.transport': 'Transportation disruptions',
    'form.notifications.events': 'Local events and attractions',
    'form.notifications.discounts': 'Restaurant deals and shopping discounts',
    'form.submit': 'I consent to receive notifications',
    'form.complete.title': 'Welcome to Toyosu!',
    'form.complete.message': 'Your personalized experience is now ready. Enjoy exploring!',
    
    // Duration options
    'duration.1day': '1 day',
    'duration.2days': '2 days',
    'duration.3days': '3 days',
    'duration.4days': '4 days',
    'duration.5days': '5 days',
    'duration.1week': '1 week',
    'duration.2weeks': '2 weeks',
    'duration.3weeks': '3 weeks',
    'duration.4weeks': '4 weeks',
    
    // PWA Install
    'pwa.title': 'Install Toyosu Spots',
    'pwa.subtitle': 'Add this app to your home screen for quick access during your visit!',
    'pwa.button': 'Add to Home Screen',  
    'pwa.guide.show': 'Show Installation Guide',
    'pwa.guide.hide': 'Hide Installation Guide',
    'pwa.guide.iphone': 'For iPhone/Safari:',
    'pwa.guide.android': 'For Android/Chrome:',
    'pwa.guide.iphone.step1': 'Tap the share button (square with arrow)',
    'pwa.guide.iphone.step2': 'Scroll down and tap "Add to Home Screen"',
    'pwa.guide.iphone.step3': 'Tap "Add" to confirm',
    'pwa.guide.android.step1': 'Tap the menu button (three dots)',
    'pwa.guide.android.step2': 'Tap "Add to Home screen"',
    'pwa.guide.android.step3': 'Tap "Add" to confirm',
    
    // Footer
    'footer.enjoy': 'Have a wonderful time in Toyosu! 🗼',
    'footer.support': 'For support, visit our help center or contact staff at any tourist information point.',
    
    // Language Selector
    'language.label': 'Language / 言語',

    // Admin Interface
    'admin.title': 'Admin Panel',
    'admin.lastUpdated': 'Last updated',
    'admin.systemStatus': 'System Normal',
    'admin.returnToMain': 'Return to Main App',
    'admin.logout': 'Logout',
    'admin.menu.dashboard': 'Dashboard',
    'admin.menu.users': 'User Management',
    'admin.menu.notifications': 'Ad-hoc Notifications', // Changed
    'admin.menu.scheduled': 'Scheduled Notifications', // Changed
    'admin.menu.map': 'Location Notifications', // Changed
    'admin.menu.disaster': 'Disaster Management', // Changed
    
    // User Management
    'admin.users.title': 'User Management',
    'admin.users.subtitle': 'Manage and monitor registered users',
    'admin.users.export': 'Export CSV',
    'admin.users.totalUsers': 'Total Users',
    'admin.users.activeUsers': 'Active Users',
    'admin.users.expiredUsers': 'Expired Users',
    'admin.users.todayAccess': 'Today\'s Access',
    'admin.users.list.title': 'User List',
    'admin.users.list.subtitle': 'Detailed information and notification status of registered users',
    'admin.users.search': 'Search by device token, user ID, country...',
    'admin.users.filter.status': 'Filter by status',
    'admin.users.filter.allStatus': 'All statuses',
    'admin.users.filter.active': 'Active',
    'admin.users.filter.expired': 'Expired',
    'admin.users.filter.country': 'Filter by country',
    'admin.users.filter.allCountries': 'All countries',
    'admin.users.table.userId': 'User ID',
    'admin.users.table.deviceToken': 'Device Token',
    'admin.users.table.country': 'Country',
    'admin.users.table.stayEnd': 'Stay End Date',
    'admin.users.table.status': 'Status',
    'admin.users.table.lastAccess': 'Last Access',
    'admin.users.table.registration': 'Registration Date',
    'admin.users.noResults': 'No users match the search criteria',

    // Disaster Management
    'admin.disaster.title': 'Disaster Information Management',
    'admin.disaster.subtitle': 'Disaster information monitoring, automatic notifications, and delivery management',
    'admin.disaster.refresh': 'Refresh',
    'admin.disaster.refreshing': 'Refreshing...',
    'admin.disaster.stats.total': 'Total Disaster Info',
    'admin.disaster.stats.urgent': 'Emergency Info',
    'admin.disaster.stats.autoNotified': 'Auto Notified',
    'admin.disaster.filter.all': 'All',
    'admin.disaster.filter.active': 'Active',
    'admin.disaster.filter.urgent': 'Urgent',
    'admin.disaster.list.title': 'Disaster Information List',
    'admin.disaster.list.subtitle': 'List of disaster information being monitored in real-time (with automatic notification feature)',
    'admin.disaster.table.type': 'Type',
    'admin.disaster.table.title': 'Title',
    'admin.disaster.table.severity': 'Severity',
    'admin.disaster.table.area': 'Target Area',
    'admin.disaster.table.issued': 'Issued Time',
    'admin.disaster.table.notification': 'Notification Status',
    'admin.disaster.table.actions': 'Actions',
    'admin.disaster.notification.sent': 'Auto sent',
    'admin.disaster.notification.notSent': 'Not sent',
    'admin.disaster.severity.emergency': 'Special Warning',
    'admin.disaster.severity.warning': 'Warning',
    'admin.disaster.severity.advisory': 'Advisory',
    'admin.disaster.severity.info': 'Information',
    'admin.disaster.type.earthquake': 'Earthquake',
    'admin.disaster.type.heavyRain': 'Heavy Rain',
    'admin.disaster.type.tsunami': 'Tsunami',
    'admin.disaster.type.typhoon': 'Typhoon',
    'admin.disaster.type.landslide': 'Landslide',
    'admin.disaster.type.flood': 'Flood',
    'admin.disaster.type.storm': 'Storm',
  },
  ja: {
    // Header
    'app.title': 'Toyosu Spots',
    'app.subtitle': '豊洲エリアの素晴らしい体験を発見しよう',
    'app.welcome': '🇯🇵 日本へようこそ！',
    
    // Service Benefits
    'benefits.title': '訪問者限定特典',
    'benefits.subtitle': '豊洲観光をもっと楽しくするお得な情報とインサイダーのコツを解放',
    'benefits.restaurant': 'レストラン割引',
    'benefits.photo': '撮影スポット',
    'benefits.shopping': 'ショッピング割引',
    'benefits.transport': '交通ガイド',
    
    // Service Explanation
    'service.title': '豊洲観光がもっと便利に、もっと楽しく。',
    'service.subtitle': '今いる場所に合わせて、ぴったりな情報をお届けします。',
    'service.notification.title': '通知をオンにすると、',
    'service.notification.description': '現在地周辺のお得なお店情報や限定クーポン、さらに気になる天気・災害情報もリアルタイムで受け取れます。',
    'service.conclusion': 'おいしい・たのしい・あんしん。豊洲をめいっぱい楽しみたいあなたへ、かしこい旅の相棒です。',
    
    // Weather
    'weather.title': '天気・安全情報',
    'weather.subtitle': '安全で楽しい観光のために現在の状況をご確認ください',
    'weather.current': '豊洲の現在の天気',
    'weather.partlyCloudy': '晴れ時々曇り',
    'weather.safe': '気象警報や災害の報告はありません。観光に適しています！🌟',
    
    // Tourist Form
    'form.title': '通知を受け取ろう！',
    'form.subtitle': 'あなたの滞在情報を入力してお知らせの提供に同意してください。',
    'form.country.label': 'どちらの国からお越しですか？',
    'form.country.placeholder': '国を選択してください',
    'form.duration.label': '豊洲エリアにはどのくらい滞在されますか？',
    'form.duration.placeholder': '滞在期間を選択してください',
    'form.location.label': '位置情報ベース通知',
    'form.location.description': '位置情報に基づいて重要な安全情報、地域のおすすめ情報、お得な情報を受け取る',
    'form.location.required': '滞在中の重要な通知を受け取るには位置情報の許可が必要です',
    'form.notifications.title': '以下の通知を受け取ります：',
    'form.notifications.weather': '気象警報・注意報',
    'form.notifications.disasters': '災害・緊急事態の情報',
    'form.notifications.safety': '安全・防犯情報',
    'form.notifications.transport': '交通機関の運行情報',
    'form.notifications.events': '地域イベント・観光地情報',
    'form.notifications.discounts': 'レストラン割引・ショッピング特典',
    'form.submit': '同意して通知を受け取ります',
    'form.complete.title': '豊洲へようこそ！',
    'form.complete.message': 'パーソナライズされた体験の準備が整いました。探索をお楽しみください！',
    
    // Duration options
    'duration.1day': '1日',
    'duration.2days': '2日',
    'duration.3days': '3日',
    'duration.4days': '4日',
    'duration.5days': '5日',
    'duration.1week': '1週間',
    'duration.2weeks': '2週間',
    'duration.3weeks': '3週間',
    'duration.4weeks': '4週間',
    
    // PWA Install
    'pwa.title': 'Toyosu Spotsをインストール',
    'pwa.subtitle': '訪問中の素早いアクセスのために、このアプリをホーム画面に追加してください！',
    'pwa.button': 'ホーム画面に追加',
    'pwa.guide.show': 'インストールガイドを表示',
    'pwa.guide.hide': 'インストールガイドを非表示',
    'pwa.guide.iphone': 'iPhone/Safari の場合：',
    'pwa.guide.android': 'Android/Chrome の場合：',
    'pwa.guide.iphone.step1': 'シェアボタン（矢印付きの四角）をタップ',
    'pwa.guide.iphone.step2': 'スクロールして「ホーム画面に追加」をタップ',
    'pwa.guide.iphone.step3': '「追加」をタップして確認',
    'pwa.guide.android.step1': 'メニューボタン（3つの点）をタップ',
    'pwa.guide.android.step2': '「ホーム画面に追加」をタップ',
    'pwa.guide.android.step3': '「追加」をタップして確認',
    
    // Footer
    'footer.enjoy': '豊洲での素晴らしい時間をお過ごしください！🗼',
    'footer.support': 'サポートが必要な場合は、ヘルプセンターまたは観光案内所のスタッフにお問い合わせください。',
    
    // Language Selector
    'language.label': 'Language / 言語',

    // Admin Interface
    'admin.title': '管理画面',
    'admin.lastUpdated': '最終更新',
    'admin.systemStatus': 'システム正常',
    'admin.returnToMain': 'メインアプリに戻る',
    'admin.logout': 'ログアウト',
    'admin.menu.dashboard': 'ダッシュボード',
    'admin.menu.users': 'ユーザー管理',
    'admin.menu.notifications': '随時通知', // Changed
    'admin.menu.scheduled': '定期通知管理', // Changed
    'admin.menu.map': '地点通知', // Changed
    'admin.menu.disaster': '災害情報管理',
    
    // User Management
    'admin.users.title': 'ユーザー管理',
    'admin.users.subtitle': '登録ユーザーの管理と監視',
    'admin.users.export': 'CSVエクスポート',
    'admin.users.totalUsers': '総ユーザー数',
    'admin.users.activeUsers': 'アクティブユーザー',
    'admin.users.expiredUsers': '期限切れユーザー',
    'admin.users.todayAccess': '今日のアクセス',
    'admin.users.list.title': 'ユーザー一覧',
    'admin.users.list.subtitle': '登録されたユーザーの詳細情報と通知ステータス',
    'admin.users.search': 'デバイストークン、ユーザーID、国名で検索...',
    'admin.users.filter.status': 'ステータスで絞り込み',
    'admin.users.filter.allStatus': 'すべてのステータス',
    'admin.users.filter.active': 'アクティブ',
    'admin.users.filter.expired': '期限切れ',
    'admin.users.filter.country': '国で絞り込み',
    'admin.users.filter.allCountries': 'すべての国',
    'admin.users.table.userId': 'ユーザーID',
    'admin.users.table.deviceToken': 'デバイストークン',
    'admin.users.table.country': '国',
    'admin.users.table.stayEnd': '滞在終了日',
    'admin.users.table.status': 'ステータス',
    'admin.users.table.lastAccess': '最終アクセス',
    'admin.users.table.registration': '登録日',
    'admin.users.noResults': '検索条件に一致するユーザーが見つかりません',

    // Disaster Management
    'admin.disaster.title': '災害情報管理',
    'admin.disaster.subtitle': '災害情報の監視・自動通知・配信管理',
    'admin.disaster.refresh': '更新',
    'admin.disaster.refreshing': '更新中...',
    'admin.disaster.stats.total': '総災害情報数',
    'admin.disaster.stats.urgent': '緊急情報',
    'admin.disaster.stats.autoNotified': '自動通知済み',
    'admin.disaster.filter.all': 'すべて',
    'admin.disaster.filter.active': 'アクティブ',
    'admin.disaster.filter.urgent': '緊急',
    'admin.disaster.list.title': '災害情報一覧',
    'admin.disaster.list.subtitle': 'リアルタイムで監視している災害情報の一覧（自動通知機能付き）',
    'admin.disaster.table.type': '種類',
    'admin.disaster.table.title': 'タイトル',
    'admin.disaster.table.severity': '重要度',
    'admin.disaster.table.area': '対象地域',
    'admin.disaster.table.issued': '発表時刻',
    'admin.disaster.table.notification': '通知状況',
    'admin.disaster.table.actions': '操作',
    'admin.disaster.notification.sent': '自動送信済み',
    'admin.disaster.notification.notSent': '未送信',
    'admin.disaster.severity.emergency': '特別警報',
    'admin.disaster.severity.warning': '警報',
    'admin.disaster.severity.advisory': '注意報',
    'admin.disaster.severity.info': '情報',
    'admin.disaster.type.earthquake': '地震',
    'admin.disaster.type.heavyRain': '大雨',
    'admin.disaster.type.tsunami': '津波',
    'admin.disaster.type.typhoon': '台風',
    'admin.disaster.type.landslide': '土砂災害',
    'admin.disaster.type.flood': '洪水',
    'admin.disaster.type.storm': '暴風',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ja');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
