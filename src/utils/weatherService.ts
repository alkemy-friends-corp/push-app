export interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
  icon: string;
}

export class WeatherService {
  private static API_KEY = 'YOUR_OPENWEATHER_API_KEY_HERE'; // 実際のAPIキーに置き換えてください
  private static BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

  static async getWeatherData(city: string = 'Toyosu,Tokyo,JP'): Promise<WeatherData> {
    try {
      // 本番環境では実際のAPIを使用
      if (this.API_KEY === 'YOUR_OPENWEATHER_API_KEY_HERE') {
        // デモ用のモックデータ
        return this.getMockWeatherData();
      }

      const response = await fetch(
        `${this.BASE_URL}?q=${city}&appid=${this.API_KEY}&units=metric&lang=ja`
      );

      if (!response.ok) {
        throw new Error('天気データの取得に失敗しました');
      }

      const data = await response.json();
      
      return {
        temperature: Math.round(data.main.temp),
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed),
        description: this.generateDescription(data.weather[0].main, data.main.temp),
        icon: data.weather[0].icon
      };
    } catch (error) {
      console.error('天気データの取得エラー:', error);
      // エラー時はモックデータを返す
      return this.getMockWeatherData();
    }
  }

  private static getMockWeatherData(): WeatherData {
    const conditions = [
      { condition: '晴れ', icon: '01d' },
      { condition: '曇り', icon: '03d' },
      { condition: '小雨', icon: '10d' },
      { condition: '雨', icon: '09d' },
      { condition: '雪', icon: '13d' }
    ];

    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const temperature = Math.floor(Math.random() * 25) + 5; // 5-30度

    return {
      temperature,
      condition: randomCondition.condition,
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 10) + 1, // 1-10m/s
      description: this.generateDescription(randomCondition.condition, temperature),
      icon: randomCondition.icon
    };
  }

  private static generateDescription(condition: string, temperature: number): string {
    const descriptions = {
      '晴れ': [
        '今日も良い天気です！',
        '絶好の観光日和ですね。',
        '青空が広がっています。',
        '散歩にぴったりの天気です。'
      ],
      '曇り': [
        '雲が多めですが過ごしやすい天気です。',
        '少し曇っていますが、お出かけには問題ありません。',
        '日差しは弱めですが、観光には適した天気です。'
      ],
      '雨': [
        '雨が降っています。傘をお忘れなく。',
        '雨の日も豊洲の魅力を楽しめます。',
        '屋内施設での観光がおすすめです。'
      ],
      '雪': [
        '雪が降っています。足元にご注意ください。',
        '雪景色の豊洲も美しいですよ。',
        '防寒対策をしっかりとしてお出かけください。'
      ]
    };

    const conditionDescriptions = descriptions[condition as keyof typeof descriptions] || descriptions['曇り'];
    let description = conditionDescriptions[Math.floor(Math.random() * conditionDescriptions.length)];

    // 気温に応じたアドバイスを追加
    if (temperature < 10) {
      description += ' 寒いので暖かい服装でお出かけください。';
    } else if (temperature > 25) {
      description += ' 暑いので水分補給をお忘れなく。';
    } else {
      description += ' 過ごしやすい気温です。';
    }

    return description;
  }

  static generateWeatherMessage(template: string, weather: WeatherData): string {
    const now = new Date();
    const dateStr = now.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });

    return template
      .replace(/\{\{date\}\}/g, dateStr)
      .replace(/\{\{temperature\}\}/g, weather.temperature.toString())
      .replace(/\{\{condition\}\}/g, weather.condition)
      .replace(/\{\{humidity\}\}/g, weather.humidity.toString())
      .replace(/\{\{windSpeed\}\}/g, weather.windSpeed.toString())
      .replace(/\{\{description\}\}/g, weather.description)
      .replace(/\{\{icon\}\}/g, weather.icon);
  }

  static getWeatherIcon(iconCode: string): string {
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌦️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '🌨️', '13n': '🌨️',
      '50d': '🌫️', '50n': '🌫️'
    };

    return iconMap[iconCode] || '🌤️';
  }
}

export default WeatherService;