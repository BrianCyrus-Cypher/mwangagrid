# Mwanga Grid E-Commerce Platform - Technical Requirements Document (TRD)

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Status:** Final

---

## 1. System Architecture Overview

### 1.1 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  React 19 + Tailwind CSS 4 + TypeScript              │  │
│  │  - Landing Page                                       │  │
│  │  - Product Catalog with Modal                        │  │
│  │  - Shopping Cart (Context-based)                     │  │
│  │  - Checkout Flow                                     │  │
│  │  - Admin Dashboard                                   │  │
│  │  - Theme Toggle (Dark/Light)                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Express.js 4 + tRPC 11                              │  │
│  │  - Request routing (/api/trpc/*)                     │  │
│  │  - Authentication middleware                         │  │
│  │  - Error handling                                    │  │
│  │  - CORS configuration                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  tRPC Routers                                        │  │
│  │  - products.list, products.byId                      │  │
│  │  - services.list, services.packages                  │  │
│  │  - orders.create, orders.list                        │  │
│  │  - quotations.create, quotations.list                │  │
│  │  - admin.analytics, admin.customers                  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Access Layer                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Drizzle ORM + MySQL2                                │  │
│  │  - Query builders                                    │  │
│  │  - Type-safe queries                                │  │
│  │  - Connection pooling                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MySQL 8.0 / TiDB                                    │  │
│  │  - Users table                                       │  │
│  │  - Products table                                    │  │
│  │  - Orders & OrderItems tables                        │  │
│  │  - Quotations table                                  │  │
│  │  - Services & ServicePackages tables                 │  │
│  │  - Subscriptions table                               │  │
│  │  - SupportTickets table                              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend

| Component        | Technology                   | Version         | Rationale                                    |
| ---------------- | ---------------------------- | --------------- | -------------------------------------------- |
| Framework        | React                        | 19.2.1          | Modern, component-based, large ecosystem     |
| Styling          | Tailwind CSS                 | 4.1.14          | Utility-first, responsive, dark mode support |
| UI Components    | shadcn/ui                    | Latest          | Pre-built accessible components              |
| State Management | React Context + localStorage | -               | Cart state, theme preference                 |
| HTTP Client      | tRPC + React Query           | 11.6.0 / 5.90.2 | Type-safe API calls, automatic caching       |
| Routing          | Wouter                       | 3.3.5           | Lightweight client-side routing              |
| Icons            | Lucide React                 | 0.453.0         | Modern, customizable icons                   |
| Charts           | Recharts                     | 2.15.2          | Interactive data visualization               |
| Forms            | React Hook Form + Zod        | 7.64.0 / 4.1.12 | Validation, type safety                      |
| Build Tool       | Vite                         | 7.1.7           | Fast development, optimized builds           |

### 2.2 Backend

| Component       | Technology  | Version  | Rationale                                  |
| --------------- | ----------- | -------- | ------------------------------------------ |
| Runtime         | Node.js     | 22.13.0  | JavaScript runtime, large ecosystem        |
| Framework       | Express.js  | 4.21.2   | Lightweight, flexible, widely used         |
| RPC Framework   | tRPC        | 11.6.0   | Type-safe API, automatic client generation |
| ORM             | Drizzle ORM | 0.44.5   | Type-safe, lightweight, great DX           |
| Database Driver | MySQL2      | 3.15.0   | Native MySQL support, connection pooling   |
| Authentication  | Manus OAuth | Built-in | Secure, managed authentication             |
| Validation      | Zod         | 4.1.12   | Runtime type validation                    |
| Serialization   | SuperJSON   | 1.13.3   | Handle Date, Map, Set in API responses     |

### 2.3 Database

| Component  | Technology      | Version | Rationale                                 |
| ---------- | --------------- | ------- | ----------------------------------------- |
| Database   | MySQL / TiDB    | 8.0+    | ACID compliance, scalability, reliability |
| Migrations | Drizzle Kit     | 0.31.4  | Version control for schema changes        |
| Backup     | Automated daily | -       | Data protection, disaster recovery        |

### 2.4 Deployment & Hosting

| Component  | Technology    | Details                            |
| ---------- | ------------- | ---------------------------------- |
| Hosting    | Manus Cloud   | Autoscale (serverless) or Reserved |
| Domain     | Custom domain | tunnelshop-wgf4a9hq.manus.space    |
| SSL/TLS    | Automatic     | HTTPS everywhere                   |
| CDN        | Built-in      | Static asset delivery              |
| Monitoring | Built-in      | Uptime, error tracking             |

---

## 3. Database Schema

### 3.1 Users Table

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  phone VARCHAR(20),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Products Table

```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10, 2),
  image TEXT,
  stock INT DEFAULT 0,
  rating DECIMAL(3, 2),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3.3 Orders Table

```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  totalAmount DECIMAL(12, 2),
  deliveryLocation TEXT,
  paymentMethod ENUM('mpesa', 'card'),
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### 3.4 OrderItems Table

```sql
CREATE TABLE orderItems (
  id INT PRIMARY KEY AUTO_INCREMENT,
  orderId INT NOT NULL,
  productId INT,
  quantity INT,
  price DECIMAL(10, 2),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (productId) REFERENCES products(id)
);
```

### 3.5 Services Table

```sql
CREATE TABLE services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3.6 ServicePackages Table

```sql
CREATE TABLE servicePackages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  serviceId INT NOT NULL,
  tier ENUM('basic', 'standard', 'premium'),
  price DECIMAL(12, 2),
  features TEXT,
  installationTime VARCHAR(50),
  warranty VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (serviceId) REFERENCES services(id)
);
```

### 3.7 Quotations Table

```sql
CREATE TABLE quotations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  items JSON,
  specialRequests TEXT,
  deliveryPreference VARCHAR(100),
  status ENUM('pending', 'approved', 'rejected', 'converted') DEFAULT 'pending',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

### 3.8 Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  servicePackageId INT,
  startDate DATE,
  endDate DATE,
  status ENUM('active', 'paused', 'cancelled') DEFAULT 'active',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (servicePackageId) REFERENCES servicePackages(id)
);
```

### 3.9 SupportTickets Table

```sql
CREATE TABLE supportTickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  subject VARCHAR(255),
  description TEXT,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

---

## 4. API Specifications

### 4.1 tRPC Procedures

#### Products Router

```typescript
products.list() → Product[]
products.byId(id: number) → Product | null
products.byCategory(category: string) → Product[]
```

#### Services Router

```typescript
services.list() → Service[]
services.byId(id: number) → Service | null
services.packages(serviceId: number) → ServicePackage[]
```

#### Orders Router

```typescript
orders.list() → Order[] (protected)
orders.byId(id: number) → Order | null (protected)
orders.create(data: OrderInput) → Order (protected)
orders.items(orderId: number) → OrderItem[] (protected)
```

#### Quotations Router

```typescript
quotations.list() → Quotation[] (protected)
quotations.create(data: QuotationInput) → Quotation (protected)
quotations.byId(id: number) → Quotation | null (protected)
```

#### Admin Router

```typescript
admin.analytics() → AnalyticsData (admin only)
admin.customers() → Customer[] (admin only)
admin.orders() → Order[] (admin only)
admin.inventory() → InventoryData (admin only)
```

---

## 5. Authentication & Authorization

### 5.1 OAuth 2.0 Flow

1. User clicks "Login" button
2. Redirected to Manus OAuth portal
3. User authenticates with email/Google
4. Redirected back to app with session cookie
5. Session cookie stored in browser
6. Subsequent requests include cookie automatically

### 5.2 Role-Based Access Control (RBAC)

| Role      | Permissions                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------ |
| **User**  | Browse products, create orders, view own orders, submit quotations, create support tickets       |
| **Admin** | All user permissions + view analytics, manage inventory, view all orders, manage support tickets |

### 5.3 Protected Routes

- `/account` - User account (requires login)
- `/admin` - Admin dashboard (public in demo, admin-only in production)
- `/checkout` - Checkout flow (requires login)

---

## 6. Performance Optimization

### 6.1 Frontend Optimization

- Code splitting by route (lazy loading)
- Image optimization (WebP, responsive sizes)
- CSS minification and purging
- JavaScript minification and tree-shaking
- Caching strategy for static assets
- Service Worker for offline support (future)

### 6.2 Backend Optimization

- Database query optimization (indexes on frequently queried columns)
- Connection pooling (MySQL2)
- Response caching (Redis - future)
- Pagination for large datasets
- Compression (gzip)

### 6.3 Database Optimization

- Indexes on `userId`, `productId`, `category`
- Composite indexes on frequently filtered columns
- Query result caching
- Archiving old orders (after 2 years)

---

## 7. Security Measures

### 7.1 Data Protection

- HTTPS/TLS 1.3 for all traffic
- Encrypted passwords (bcrypt)
- Encrypted sensitive data at rest
- PCI DSS compliance for payment data
- GDPR compliance for user data

### 7.2 Application Security

- SQL injection prevention (parameterized queries via Drizzle)
- XSS protection (React escaping, Content Security Policy)
- CSRF protection (token validation)
- Rate limiting on API endpoints
- Input validation and sanitization

### 7.3 Authentication Security

- Secure session cookies (HttpOnly, Secure, SameSite)
- OAuth 2.0 for authentication
- Multi-factor authentication (future)
- Session timeout (30 minutes)
- Logout functionality

### 7.4 Infrastructure Security

- DDoS protection (built-in)
- Web Application Firewall (WAF)
- Regular security patches
- Vulnerability scanning
- Penetration testing (quarterly)

---

## 8. Monitoring & Logging

### 8.1 Application Monitoring

- Error tracking (Sentry - future)
- Performance monitoring (APM - future)
- User analytics (Umami)
- Health checks (uptime monitoring)

### 8.2 Logging

- Server logs (dev server logs)
- Browser console logs
- Network request logs
- Database query logs (slow query log)
- Access logs (HTTP requests)

### 8.3 Alerts

- High error rate (> 1%)
- Slow API response (> 1s)
- Database connection failures
- Low disk space
- High CPU usage

---

## 9. Scalability Considerations

### 9.1 Horizontal Scaling

- Stateless backend services (can run multiple instances)
- Database replication (master-slave)
- Load balancing across instances
- Session storage in database (not in-memory)

### 9.2 Vertical Scaling

- Increase server resources (CPU, RAM)
- Upgrade database tier
- Increase connection pool size

### 9.3 Caching Strategy

- Browser caching (static assets)
- Server-side caching (Redis - future)
- Database query caching
- API response caching

---

## 10. Disaster Recovery

### 10.1 Backup Strategy

- Daily automated backups
- Weekly full backups
- Monthly archive backups
- Backup retention: 90 days
- Backup testing: monthly

### 10.2 Recovery Procedures

- RTO (Recovery Time Objective): 1 hour
- RPO (Recovery Point Objective): 1 day
- Documented recovery procedures
- Regular disaster recovery drills

### 10.3 Business Continuity

- Redundant infrastructure
- Failover mechanisms
- Alternative payment gateway (backup)
- Manual order processing capability

---

## 11. Development Workflow

### 11.1 Version Control

- Git repository (GitHub)
- Main branch: production-ready code
- Dev branch: development code
- Feature branches: individual features
- Pull request reviews required

### 11.2 Testing Strategy

- Unit tests (Vitest) for business logic
- Integration tests for API endpoints
- E2E tests for user workflows
- Manual testing before release
- Automated testing in CI/CD

### 11.3 Deployment Process

1. Code review and approval
2. Automated tests pass
3. Build and bundle
4. Deploy to staging environment
5. Smoke testing
6. Deploy to production
7. Monitor for errors

---

## 12. Technology Roadmap

### Phase 1 (Current)

- Core e-commerce functionality
- Basic admin dashboard
- Payment integration (M-Pesa, Card)

### Phase 2 (Q3 2026)

- Mobile app (React Native)
- Advanced analytics
- Email notifications
- Inventory automation

### Phase 3 (Q4 2026)

- AI product recommendations
- Multi-language support
- Marketplace (third-party sellers)
- Video product demonstrations

### Phase 4 (2027)

- Subscription billing automation
- Advanced forecasting
- Live chat support
- Augmented reality preview

---

**Document End**
