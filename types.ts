
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  tags: string[];
  description: string;
  isAffiliate?: boolean;
  status?: 'active' | 'inactive';
  departmentId?: string;
  categoryId?: string;
  sellerId?: string; 
  seo?: SEOMetadata;
}

export interface UserFavorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string;
  slug: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Lead {
  id: string;
  email: string;
  productId: string;
  productName: string;
  capturedAt: string;
  converted?: boolean;
}

export interface Department {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  seo?: SEOMetadata;
}

export interface Category {
  id: string;
  name: string;
  departmentId: string;
  status: 'active' | 'inactive';
  slug?: string;
  icon?: string;
  description?: string;
  seo?: SEOMetadata;
}

export enum UserRole {
  ADMIN_MASTER = 'admin_master',
  ADMIN_OPERATIONAL = 'admin_operational',
  FINANCE = 'finance',
  MARKETING = 'marketing',
  AFFILIATE = 'affiliate',
  CUSTOMER = 'customer',
  SELLER = 'seller' 
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  password?: string;
  googleId?: string;
  isDefaultPassword?: boolean;
  loginType: 'google' | 'email';
}

export interface SystemSettings {
  nomeLoja: string;
  logoUrl: string;
  emailContato: string;
  telefone: string;
  whatsapp: string;
  dominio: string;
  moeda: 'BRL' | 'USD' | 'EUR';
  timezone: string;
  companyName: string;
  storeName: string;
  adminEmail: string;
  systemStatus: 'online' | 'maintenance' | 'offline';
  environment: 'production' | 'staging' | 'development';
  privacyPolicy: string;
  termsOfUse: string;
  pwaInstalledCount: number;
  pwaVersion: string;
  pushNotificationsActive: boolean;
  language: 'pt-BR' | 'en-US' | 'es-ES';
  currency: 'BRL' | 'USD' | 'EUR';
}

export interface RolePermission {
  routeId: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface RoleDefinition {
  id: UserRole;
  label: string;
  permissions: RolePermission[];
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELED = 'canceled'
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: CartItem[];
  total: number;
  discount: number;
  finalTotal: number;
  status: OrderStatus;
  createdAt: string;
  couponCode?: string;
  affiliateId?: string;
}

export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed'
}

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  status: 'active' | 'inactive';
}

export interface Affiliate {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  commissionRate: number;
  totalSales: number;
  balance: number;
  refCode: string;
}

export interface Commission {
  id: string;
  affiliateId: string;
  orderId: string;
  amount: number;
  status: 'pending' | 'paid' | 'canceled';
  createdAt: string;
}

export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkType: 'product' | 'category' | 'external';
  targetId: string;
  status: 'active' | 'inactive';
  startDate: string;
  endDate: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface RemarketingLog {
  id: string;
  leadEmail: string;
  productName: string;
  sentAt: string;
  status: 'sent' | 'pending' | 'failed';
}

export interface AIChatSession {
  id: string;
  customerEmail?: string;
  messages: Message[];
  status: 'active' | 'escalated' | 'closed';
  createdAt: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface PerformanceMetric {
  id: string;
  page: string;
  lcp: number;
  fid: number;
  cls: number;
  timestamp: string;
}

export interface SystemLog {
  id: string;
  type: 'error' | 'navigation' | 'security' | 'infra' | 'lgpd' | 'pwa' | 'integration' | 'ai';
  message: string;
  path?: string;
  timestamp: string;
  metadata?: any;
}

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'pix' | 'credit_card' | 'boleto';
  status: 'active' | 'inactive';
  config: any;
}

export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  method: string;
  gatewayId: string;
  status: 'pending' | 'paid' | 'failed';
  createdAt: string;
}

export interface Carrier {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  type: 'express' | 'standard';
}

export interface Delivery {
  id: string;
  orderId: string;
  carrierId: string;
  trackingCode: string;
  status: 'preparing' | 'shipped' | 'delivered';
  estimatedDate: string;
}

export interface UserSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  createdAt: string;
  expiresAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}

export interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'access_denied' | 'session_expired';
  message: string;
  ip?: string;
  timestamp: string;
}

export interface DeployRecord {
  id: string;
  version: string;
  status: 'success' | 'failed' | 'in_progress';
  deployedBy: string;
  timestamp: string;
  changelog: string;
}

export interface BackupRecord {
  id: string;
  name: string;
  size: string;
  status: 'completed' | 'processing';
  timestamp: string;
}

export interface InfraMetric {
  uptime: string;
  latency: number;
  cpu: number;
  ram: number;
  lastHealthCheck: string;
}

export interface Seller {
  id: string;
  userId: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  commissionRate: number; 
  totalSales: number;
  rating: number;
  logo?: string;
  createdAt: string;
}

export interface LGPDConsent {
  id: string;
  userEmail: string;
  accepted: boolean;
  ip: string;
  userAgent: string;
  timestamp: string;
}

export interface LGPDLog {
  id: string;
  type: 'consent' | 'revocation' | 'data_export' | 'data_deletion';
  userEmail: string;
  message: string;
  timestamp: string;
}

export interface PWANotification {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  deliveredCount: number;
}

export interface ExternalAPIConfig {
  id: string;
  provider: string;
  type: 'crm' | 'whatsapp' | 'erp' | 'other';
  apiKey: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

export interface IntegrationSyncLog {
  id: string;
  provider: string;
  type: 'lead' | 'order' | 'product' | 'whatsapp';
  status: 'success' | 'failed';
  message: string;
  timestamp: string;
}

export interface WhatsAppMessage {
  id: string;
  userEmail: string;
  content: string;
  trigger: 'lead' | 'purchase' | 'remarketing' | 'manual';
  status: 'sent' | 'delivered' | 'failed';
  timestamp: string;
}

export interface AIRecommendation {
  id: string;
  userEmail: string;
  suggestedProductIds: string[];
  reason: string;
  score: number;
}

export interface AIPrediction {
  id: string;
  period: string;
  projectedSales: number;
  confidence: number;
  insights: string[];
}

export interface AIAutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: 'active' | 'inactive';
  lastExecuted?: string;
  executionsCount: number;
}

export interface AILogEntry {
  id: string;
  module: 'recommendation' | 'prediction' | 'automation';
  decision: string;
  outcome: string;
  timestamp: string;
}

export interface HelpTopic {
  id: string;
  title: string;
  description: string;
  content: any;
  promptUsed: string;
  updatedAt: string;
}
