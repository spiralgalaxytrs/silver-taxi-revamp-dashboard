export interface CustomNotification {
  id: number;
  adminId: string;
  templateId?: string;
  title: string;
  message: string;
  image?: string;
  target?: 'vendor' | 'driver' | 'customer' | 'none';
  type?: string;
  status: boolean;
  route?: string;
  data: any;
  time: string;
  createdAt?: string;
  updatedAt?: string;
  particularIds?: string[];
}

export interface CreateCustomNotificationRequest {
  title: string;
  message: string;
  target: 'vendor' | 'driver' | 'customer' | 'none';
  type?: string;
  route?: string;
  particularIds?: string[];
  image?: File;
  targetAudience?: string;
  targetCustomerIds?: string[];
  scheduledAt?: string;
  time?: string;
}

export interface UpdateCustomNotificationRequest {
  templateId: string;
  title?: string;
  message?: string;
  target?: 'vendor' | 'driver' | 'customer' | 'none';
  type?: string;
  route?: string;
  particularIds?: string[];
  image?: File;
  targetAudience?: string;
  targetCustomerIds?: string[];
  scheduledAt?: string;
  time?: string;
}

export interface SendNotificationRequest {
  templateId: string;
}

export interface CustomNotificationResponse {
  success: boolean;
  message: string;
  data: CustomNotification;
}

export interface CustomNotificationsPaginatedResponse {
  success: boolean;
  message: string;
  data: CustomNotification[];
  total: number;
  offset: number;
}
