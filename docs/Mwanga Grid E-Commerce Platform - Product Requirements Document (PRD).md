# Mwanga Grid E-Commerce Platform - Product Requirements Document (PRD)

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Status:** Final  
**Author:** Brian Ngatia

---

## Executive Summary

Mwanga Grid is a modern, full-featured e-commerce platform specializing in solar equipment, CCTV systems, and internet networking solutions for the Kenyan market. The platform enables customers to browse products, request quotations, manage subscriptions, and make purchases through an intuitive web interface. The admin dashboard provides comprehensive analytics, customer segmentation, and business intelligence tools.

**Company Details:**

- **Name:** Mwanga Grid
- **Location:** Roasters next to Naivasha Mountain Mall, Nairobi
- **P.O Box:** 8117, 00100 NRB
- **Email:** cheidaniells@gmail.com
- **Phone:** +254 111 321 211

---

## 1. Product Overview

### 1.1 Vision

To provide Kenya's businesses and households with accessible, reliable, and affordable renewable energy and security solutions through a seamless digital marketplace.

### 1.2 Mission

Empower customers to discover, compare, and purchase premium solar, CCTV, and internet equipment with confidence through transparent pricing, expert support, and comprehensive product information.

### 1.3 Core Value Propositions

- **Comprehensive Catalog:** 19+ products across 3 categories (Solar, CCTV, Internet)
- **Real-Time Pricing:** Transparent, competitive pricing in KES
- **Expert Support:** 24/7 customer support via WhatsApp and contact forms
- **Flexible Purchasing:** Direct purchase, quotation requests, or subscription packages
- **Business Intelligence:** Advanced analytics for customer insights and sales trends

---

## 2. Market Analysis

### 2.1 Target Audience

1. **Residential Customers** - Homeowners seeking solar installations and security systems
2. **Small Businesses** - Retailers, offices needing CCTV and internet solutions
3. **Large Enterprises** - Organizations requiring scalable energy and security infrastructure
4. **Government Agencies** - Public institutions upgrading infrastructure

### 2.2 Competitive Advantages

- Local expertise with Kenyan market understanding
- Integrated product ecosystem (solar + security + internet)
- Flexible payment options (M-Pesa, Card)
- Personalized quotation system
- Real-time inventory management

---

## 3. Feature Requirements

### 3.1 Public-Facing Features

#### 3.1.1 Landing Page

- Hero section with compelling value proposition
- Featured products carousel
- Service packages overview
- Customer testimonials (5+ reviews)
- Trust indicators (5000+ customers, 10+ years, 24/7 support)
- Call-to-action buttons (Shop Now, Explore Services)

#### 3.1.2 Product Catalog

- Browse 19 products across 3 categories
- Advanced search functionality
- Category filtering (Solar Equipment, CCTV Equipment, Internet Equipment)
- Product cards with:
  - Product image (emoji placeholder or real image)
  - Name and description
  - Price in KES
  - Star rating (4.5-5.0)
  - Stock availability
  - Quick "Add to Cart" button
  - "View Details" modal

#### 3.1.3 Product Detail Modal

- Full product description
- Image gallery (4 images)
- Detailed specifications
- Customer reviews (5-10 mock reviews with ratings)
- Price and stock information
- Quantity selector
- Add to cart functionality
- Related products section

#### 3.1.4 Services & Packages Page

- 3 service tiers: Basic, Standard, Premium
- Feature comparison table
- Pricing for each tier
- "Request Quote" button
- Installation timeline
- Warranty information

#### 3.1.5 Shopping Cart

- Dynamic cart with real-time calculations
- Add/remove items
- Quantity adjustments
- Subtotal, shipping, tax (16%), and total
- Proceed to checkout button
- Continue shopping option
- Cart persistence (localStorage)

#### 3.1.6 Checkout Flow

- **Step 1:** Delivery Details
  - Full name, email, phone
  - Delivery address
  - City/region selection
- **Step 2:** Payment Method
  - M-Pesa option
  - Card payment option
  - Payment terms and conditions
- **Step 3:** Order Confirmation
  - Order number
  - Estimated delivery date
  - Receipt summary
  - Thank you message

#### 3.1.7 Quotation Request System

- Custom quote builder
- Select products/services
- Specify quantities
- Add special requests
- Delivery preferences
- Contact information
- Submit for review
- Quote status tracking

#### 3.1.8 Customer Account

- Order history with status tracking
- Active service subscriptions
- Support ticket submission form
- Ticket history and status
- Profile management
- Saved addresses

#### 3.1.9 Contact & Support Page

- Company contact information
- WhatsApp chat widget
- Contact form (name, email, message)
- FAQ section
- Business hours
- Location map
- Social media links

### 3.2 Admin Dashboard Features

#### 3.2.1 Analytics & Reporting

- **Sales Dashboard:**
  - Total revenue (KES)
  - Total orders
  - Average order value
  - Conversion rate
  - Weekly sales trend chart
  - Monthly revenue forecast

- **Customer Analytics:**
  - Total customers
  - New customers (this month)
  - Customer lifetime value (CLV)
  - Repeat purchase rate
  - Customer segmentation (VIP, Premium, Standard, New)
  - Geographic distribution (Nairobi, Mombasa, Kisumu, Nakuru, Other)

- **Product Analytics:**
  - Top 5 products by revenue
  - Top 5 products by units sold
  - Inventory levels
  - Low stock alerts
  - Product category performance

#### 3.2.2 Order Management

- Recent orders table (10 latest)
- Order details view
- Order status tracking
- Order filtering and search
- Export orders as CSV

#### 3.2.3 Customer Management

- Customer list with contact info
- Customer segmentation view
- Purchase history per customer
- Lifetime value ranking
- Customer communication history

#### 3.2.4 Inventory Management

- Product stock levels
- Low stock alerts
- Stock adjustment form
- Inventory history
- Reorder recommendations

#### 3.2.5 Quotation Management

- Pending quotations list
- Quote details and customer info
- Quote status (pending, approved, rejected)
- Quote to order conversion
- Quote history and analytics

#### 3.2.6 Support Tickets

- Ticket queue
- Priority levels (low, medium, high, urgent)
- Ticket assignment
- Response history
- Ticket resolution tracking

---

## 4. Non-Functional Requirements

### 4.1 Performance

- Page load time: < 2 seconds
- API response time: < 500ms
- Database query optimization for 10,000+ products
- Image optimization and lazy loading
- CDN for static assets

### 4.2 Scalability

- Support 10,000+ concurrent users
- Database sharding for large datasets
- Horizontal scaling for backend services
- Load balancing across multiple servers

### 4.3 Security

- HTTPS/TLS encryption for all traffic
- OAuth 2.0 authentication
- Role-based access control (RBAC)
- SQL injection prevention (parameterized queries)
- XSS protection
- CSRF tokens
- PCI DSS compliance for payment data
- Regular security audits

### 4.4 Reliability

- 99.9% uptime SLA
- Automated backups (daily)
- Disaster recovery plan
- Health monitoring and alerts
- Graceful error handling

### 4.5 Usability

- Mobile-first responsive design
- Accessibility (WCAG 2.1 AA compliance)
- Intuitive navigation
- Clear call-to-action buttons
- Fast checkout process (< 3 steps)
- Dark mode support

---

## 5. Success Metrics

### 5.1 Business Metrics

- Monthly active users (MAU): Target 5,000+
- Conversion rate: Target 3-5%
- Average order value: KES 15,000+
- Customer retention rate: 40%+
- Net Promoter Score (NPS): 50+

### 5.2 Technical Metrics

- Page load time: < 2 seconds
- API uptime: 99.9%
- Error rate: < 0.1%
- Database query time: < 100ms

### 5.3 User Engagement Metrics

- Average session duration: > 5 minutes
- Pages per session: > 3
- Cart abandonment rate: < 70%
- Return visitor rate: 30%+

---

## 6. Assumptions & Constraints

### 6.1 Assumptions

- Users have internet connectivity
- Users are comfortable with online shopping
- Payment gateways (M-Pesa, Card) are available
- Product inventory is managed manually initially
- Email delivery is reliable

### 6.2 Constraints

- Budget: Limited to open-source and cost-effective solutions
- Timeline: MVP launch within 3 months
- Team: Small team (1-2 developers)
- Hosting: Cloud-based (Manus platform)
- Database: MySQL/TiDB

---

## 7. Out of Scope (Phase 2+)

- Mobile app (iOS/Android)
- Advanced AI recommendations
- Multi-language support
- Marketplace (third-party sellers)
- Subscription billing automation
- Advanced inventory forecasting
- Video product demonstrations
- Live chat support
- Augmented reality product preview

---

## 8. Glossary

| Term        | Definition                                              |
| ----------- | ------------------------------------------------------- |
| **SKU**     | Stock Keeping Unit - unique product identifier          |
| **CLV**     | Customer Lifetime Value - total revenue from a customer |
| **NPS**     | Net Promoter Score - customer loyalty metric            |
| **RBAC**    | Role-Based Access Control - permission system           |
| **PCI DSS** | Payment Card Industry Data Security Standard            |
| **SLA**     | Service Level Agreement - uptime guarantee              |

---

## 9. Approval & Sign-Off

| Role          | Name                     | Signature          | Date       |
| ------------- | ------------------------ | ------------------ | ---------- |
| Product Owner | Brian Ngatia             | ********\_******** | **\_\_\_** |
| Client        | Mr. Daniel (Mwanga Grid) | ********\_******** | **\_\_\_** |

---

**Document End**
