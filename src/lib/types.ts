export type UserRole = 'visitor' | 'client' | 'provider' | 'admin' | 'promoter';

export type ServiceStatus = 'active' | 'pending' | 'paused' | 'expired';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  createdAt: string;
}

export interface Location {
  province: string;
  city: string;
  zone?: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  avatar?: string;
  businessName?: string;
  description?: string;
  phone?: string | null;
  address?: string;
  city?: string | null;
  province?: string | null;
  location?: Location;
  user?: {
    name: string;
    email?: string;
  };
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export interface Service {
  id: string;
  providerId: string;
  title: string;
  subcategoryId?: string;
  description: string;
  price?: number | null;
  isActive: boolean;
  coverImage?: string | null;
  videoUrl?: string | null;
  createdAt: string;
  updatedAt?: string;

  provider?: {
    id?: string;
    phone?: string | null;
    city?: string | null;
    province?: string | null;
    publicUsername?: string | null;
    user: {
      name: string;
      email?: string;
    };
  };

  subcategory?: {
    id: string;
    name: string;
    category: {
      id: string;
      name: string;
    };
  };
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  maxServices: number;
  monthlyPrice: number;
}

export interface UserSubscription {
  id: string;
  providerId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  clientId: string;
  providerId: string;
  serviceId?: string;
  lastMessageAt: string;
}

export interface Promoter {
  id: string;
  userId?: string;
  name?: string;
  code: string;
  invitedCount?: number;
  providersCount?: number;
  conversions?: number;
  activityRate?: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  content: string;
  imageUrl?: string | null;
  status: 'published' | 'draft' | 'PUBLISHED' | 'DRAFT';
  isFeatured: boolean;
  publishedAt?: string | null;
}

// --------------------------------------------------
// PROVIDER PANEL
// --------------------------------------------------

export type PlanType = 'BASIC' | 'DOUBLE' | 'MONTHLY' | 'QUARTERLY' | 'SEMESTER' | 'YEARLY';
export type SubStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

export interface Subscription {
  planType: PlanType;
  status: SubStatus;
  expiresAt: string;
}

export interface ProviderMeResponse {
  profile: {
    id: string;
    phone: string | null;
    city: string | null;
    province: string | null;
    bio: string | null;
    publicUsername: string | null;
    contactEmail: string | null;
    legalName: string | null;
    documentNumber: string | null;
    cuit: string | null;
    fiscalCondition: string | null;
    verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
    user: {
      name: string;
      email: string;
    };
  };
  subscription: Subscription | null;
  servicesCount: number;
  transactions?: any[];
}