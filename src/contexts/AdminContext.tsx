import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  deviceToken: string;
  country: string;
  consentDate: string;
  stayEndDate: string;
  notificationStatus: 'active' | 'expired';
  lastAccess: string;
  registrationDate: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  url?: string;
  type: 'immediate' | 'scheduled' | 'location';
  targetUsers: 'all' | 'countries';
  targetCountries?: string[];
  scheduledDate?: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  createdAt: string;
  sentAt?: string;
  priority?: 'low' | 'medium' | 'high';
  disasterId?: string;
  scheduledNotificationId?: string;
}

interface LocationNotification {
  id: string;
  name: string;
  title: string;
  message: string;
  url?: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  cooldownMinutes: number;
  createdAt: string;
}

interface Area {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  userCount: number;
  createdAt: string;
}

interface AdminContextType {
  isAuthenticated: boolean;
  users: User[];
  notifications: Notification[];
  locationNotifications: LocationNotification[];
  areas: Area[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  updateNotification: (id: string, notification: Partial<Notification>) => void;
  deleteNotification: (id: string) => void;
  addLocationNotification: (notification: Omit<LocationNotification, 'id' | 'createdAt'>) => void;
  updateLocationNotification: (id: string, notification: Partial<LocationNotification>) => void;
  deleteLocationNotification: (id: string) => void;
  addArea: (area: Omit<Area, 'id' | 'createdAt'>) => void;
  updateArea: (id: string, area: Partial<Area>) => void;
  deleteArea: (id: string) => void;
  getAvailableCountries: () => string[];
  getUserCountsByCountry: () => Record<string, number>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    deviceToken: 'fcm_token_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    country: 'アメリカ',
    consentDate: '2025-01-05',
    stayEndDate: '2025-01-12',
    notificationStatus: 'active',
    lastAccess: '2025-01-08 14:30:00',
    registrationDate: '2025-01-05 09:15:00'
  },
  {
    id: '2',
    deviceToken: 'fcm_token_def456ghi789jkl012mno345pqr678stu901vwx234yz567abc',
    country: 'イギリス',
    consentDate: '2024-12-28',
    stayEndDate: '2025-01-05',
    notificationStatus: 'expired',
    lastAccess: '2025-01-07 09:15:00',
    registrationDate: '2024-12-28 16:30:00'
  },
  {
    id: '3',
    deviceToken: 'fcm_token_ghi789jkl012mno345pqr678stu901vwx234yz567abc123def',
    country: 'フランス',
    consentDate: '2025-01-06',
    stayEndDate: '2025-01-13',
    notificationStatus: 'active',
    lastAccess: '2025-01-08 16:45:00',
    registrationDate: '2025-01-06 11:45:00'
  },
  {
    id: '4',
    deviceToken: 'fcm_token_jkl012mno345pqr678stu901vwx234yz567abc123def456ghi',
    country: '韓国',
    consentDate: '2025-01-07',
    stayEndDate: '2025-01-14',
    notificationStatus: 'active',
    lastAccess: '2025-01-08 11:20:00',
    registrationDate: '2025-01-07 14:20:00'
  },
  {
    id: '5',
    deviceToken: 'fcm_token_mno345pqr678stu901vwx234yz567abc123def456ghi789jkl',
    country: '台湾',
    consentDate: '2025-01-08',
    stayEndDate: '2025-01-11',
    notificationStatus: 'active',
    lastAccess: '2025-01-08 18:10:00',
    registrationDate: '2025-01-08 08:30:00'
  },
  {
    id: '6',
    deviceToken: 'fcm_token_pqr678stu901vwx234yz567abc123def456ghi789jkl012mno',
    country: 'ドイツ',
    consentDate: '2025-01-04',
    stayEndDate: '2025-01-18',
    notificationStatus: 'active',
    lastAccess: '2025-01-08 12:00:00',
    registrationDate: '2025-01-04 19:45:00'
  }
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: '豊洲市場見学ツアー',
    message: '豊洲市場の見学ツアーが開催されます。ぜひご参加ください！',
    url: 'https://example.com/market-tour',
    type: 'scheduled',
    targetUsers: 'all',
    scheduledDate: '2025-01-09 09:00:00',
    repeat: 'none',
    status: 'scheduled',
    createdAt: '2025-01-08 10:00:00'
  },
  {
    id: '2',
    title: 'イベント情報',
    message: '豊洲公園でイベントが開催中です',
    type: 'immediate',
    targetUsers: 'all',
    repeat: 'none',
    status: 'sent',
    createdAt: '2025-01-08 15:00:00',
    sentAt: '2025-01-08 15:05:00'
  }
];

const mockLocationNotifications: LocationNotification[] = [
  {
    id: '1',
    name: '豊洲市場エリア',
    title: '豊洲市場へようこそ',
    message: '世界最大級の魚市場へようこそ！新鮮な海産物をお楽しみください。',
    url: 'https://example.com/market-info',
    latitude: 35.6433,
    longitude: 139.7714,
    radius: 200,
    isActive: true,
    cooldownMinutes: 60,
    createdAt: '2025-01-05 10:00:00'
  },
  {
    id: '2',
    name: 'ららぽーと豊洲',
    title: 'ショッピングを楽しもう',
    message: 'ららぽーと豊洲で買い物やグルメを楽しんでください。',
    latitude: 35.6458,
    longitude: 139.7853,
    radius: 150,
    isActive: true,
    cooldownMinutes: 120,
    createdAt: '2025-01-05 11:00:00'
  }
];

const mockAreas: Area[] = [
  {
    id: '1',
    name: '豊洲市場エリア',
    description: '豊洲市場とその周辺エリア',
    latitude: 35.6433,
    longitude: 139.7714,
    radius: 300,
    isActive: true,
    userCount: 15,
    createdAt: '2025-01-05 10:00:00'
  },
  {
    id: '2',
    name: '豊洲公園エリア',
    description: '豊洲公園とその周辺の観光エリア',
    latitude: 35.6542,
    longitude: 139.7965,
    radius: 250,
    isActive: true,
    userCount: 8,
    createdAt: '2025-01-05 11:00:00'
  }
];

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users] = useState<User[]>(mockUsers);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [locationNotifications, setLocationNotifications] = useState<LocationNotification[]>(mockLocationNotifications);
  const [areas, setAreas] = useState<Area[]>(mockAreas);

  const login = (username: string, password: string): boolean => {
    // Mock authentication
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const updateNotification = (id: string, updatedData: Partial<Notification>) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, ...updatedData } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addLocationNotification = (notification: Omit<LocationNotification, 'id' | 'createdAt'>) => {
    const newNotification: LocationNotification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setLocationNotifications(prev => [...prev, newNotification]);
  };

  const updateLocationNotification = (id: string, updatedData: Partial<LocationNotification>) => {
    setLocationNotifications(prev => prev.map(n => n.id === id ? { ...n, ...updatedData } : n));
  };

  const deleteLocationNotification = (id: string) => {
    setLocationNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addArea = (area: Omit<Area, 'id' | 'createdAt'>) => {
    const newArea: Area = {
      ...area,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setAreas(prev => [...prev, newArea]);
  };

  const updateArea = (id: string, updatedData: Partial<Area>) => {
    setAreas(prev => prev.map(a => a.id === id ? { ...a, ...updatedData } : a));
  };

  const deleteArea = (id: string) => {
    setAreas(prev => prev.filter(a => a.id !== id));
  };

  const getAvailableCountries = (): string[] => {
    const countries = [...new Set(users.map(user => user.country))];
    return countries.sort();
  };

  const getUserCountsByCountry = (): Record<string, number> => {
    const activeUsers = users.filter(user => user.notificationStatus === 'active');
    const counts: Record<string, number> = {};
    
    activeUsers.forEach(user => {
      counts[user.country] = (counts[user.country] || 0) + 1;
    });
    
    return counts;
  };

  return (
    <AdminContext.Provider value={{
      isAuthenticated,
      users,
      notifications,
      locationNotifications,
      areas,
      login,
      logout,
      addNotification,
      updateNotification,
      deleteNotification,
      addLocationNotification,
      updateLocationNotification,
      deleteLocationNotification,
      addArea,
      updateArea,
      deleteArea,
      getAvailableCountries,
      getUserCountsByCountry
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}