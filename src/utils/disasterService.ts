// 災害情報管理サービス
export interface DisasterInfo {
  id: string;
  type: 'earthquake' | 'heavyRain' | 'tsunami' | 'typhoon' | 'landslide' | 'flood' | 'storm';
  severity: 'advisory' | 'warning' | 'emergency';
  title: string;
  description: string;
  area: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  issuedAt: string;
  validUntil?: string;
  source: string;
  details?: {
    magnitude?: number; // 地震の場合
    depth?: number; // 地震の場合
    epicenter?: string; // 地震の場合
    rainfallAmount?: number; // 大雨の場合
    windSpeed?: number; // 台風の場合
    waveHeight?: number; // 津波の場合
  };
  urgent: boolean;
  affectedPopulation?: number;
  instructions?: string[];
  autoNotificationSent: boolean;
  autoNotificationSentAt?: string;
}

export interface DisasterNotification {
  id: string;
  disasterId: string;
  title: string;
  message: string;
  type: 'immediate';
  severity: 'advisory' | 'warning' | 'emergency';
  sentAt: string;
  targetUsers: 'all' | 'area';
  targetArea?: string;
  recipientCount: number;
  status: 'sent' | 'failed' | 'sending';
  deliveryStatus: {
    sent: number;
    delivered: number;
    failed: number;
  };
  isAutoSent: boolean;
  failureReason?: string;
}

class DisasterService {
  private disasters: DisasterInfo[] = [];
  private notifications: DisasterNotification[] = [];
  private callbacks: ((disaster: DisasterInfo) => void)[] = [];
  private autoNotificationCallbacks: ((notification: DisasterNotification) => void)[] = [];

  constructor() {
    // 初期化時にサンプルデータを読み込み
    this.loadSampleData();
    // 定期的に新しい災害情報をチェック
    this.startMonitoring();
  }

  private loadSampleData() {
    // 過去の災害情報のサンプル
    const sampleDisasters: DisasterInfo[] = [
      {
        id: 'disaster_001',
        type: 'earthquake',
        severity: 'warning',
        title: '地震情報',
        description: '東京湾北部を震源とする地震が発生しました',
        area: '東京都江東区',
        coordinates: { lat: 35.6762, lng: 139.6503 },
        issuedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分前
        source: '気象庁',
        details: {
          magnitude: 4.2,
          depth: 20,
          epicenter: '東京湾北部'
        },
        urgent: true,
        affectedPopulation: 150000,
        instructions: [
          '身の安全を確保してください',
          '火の始末をしてください',
          '出口を確保してください'
        ],
        autoNotificationSent: true,
        autoNotificationSentAt: new Date(Date.now() - 1000 * 60 * 28).toISOString()
      },
      {
        id: 'disaster_002',
        type: 'heavyRain',
        severity: 'advisory',
        title: '大雨注意報',
        description: '東京地方に大雨注意報が発表されました',
        area: '東京都23区',
        issuedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2時間前
        validUntil: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(), // 6時間後まで
        source: '気象庁',
        details: {
          rainfallAmount: 30
        },
        urgent: false,
        affectedPopulation: 900000,
        instructions: [
          '不要不急の外出は控えてください',
          '河川や用水路には近づかないでください',
          '地下や半地下の建物では浸水に注意してください'
        ],
        autoNotificationSent: true,
        autoNotificationSentAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5).toISOString()
      }
    ];

    // サンプル通知履歴
    const sampleNotifications: DisasterNotification[] = [
      {
        id: 'notification_001',
        disasterId: 'disaster_001',
        title: '地震情報',
        message: '【地震情報】\n東京湾北部を震源とする地震が発生しました\n\n対象地域: 東京都江東区\nマグニチュード: 4.2\n\n【行動指針】\n1. 身の安全を確保してください\n2. 火の始末をしてください\n3. 出口を確保してください\n\n発表: 気象庁',
        type: 'immediate',
        severity: 'warning',
        sentAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
        targetUsers: 'all',
        recipientCount: 1247,
        status: 'sent',
        deliveryStatus: {
          sent: 1247,
          delivered: 1180,
          failed: 67
        },
        isAutoSent: true
      },
      {
        id: 'notification_002',
        disasterId: 'disaster_002',
        title: '大雨注意報',
        message: '【大雨注意報】\n東京地方に大雨注意報が発表されました\n\n対象地域: 東京都23区\n予想雨量: 30mm/h\n\n【行動指針】\n1. 不要不急の外出は控えてください\n2. 河川や用水路には近づかないでください\n3. 地下や半地下の建物では浸水に注意してください\n\n発表: 気象庁',
        type: 'immediate',
        severity: 'advisory',
        sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 1000 * 60 * 5).toISOString(),
        targetUsers: 'all',
        recipientCount: 1156,
        status: 'sent',
        deliveryStatus: {
          sent: 1156,
          delivered: 1089,
          failed: 67
        },
        isAutoSent: true
      }
    ];

    this.disasters = sampleDisasters;
    this.notifications = sampleNotifications;
  }

  private startMonitoring() {
    // 実際の本番環境では、災害情報APIを定期的にポーリング
    setInterval(() => {
      this.checkForNewDisasters();
    }, 30000); // 30秒ごとにチェック
  }

  private async checkForNewDisasters() {
    // 実際の本番環境では外部APIを呼び出し
    // ここではサンプルデータで新しい災害情報をシミュレート
    if (Math.random() < 0.02) { // 2%の確率で新しい災害情報
      const newDisaster = this.generateSampleDisaster();
      this.disasters.unshift(newDisaster);
      
      // コールバックを実行
      this.callbacks.forEach(callback => callback(newDisaster));
      
      // 自動通知の判定と送信
      await this.processAutoNotification(newDisaster);
    }
  }

  private async processAutoNotification(disaster: DisasterInfo) {
    // 自動通知の条件判定
    const shouldAutoNotify = this.shouldSendAutoNotification(disaster);
    
    if (shouldAutoNotify && !disaster.autoNotificationSent) {
      try {
        // 自動通知の送信
        const notification = await this.sendAutoNotification(disaster);
        
        // 災害情報の自動通知フラグを更新
        disaster.autoNotificationSent = true;
        disaster.autoNotificationSentAt = new Date().toISOString();
        
        // 通知履歴に追加
        this.notifications.unshift(notification);
        
        // 自動通知コールバックを実行
        this.autoNotificationCallbacks.forEach(callback => callback(notification));
        
        console.log(`自動通知を送信しました: ${disaster.title}`);
      } catch (error) {
        console.error('自動通知の送信に失敗しました:', error);
      }
    }
  }

  private shouldSendAutoNotification(disaster: DisasterInfo): boolean {
    // 自動通知の条件
    if (disaster.severity === 'emergency') {
      return true; // 特別警報は必ず自動送信
    }
    
    if (disaster.urgent) {
      return true; // 緊急フラグが立っている場合は自動送信
    }
    
    if (disaster.severity === 'warning') {
      // 警報の場合は災害タイプに応じて判定
      const autoNotifyTypes: DisasterInfo['type'][] = ['earthquake', 'tsunami', 'typhoon'];
      return autoNotifyTypes.includes(disaster.type);
    }
    
    return false; // その他の場合は手動送信
  }

  private async sendAutoNotification(disaster: DisasterInfo): Promise<DisasterNotification> {
    // 実際の本番環境では、プッシュ通知サービスを呼び出し
    const notification: DisasterNotification = {
      id: `auto_notification_${Date.now()}`,
      disasterId: disaster.id,
      title: disaster.title,
      message: this.generateNotificationMessage(disaster),
      type: 'immediate',
      severity: disaster.severity,
      sentAt: new Date().toISOString(),
      targetUsers: 'all',
      recipientCount: this.calculateRecipientCount(),
      status: 'sending',
      deliveryStatus: {
        sent: 0,
        delivered: 0,
        failed: 0
      },
      isAutoSent: true
    };

    // 配信処理のシミュレーション
    await this.simulateDelivery(notification);

    return notification;
  }

  private async simulateDelivery(notification: DisasterNotification) {
    // 配信処理のシミュレーション（実際の本番環境では実際の配信処理）
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const totalRecipients = notification.recipientCount;
        const failureRate = Math.random() * 0.1; // 0-10%の失敗率
        const failed = Math.floor(totalRecipients * failureRate);
        const sent = totalRecipients;
        const delivered = sent - failed;

        notification.deliveryStatus = {
          sent,
          delivered,
          failed
        };
        notification.status = 'sent';
        
        resolve();
      }, 2000); // 2秒後に配信完了
    });
  }

  private calculateRecipientCount(): number {
    // 実際の本番環境では、アクティブユーザー数を取得
    return Math.floor(Math.random() * 2000) + 500; // 500-2500人
  }

  private generateSampleDisaster(): DisasterInfo {
    const types: DisasterInfo['type'][] = ['earthquake', 'heavyRain', 'tsunami', 'typhoon', 'landslide'];
    const severities: DisasterInfo['severity'][] = ['advisory', 'warning', 'emergency'];
    const areas = ['東京都江東区', '東京都中央区', '東京都港区', '東京都千代田区'];

    const type = types[Math.floor(Math.random() * types.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const area = areas[Math.floor(Math.random() * areas.length)];

    const baseDisaster: DisasterInfo = {
      id: `disaster_${Date.now()}`,
      type,
      severity,
      title: this.getDisasterTitle(type, severity),
      description: this.getDisasterDescription(type, severity),
      area,
      coordinates: { lat: 35.6762 + (Math.random() - 0.5) * 0.1, lng: 139.6503 + (Math.random() - 0.5) * 0.1 },
      issuedAt: new Date().toISOString(),
      source: '気象庁',
      urgent: severity === 'emergency' || (type === 'earthquake' && Math.random() < 0.7),
      affectedPopulation: Math.floor(Math.random() * 500000) + 50000,
      instructions: this.getInstructions(type, severity),
      autoNotificationSent: false
    };

    // 災害タイプに応じた詳細情報を追加
    switch (type) {
      case 'earthquake':
        baseDisaster.details = {
          magnitude: Math.round((Math.random() * 4 + 3) * 10) / 10,
          depth: Math.floor(Math.random() * 50) + 10,
          epicenter: '東京湾北部'
        };
        break;
      case 'heavyRain':
        baseDisaster.details = {
          rainfallAmount: Math.floor(Math.random() * 80) + 20
        };
        baseDisaster.validUntil = new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString();
        break;
      case 'typhoon':
        baseDisaster.details = {
          windSpeed: Math.floor(Math.random() * 40) + 20
        };
        break;
      case 'tsunami':
        baseDisaster.details = {
          waveHeight: Math.round((Math.random() * 3 + 0.5) * 10) / 10
        };
        break;
    }

    return baseDisaster;
  }

  private getDisasterTitle(type: DisasterInfo['type'], severity: DisasterInfo['severity']): string {
    const titles = {
      earthquake: {
        advisory: '地震情報',
        warning: '地震警報',
        emergency: '緊急地震速報'
      },
      heavyRain: {
        advisory: '大雨注意報',
        warning: '大雨警報',
        emergency: '大雨特別警報'
      },
      tsunami: {
        advisory: '津波注意報',
        warning: '津波警報',
        emergency: '大津波警報'
      },
      typhoon: {
        advisory: '台風注意報',
        warning: '台風警報',
        emergency: '台風特別警報'
      },
      landslide: {
        advisory: '土砂災害注意報',
        warning: '土砂災害警戒情報',
        emergency: '土砂災害特別警戒情報'
      },
      flood: {
        advisory: '洪水注意報',
        warning: '洪水警報',
        emergency: '洪水特別警報'
      },
      storm: {
        advisory: '暴風注意報',
        warning: '暴風警報',
        emergency: '暴風特別警報'
      }
    };

    return titles[type][severity];
  }

  private getDisasterDescription(type: DisasterInfo['type'], severity: DisasterInfo['severity']): string {
    const descriptions = {
      earthquake: {
        advisory: '地震が発生しました。今後の情報に注意してください。',
        warning: '強い地震が発生しました。身の安全を確保してください。',
        emergency: '緊急地震速報が発表されました。直ちに身の安全を確保してください。'
      },
      heavyRain: {
        advisory: '大雨による被害に注意してください。',
        warning: '大雨による重大な被害が発生する可能性があります。',
        emergency: '大雨特別警報が発表されました。直ちに安全を確保してください。'
      },
      tsunami: {
        advisory: '津波が観測される可能性があります。',
        warning: '津波警報が発表されました。直ちに高台に避難してください。',
        emergency: '大津波警報が発表されました。直ちに高台に避難してください。'
      },
      typhoon: {
        advisory: '台風の接近により強風や大雨に注意してください。',
        warning: '台風による重大な被害が発生する可能性があります。',
        emergency: '台風特別警報が発表されました。直ちに安全を確保してください。'
      },
      landslide: {
        advisory: '土砂災害に注意してください。',
        warning: '土砂災害警戒情報が発表されました。',
        emergency: '土砂災害特別警戒情報が発表されました。直ちに避難してください。'
      },
      flood: {
        advisory: '洪水に注意してください。',
        warning: '洪水警報が発表されました。',
        emergency: '洪水特別警報が発表されました。直ちに安全を確保してください。'
      },
      storm: {
        advisory: '暴風に注意してください。',
        warning: '暴風警報が発表されました。',
        emergency: '暴風特別警報が発表されました。直ちに安全を確保してください。'
      }
    };

    return descriptions[type][severity];
  }

  private getInstructions(type: DisasterInfo['type'], severity: DisasterInfo['severity']): string[] {
    const instructions = {
      earthquake: [
        '身の安全を確保してください',
        '火の始末をしてください',
        '出口を確保してください',
        '落下物に注意してください'
      ],
      heavyRain: [
        '不要不急の外出は控えてください',
        '河川や用水路には近づかないでください',
        '地下や半地下の建物では浸水に注意してください',
        '避難情報に注意してください'
      ],
      tsunami: [
        '直ちに高台に避難してください',
        '海岸や河川には近づかないでください',
        '津波は繰り返し襲来します',
        '避難情報に従ってください'
      ],
      typhoon: [
        '不要不急の外出は控えてください',
        '窓ガラスの補強をしてください',
        '飛散物に注意してください',
        '停電に備えてください'
      ],
      landslide: [
        '山間部から離れてください',
        'がけ崩れに注意してください',
        '避難経路を確認してください',
        '避難指示が出た場合は直ちに避難してください'
      ],
      flood: [
        '低い土地から離れてください',
        '河川には近づかないでください',
        '地下室や半地下は避けてください',
        '避難情報に注意してください'
      ],
      storm: [
        '屋外での活動は控えてください',
        '飛散物に注意してください',
        '高所作業は中止してください',
        '交通機関の運休に注意してください'
      ]
    };

    return instructions[type];
  }

  // 災害情報の取得
  public getDisasters(): DisasterInfo[] {
    return [...this.disasters].sort((a, b) => 
      new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime()
    );
  }

  // アクティブな災害情報の取得
  public getActiveDisasters(): DisasterInfo[] {
    const now = new Date();
    return this.disasters.filter(disaster => {
      if (!disaster.validUntil) return true;
      return new Date(disaster.validUntil) > now;
    });
  }

  // 緊急度の高い災害情報の取得
  public getUrgentDisasters(): DisasterInfo[] {
    return this.disasters.filter(disaster => 
      disaster.urgent || disaster.severity === 'emergency'
    );
  }

  // 特定の災害情報の取得
  public getDisasterById(id: string): DisasterInfo | null {
    return this.disasters.find(disaster => disaster.id === id) || null;
  }

  // 災害情報の通知履歴
  public getNotifications(): DisasterNotification[] {
    return [...this.notifications].sort((a, b) => 
      new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
  }

  // 災害情報の手動通知を送信
  public async sendDisasterNotification(disaster: DisasterInfo): Promise<DisasterNotification> {
    const notification: DisasterNotification = {
      id: `manual_notification_${Date.now()}`,
      disasterId: disaster.id,
      title: disaster.title,
      message: this.generateNotificationMessage(disaster),
      type: 'immediate',
      severity: disaster.severity,
      sentAt: new Date().toISOString(),
      targetUsers: 'all',
      recipientCount: this.calculateRecipientCount(),
      status: 'sending',
      deliveryStatus: {
        sent: 0,
        delivered: 0,
        failed: 0
      },
      isAutoSent: false
    };

    // 配信処理のシミュレーション
    await this.simulateDelivery(notification);

    this.notifications.unshift(notification);
    return notification;
  }

  private generateNotificationMessage(disaster: DisasterInfo): string {
    let message = `【${disaster.title}】\n${disaster.description}\n\n`;
    
    if (disaster.area) {
      message += `対象地域: ${disaster.area}\n`;
    }
    
    if (disaster.details) {
      if (disaster.details.magnitude) {
        message += `マグニチュード: ${disaster.details.magnitude}\n`;
      }
      if (disaster.details.rainfallAmount) {
        message += `予想雨量: ${disaster.details.rainfallAmount}mm/h\n`;
      }
      if (disaster.details.windSpeed) {
        message += `最大風速: ${disaster.details.windSpeed}m/s\n`;
      }
      if (disaster.details.waveHeight) {
        message += `予想津波高: ${disaster.details.waveHeight}m\n`;
      }
    }
    
    if (disaster.instructions && disaster.instructions.length > 0) {
      message += `\n【行動指針】\n`;
      disaster.instructions.forEach((instruction, index) => {
        message += `${index + 1}. ${instruction}\n`;
      });
    }

    message += `\n発表: ${disaster.source}`;
    
    return message;
  }

  // 新しい災害情報の監視コールバック
  public onNewDisaster(callback: (disaster: DisasterInfo) => void): void {
    this.callbacks.push(callback);
  }

  // 自動通知の監視コールバック
  public onAutoNotification(callback: (notification: DisasterNotification) => void): void {
    this.autoNotificationCallbacks.push(callback);
  }

  // 災害情報の統計
  public getStatistics() {
    const total = this.disasters.length;
    const active = this.getActiveDisasters().length;
    const urgent = this.getUrgentDisasters().length;
    const autoNotified = this.disasters.filter(d => d.autoNotificationSent).length;
    const byType = this.disasters.reduce((acc, disaster) => {
      acc[disaster.type] = (acc[disaster.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      urgent,
      autoNotified,
      byType
    };
  }

  // 通知統計
  public getNotificationStatistics() {
    const totalNotifications = this.notifications.length;
    const autoSentCount = this.notifications.filter(n => n.isAutoSent).length;
    const manualSentCount = this.notifications.filter(n => !n.isAutoSent).length;
    const totalRecipients = this.notifications.reduce((sum, n) => sum + n.recipientCount, 0);
    const totalDelivered = this.notifications.reduce((sum, n) => sum + n.deliveryStatus.delivered, 0);
    const totalFailed = this.notifications.reduce((sum, n) => sum + n.deliveryStatus.failed, 0);

    return {
      totalNotifications,
      autoSentCount,
      manualSentCount,
      totalRecipients,
      totalDelivered,
      totalFailed,
      deliveryRate: totalRecipients > 0 ? Math.round((totalDelivered / totalRecipients) * 100) : 0
    };
  }

  // 災害情報のアイコン取得
  public getDisasterIcon(type: DisasterInfo['type']): string {
    const icons = {
      earthquake: '🌋',
      heavyRain: '🌧️',
      tsunami: '🌊',
      typhoon: '🌪️',
      landslide: '⛰️',
      flood: '🌊',
      storm: '💨'
    };

    return icons[type] || '⚠️';
  }

  // 災害情報の色取得
  public getDisasterColor(severity: DisasterInfo['severity']): string {
    const colors = {
      advisory: 'yellow',
      warning: 'orange',
      emergency: 'red'
    };

    return colors[severity];
  }
}

// シングルトンインスタンス
const disasterService = new DisasterService();

export default disasterService;