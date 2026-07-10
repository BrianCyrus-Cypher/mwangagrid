# Mwanga Grid - Complete App Flow Documentation

**Document Version:** 1.0  
**Last Updated:** July 2026  
**Status:** Production Ready

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [User Flow](#user-flow)
3. [Admin Flow](#admin-flow)
4. [Payment Flow](#payment-flow)
5. [Data Flow](#data-flow)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Desktop    │  │   Mobile     │  │   Tablet     │          │
│  │   Browser    │  │   Browser    │  │   Browser    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER (React 19)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Pages: Home, Products, Services, Cart, Checkout, etc.  │  │
│  │  Components: Navigation, Product Cards, Forms, Charts   │  │
│  │  State Management: React Context + tRPC Hooks          │  │
│  │  Styling: Tailwind CSS 4 + Dark Mode Support           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  tRPC Router (Type-Safe RPC)                             │  │
│  │  - Rate Limiting Middleware                             │  │
│  │  - Authentication Middleware                            │  │
│  │  - CORS & Security Headers                              │  │
│  │  - Request Validation (Zod)                             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND LAYER (Express + Node.js)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Auth       │  │   Orders     │  │   Payments   │          │
│  │   Router     │  │   Router     │  │   Router     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Products   │  │   Services   │  │   Contact    │          │
│  │   Router     │  │   Router     │  │   Router     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Admin      │  │   Quotes     │  │   Support    │          │
│  │   Router     │  │   Router     │  │   Router     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES LAYER                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   M-Pesa     │  │   Stripe     │  │   Pesapal    │          │
│  │   Payment    │  │   Payment    │  │   Payment    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   OAuth      │  │   Email      │  │   SMS        │          │
│  │   Provider   │  │   Service    │  │   Service    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER (PostgreSQL)                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Tables: Users, Products, Orders, Payments, Contacts    │  │
│  │  Indexes: User ID, Order Number, Payment Reference      │  │
│  │  Transactions: ACID Compliance for Financial Data       │  │
│  │  Backups: Automated Daily with 30-day Retention         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## User Flow

### 1. New User Registration & Onboarding

```
START
  ↓
[User visits website] → Landing Page
  ↓
[User clicks "Shop Now"] → Products Page
  ↓
[User clicks "Add to Cart"] → Authentication Check
  ├─ If NOT logged in:
  │   ↓
  │   [Redirect to OAuth Login] → Manus OAuth Provider
  │   ↓
  │   [User authorizes] → Create User Account
  │   ↓
  │   [Set Session Cookie] → Redirect to Products
  │   ↓
  │   [Add to Cart] → Cart Updated
  │
  └─ If logged in:
      ↓
      [Add to Cart] → Cart Updated
      ↓
      [View Cart] → Shopping Cart Page
```

### 2. Product Discovery & Selection

```
START
  ↓
[User on Products Page]
  ↓
[Browse Products]
  ├─ Filter by Category (Solar, CCTV, Internet)
  ├─ Search by Product Name
  ├─ Sort by Price (Low to High / High to Low)
  └─ Sort by Newest / Most Popular
  ↓
[Click Product Card] → Product Detail Modal Opens
  ↓
[View Product Details]
  ├─ Product Name & Description
  ├─ Price & Discount (if applicable)
  ├─ Stock Status
  ├─ Product Images Gallery
  ├─ Customer Reviews & Ratings
  ├─ Specifications & Warranty
  └─ Related Products
  ↓
[Select Quantity] → Adjust quantity slider
  ↓
[Click "Add to Cart"] → Item added to cart
  ↓
[Toast Notification] → "Item added successfully"
  ↓
[Continue Shopping or View Cart]
```

### 3. Shopping Cart Management

```
START
  ↓
[User clicks Cart Icon] → Shopping Cart Page
  ↓
[View Cart Items]
  ├─ Product Name
  ├─ Unit Price
  ├─ Quantity
  ├─ Subtotal per item
  └─ Remove button
  ↓
[Modify Cart]
  ├─ Increase Quantity → Recalculate Totals
  ├─ Decrease Quantity → Recalculate Totals
  ├─ Remove Item → Update Cart
  └─ Continue Shopping → Return to Products
  ↓
[Cart Summary]
  ├─ Subtotal = Sum of all items
  ├─ Tax (16%) = Subtotal × 0.16
  ├─ Shipping = 500 KES (or free if > 10,000 KES)
  └─ Total = Subtotal + Tax + Shipping
  ↓
[Click "Proceed to Checkout"] → Checkout Page
```

### 4. Checkout Flow (3 Steps)

#### Step 1: Delivery Details

```
[Checkout Page - Step 1]
  ↓
[Enter Delivery Information]
  ├─ Full Name (pre-filled from user profile)
  ├─ Email Address (pre-filled)
  ├─ Phone Number (required for M-Pesa)
  ├─ Delivery Address (text area)
  ├─ City/Region (dropdown)
  ├─ Postal Code (optional)
  └─ Special Instructions (optional)
  ↓
[Validate Form]
  ├─ All required fields filled?
  ├─ Phone number valid?
  ├─ Address minimum 10 characters?
  └─ If invalid → Show error messages
  ↓
[Click "Continue to Payment"] → Step 2
```

#### Step 2: Payment Method Selection

```
[Checkout Page - Step 2]
  ↓
[Select Payment Method]
  ├─ M-Pesa (Recommended)
  │   ├─ Enter Phone Number (254XXXXXXXXX format)
  │   └─ Click "Pay with M-Pesa"
  │       ↓
  │       [Initiate STK Push] → M-Pesa Prompt on Phone
  │       ↓
  │       [User enters M-Pesa PIN] → Payment Processing
  │       ↓
  │       [Payment Status Check] → Polling every 2 seconds
  │       ├─ If Success → Step 3
  │       ├─ If Pending → Keep polling (max 2 minutes)
  │       └─ If Failed → Show error, allow retry
  │
  └─ Card Payment
      ├─ Enter Card Details
      │   ├─ Card Number
      │   ├─ Expiry Date
      │   ├─ CVV
      │   └─ Cardholder Name
      ├─ 3D Secure Verification (if required)
      └─ Click "Pay with Card"
          ↓
          [Process Payment] → Payment Gateway
          ↓
          [Verify 3D Secure] → User verification
          ↓
          [Payment Confirmation] → Step 3
```

#### Step 3: Order Confirmation

```
[Checkout Page - Step 3]
  ↓
[Order Confirmation]
  ├─ Order Number (ORD-XXXXX)
  ├─ Order Date & Time
  ├─ Order Items Summary
  ├─ Delivery Address
  ├─ Payment Method Used
  ├─ Total Amount Paid
  ├─ Estimated Delivery Date
  └─ Order Status (Pending → Confirmed)
  ↓
[Email Confirmation Sent]
  ├─ To customer email
  ├─ Contains order details
  ├─ Contains tracking link
  └─ Contains support contact
  ↓
[Admin Notification]
  ├─ New order alert to admin
  ├─ Create admin follow-up task
  ├─ Set priority to HIGH
  └─ Notify admin via dashboard
  ↓
[User Options]
  ├─ View Order Details
  ├─ Continue Shopping
  ├─ Go to Account
  └─ Download Invoice (PDF)
  ↓
END
```

### 5. Quotation Request Flow

```
START
  ↓
[User clicks "Get Quote"] → Quotation Page
  ↓
[Fill Quotation Form]
  ├─ Select Products/Services
  ├─ Specify Quantities
  ├─ Add Special Requirements
  ├─ Choose Installation Option (if applicable)
  ├─ Enter Delivery Location
  └─ Add Additional Notes
  ↓
[Calculate Estimated Quote]
  ├─ Base Price × Quantity
  ├─ Installation Fees (if selected)
  ├─ Delivery Fees
  ├─ Tax (16%)
  └─ Total Estimated Amount
  ↓
[Review Quote]
  ├─ Items & quantities
  ├─ Pricing breakdown
  ├─ Estimated total
  └─ Validity period (30 days)
  ↓
[Submit Quote Request]
  ├─ Generate Quote Number (QT-XXXXX)
  ├─ Save to database
  ├─ Send to admin for review
  ├─ Create admin follow-up task
  └─ Set priority to MEDIUM
  ↓
[Confirmation Message]
  ├─ Quote number displayed
  ├─ Expected response time (24 hours)
  ├─ Email confirmation sent
  └─ Link to track quote status
  ↓
[Admin Reviews Quote]
  ├─ Verify calculations
  ├─ Check product availability
  ├─ Adjust pricing if needed
  ├─ Add installation notes
  └─ Approve/Reject
  ↓
[Customer Notified]
  ├─ Email with final quote
  ├─ Option to convert to order
  ├─ Option to request modifications
  └─ Valid for 30 days
  ↓
END
```

### 6. Contact & Support Flow

```
START
  ↓
[User clicks "Contact"] → Contact Page
  ↓
[View Company Information]
  ├─ Phone: +254 111 321 211
  ├─ Email: cheidaniells@gmail.com
  ├─ Address: P.O Box 8117, Nairobi 00100
  ├─ Physical: Roasters next to Naivasha Mountain Mall
  ├─ Business Hours: 8 AM - 6 PM (Mon-Fri)
  ├─ WhatsApp: +254 111 321 211
  └─ Social Media Links
  ↓
[Fill Contact Form]
  ├─ Name (required)
  ├─ Email (required)
  ├─ Phone (required)
  ├─ Inquiry Type (dropdown)
  │   ├─ Product Information
  │   ├─ Service Inquiry
  │   ├─ Installation Request
  │   ├─ Technical Support
  │   └─ Other
  ├─ Subject (required)
  └─ Message (required, min 10 chars)
  ↓
[Submit Inquiry]
  ├─ Validate all fields
  ├─ Save to contacts table
  ├─ Generate contact ID
  ├─ Create admin follow-up task
  ├─ Set priority based on type
  └─ Send confirmation email
  ↓
[Tailored Response Message]
  ├─ Product → "We'll contact you within 24 hours"
  ├─ Service → "Customized quote within 24 hours"
  ├─ Installation → "Technician will call within 4 hours"
  ├─ Support → "Support team will assist within 2 hours"
  └─ Other → "We'll respond as soon as possible"
  ↓
[Admin Notification]
  ├─ New inquiry alert
  ├─ Inquiry details displayed
  ├─ Priority flag set
  ├─ Auto-assign to team member
  └─ Add to follow-up queue
  ↓
[Admin Response]
  ├─ Review inquiry
  ├─ Prepare response
  ├─ Send via email
  ├─ Update status to "Responded"
  └─ Close or keep open
  ↓
END
```

### 7. User Account & Order History

```
START
  ↓
[User clicks "My Account"] → Account Page
  ↓
[View Profile Information]
  ├─ Name
  ├─ Email
  ├─ Phone
  ├─ Member Since
  └─ Edit Profile button
  ↓
[View Order History]
  ├─ All past orders listed
  ├─ For each order:
  │   ├─ Order Number
  │   ├─ Order Date
  │   ├─ Total Amount
  │   ├─ Status (Pending/Confirmed/Shipped/Delivered)
  │   ├─ View Details button
  │   ├─ Track Order button
  │   ├─ Download Invoice button
  │   └─ Reorder button
  ↓
[View Active Subscriptions]
  ├─ Service Package Name
  ├─ Subscription Type (Basic/Standard/Premium)
  ├─ Start Date
  ├─ Renewal Date
  ├─ Status (Active/Paused/Expiring)
  ├─ Manage Subscription button
  └─ Renew button
  ↓
[Support Tickets]
  ├─ All support tickets listed
  ├─ For each ticket:
  │   ├─ Ticket Number
  │   ├─ Subject
  │   ├─ Status (Open/In Progress/Resolved/Closed)
  │   ├─ Priority (Low/Medium/High)
  │   ├─ Created Date
  │   ├─ Last Updated
  │   └─ View Details button
  ↓
[Create New Support Ticket]
  ├─ Subject (required)
  ├─ Description (required)
  ├─ Priority (Low/Medium/High)
  ├─ Attachment (optional)
  └─ Submit button
  ↓
[Ticket Submitted]
  ├─ Ticket number generated
  ├─ Confirmation email sent
  ├─ Admin notification created
  ├─ Priority set
  └─ Expected response time displayed
  ↓
END
```

---

## Admin Flow

### 1. Admin Dashboard Overview

```
START
  ↓
[Admin Login] → OAuth Authentication
  ↓
[Admin Dashboard] → Main Dashboard Page
  ↓
[Dashboard Widgets]
  ├─ Total Revenue (This Month)
  ├─ Total Orders (This Month)
  ├─ New Customers (This Month)
  ├─ Pending Orders
  ├─ Pending Quotations
  ├─ New Inquiries
  ├─ Support Tickets (Open)
  └─ System Health Status
  ↓
[Navigation Menu]
  ├─ Dashboard (Home)
  ├─ Orders Management
  ├─ Products Management
  ├─ Quotations
  ├─ Inquiries/Contacts
  ├─ Support Tickets
  ├─ Customers
  ├─ Analytics
  ├─ Settings
  └─ Logout
```

### 2. Order Management Flow

```
START
  ↓
[Admin clicks "Orders"] → Orders List Page
  ↓
[View All Orders]
  ├─ Filter by Status
  │   ├─ Pending
  │   ├─ Confirmed
  │   ├─ Shipped
  │   ├─ Delivered
  │   └─ Cancelled
  ├─ Filter by Date Range
  ├─ Search by Order Number
  ├─ Search by Customer Name
  └─ Sort by Date/Amount
  ↓
[Orders Table]
  ├─ Order Number
  ├─ Customer Name
  ├─ Order Date
  ├─ Total Amount
  ├─ Payment Status
  ├─ Order Status
  ├─ Delivery Address
  └─ Actions (View, Edit, Print, Cancel)
  ↓
[Click "View Order Details"]
  ├─ Order Header
  │   ├─ Order Number
  │   ├─ Order Date & Time
  │   ├─ Customer Information
  │   └─ Delivery Address
  ├─ Order Items
  │   ├─ Product Name
  │   ├─ SKU
  │   ├─ Quantity
  │   ├─ Unit Price
  │   └─ Subtotal
  ├─ Order Summary
  │   ├─ Subtotal
  │   ├─ Tax (16%)
  │   ├─ Shipping
  │   └─ Total
  ├─ Payment Information
  │   ├─ Payment Method
  │   ├─ Payment Status
  │   ├─ Transaction ID
  │   ├─ Payment Date
  │   └─ Payment Reference
  └─ Order Status Timeline
      ├─ Pending (Created)
      ├─ Confirmed (Payment received)
      ├─ Shipped (Tracking number)
      ├─ Delivered (Delivery date)
      └─ Completed
  ↓
[Update Order Status]
  ├─ Click "Update Status" button
  ├─ Select new status from dropdown
  ├─ Add notes/comments
  ├─ Generate tracking number (if shipping)
  ├─ Send notification to customer
  └─ Save changes
  ↓
[Order Actions]
  ├─ Print Invoice (PDF)
  ├─ Print Packing Slip
  ├─ Print Shipping Label
  ├─ Send Order Confirmation Email
  ├─ Send Shipping Notification
  ├─ Cancel Order (if pending)
  └─ Refund Order (if applicable)
  ↓
[Admin Follow-Up]
  ├─ Check follow-up status
  ├─ Mark as completed
  ├─ Add notes
  └─ Close follow-up
  ↓
END
```

### 3. Quotation Management Flow

```
START
  ↓
[Admin clicks "Quotations"] → Quotations List
  ↓
[View All Quotations]
  ├─ Filter by Status
  │   ├─ Pending
  │   ├─ Approved
  │   ├─ Rejected
  │   └─ Converted to Order
  ├─ Filter by Date Range
  ├─ Search by Quote Number
  ├─ Search by Customer Name
  └─ Sort by Date/Amount
  ↓
[Quotations Table]
  ├─ Quote Number
  ├─ Customer Name
  ├─ Quote Date
  ├─ Estimated Amount
  ├─ Status
  ├─ Validity Period
  └─ Actions (View, Edit, Approve, Reject, Convert)
  ↓
[Click "View Quotation"]
  ├─ Quote Header
  │   ├─ Quote Number
  │   ├─ Customer Information
  │   ├─ Quote Date
  │   └─ Validity (30 days)
  ├─ Requested Items
  │   ├─ Product/Service Name
  │   ├─ Quantity
  │   ├─ Unit Price
  │   ├─ Subtotal
  │   └─ Special Requirements
  ├─ Pricing Summary
  │   ├─ Subtotal
  │   ├─ Installation Fees (if applicable)
  │   ├─ Delivery Fees
  │   ├─ Tax (16%)
  │   └─ Total Estimated Amount
  └─ Customer Notes
  ↓
[Admin Review & Approval]
  ├─ Verify product availability
  ├─ Check pricing accuracy
  ├─ Review special requirements
  ├─ Adjust pricing if needed
  ├─ Add installation notes
  ├─ Set validity period
  └─ Click "Approve Quote"
  ↓
[Send Quote to Customer]
  ├─ Generate PDF quote
  ├─ Send via email
  ├─ Include conversion link
  ├─ Set expiry reminder (7 days before)
  └─ Update status to "Approved"
  ↓
[Customer Actions]
  ├─ Accept Quote → Convert to Order
  ├─ Request Modifications
  ├─ Reject Quote
  └─ Quote Expires (30 days)
  ↓
[Admin Follow-Up]
  ├─ Track quote status
  ├─ Send reminder if not converted
  ├─ Update follow-up status
  └─ Close follow-up when converted or expired
  ↓
END
```

### 4. Contact/Inquiry Management Flow

```
START
  ↓
[Admin clicks "Inquiries"] → Inquiries List
  ↓
[View All Inquiries]
  ├─ Filter by Status
  │   ├─ New
  │   ├─ Responded
  │   └─ Closed
  ├─ Filter by Type
  │   ├─ Product
  │   ├─ Service
  │   ├─ Installation
  │   ├─ Support
  │   └─ Other
  ├─ Filter by Priority
  │   ├─ Low
  │   ├─ Medium
  │   └─ High
  ├─ Search by Name/Email
  └─ Sort by Date
  ↓
[Inquiries Table]
  ├─ Contact ID
  ├─ Name
  ├─ Email
  ├─ Phone
  ├─ Inquiry Type
  ├─ Subject
  ├─ Status
  ├─ Priority
  ├─ Created Date
  └─ Actions (View, Reply, Close)
  ↓
[Click "View Inquiry"]
  ├─ Contact Information
  │   ├─ Name
  │   ├─ Email
  │   ├─ Phone
  │   ├─ Inquiry Type
  │   └─ Submitted Date
  ├─ Inquiry Details
  │   ├─ Subject
  │   ├─ Full Message
  │   └─ Attachments (if any)
  └─ Response Section
      ├─ Admin Response (if replied)
      ├─ Response Date
      └─ Status
  ↓
[Admin Response]
  ├─ Click "Reply" button
  ├─ Compose response email
  ├─ Add relevant information
  ├─ Attach documents (if needed)
  ├─ Preview before sending
  └─ Click "Send Response"
  ↓
[Email Sent to Customer]
  ├─ Professional email template
  ├─ Include company details
  ├─ Include next steps
  ├─ Include contact information
  └─ Include follow-up link
  ↓
[Update Inquiry Status]
  ├─ Mark as "Responded"
  ├─ Add internal notes
  ├─ Set follow-up reminder (optional)
  └─ Save changes
  ↓
[Admin Follow-Up]
  ├─ Track follow-up status
  ├─ Check if customer replied
  ├─ Send reminder if needed
  ├─ Mark as completed
  └─ Close follow-up
  ↓
END
```

### 5. Analytics & Reporting Flow

```
START
  ↓
[Admin clicks "Analytics"] → Analytics Dashboard
  ↓
[Sales Analytics]
  ├─ Revenue Chart (Last 12 months)
  │   ├─ Line chart showing trend
  │   ├─ Filter by date range
  │   └─ Export data
  ├─ Orders Chart
  │   ├─ Bar chart by month
  │   ├─ Total orders count
  │   └─ Average order value
  ├─ Top Products
  │   ├─ Pie chart of best sellers
  │   ├─ Product name
  │   ├─ Units sold
  │   ├─ Revenue generated
  │   └─ Growth percentage
  └─ Category Performance
      ├─ Solar Equipment
      ├─ CCTV Cameras
      ├─ Internet Equipment
      └─ Revenue per category
  ↓
[Customer Analytics]
  ├─ Total Customers
  ├─ New Customers (This Month)
  ├─ Repeat Customers
  ├─ Customer Lifetime Value
  ├─ Customer Segmentation
  │   ├─ VIP (High Value)
  │   ├─ Premium (Medium-High Value)
  │   ├─ Standard (Medium Value)
  │   └─ New (Low Value)
  └─ Geographic Distribution
      ├─ Nairobi
      ├─ Mombasa
      ├─ Kisumu
      ├─ Nakuru
      └─ Other Regions
  ↓
[Visitor Analytics]
  ├─ Total Visitors (This Month)
  ├─ Unique Visitors
  ├─ Page Views
  ├─ Bounce Rate
  ├─ Average Session Duration
  ├─ Traffic Sources
  │   ├─ Direct
  │   ├─ Organic Search
  │   ├─ Social Media
  │   ├─ Referral
  │   └─ Paid Ads
  └─ Device Breakdown
      ├─ Desktop
      ├─ Mobile
      └─ Tablet
  ↓
[Conversion Analytics]
  ├─ Conversion Funnel
  │   ├─ Visitors → 100%
  │   ├─ Product Views → 45%
  │   ├─ Add to Cart → 15%
  │   ├─ Checkout → 8%
  │   └─ Purchase → 5%
  ├─ Conversion Rate
  ├─ Cart Abandonment Rate
  ├─ Average Order Value
  └─ Revenue per Visitor
  ↓
[Export Reports]
  ├─ PDF Report
  ├─ Excel Spreadsheet
  ├─ CSV Data
  └─ Email Report
  ↓
END
```

### 6. Admin Follow-Up System Flow

```
START
  ↓
[System generates Follow-Up Task]
  ├─ When new order received
  ├─ When new quotation submitted
  ├─ When new inquiry received
  ├─ When support ticket created
  ├─ When payment fails
  └─ When status update needed
  ↓
[Follow-Up Task Created]
  ├─ Task ID generated
  ├─ Type assigned (order/quote/inquiry/ticket/payment)
  ├─ Priority set (Low/Medium/High)
  ├─ Status set to "Pending"
  ├─ Due date calculated
  ├─ Assigned to team member
  └─ Notification sent to admin
  ↓
[Admin Dashboard - Follow-Up Queue]
  ├─ View all pending follow-ups
  ├─ Filter by type
  ├─ Filter by priority
  ├─ Filter by due date
  ├─ Sort by priority/date
  └─ Search by order/quote/contact number
  ↓
[Admin Actions on Follow-Up]
  ├─ Click follow-up task
  ├─ View related details
  ├─ Add notes/comments
  ├─ Update status to "In Progress"
  ├─ Perform required action
  │   ├─ Send email
  │   ├─ Call customer
  │   ├─ Update order status
  │   ├─ Approve quotation
  │   └─ Respond to inquiry
  ├─ Mark as "Completed"
  └─ Close follow-up
  ↓
[Follow-Up Completion]
  ├─ Task marked as completed
  ├─ Completion timestamp recorded
  ├─ Notes saved
  ├─ Related document updated
  └─ Remove from pending queue
  ↓
[Follow-Up Reminders]
  ├─ System checks due dates
  ├─ Send reminder notifications
  ├─ Escalate overdue tasks
  ├─ Notify team members
  └─ Update priority if needed
  ↓
END
```

---

## Payment Flow

### M-Pesa Payment Processing

```
START
  ↓
[User selects M-Pesa] → Checkout Step 2
  ↓
[Enter Phone Number]
  ├─ Validate format (254XXXXXXXXX)
  ├─ Confirm number with user
  └─ Click "Pay with M-Pesa"
  ↓
[Backend: Initiate STK Push]
  ├─ Get M-Pesa access token from Daraja API
  ├─ Generate timestamp
  ├─ Create password (Base64 encoded)
  ├─ Prepare STK push request
  ├─ Send request to Safaricom API
  └─ Receive CheckoutRequestID
  ↓
[Frontend: STK Prompt Appears]
  ├─ User sees M-Pesa prompt on phone
  ├─ User enters M-Pesa PIN
  ├─ M-Pesa processes payment
  └─ User receives confirmation
  ↓
[Backend: Poll Payment Status]
  ├─ Query M-Pesa for payment status
  ├─ Check every 2 seconds
  ├─ Max polling time: 2 minutes
  ├─ Possible responses:
  │   ├─ 0 → Success
  │   ├─ 1 → Insufficient funds
  │   ├─ 2 → Less than minimum transaction value
  │   ├─ 17 → User cancelled
  │   └─ Other → Error
  ↓
[If Success (Code 0)]
  ├─ Extract transaction details
  ├─ Create payment transaction record
  ├─ Update order payment status to "Completed"
  ├─ Update order status to "Confirmed"
  ├─ Generate order confirmation
  ├─ Send confirmation email
  ├─ Notify admin
  └─ Proceed to Step 3 (Confirmation)
  ↓
[If Failed]
  ├─ Display error message
  ├─ Show error code explanation
  ├─ Offer retry option
  ├─ Create payment transaction record (failed)
  ├─ Create admin follow-up (payment_issue)
  ├─ Set priority to HIGH
  └─ Allow user to try again
  ↓
[If Pending/Timeout]
  ├─ Display "Payment processing" message
  ├─ Ask user to wait
  ├─ Continue polling in background
  ├─ If still pending after 2 minutes:
  │   ├─ Stop polling
  │   ├─ Create manual follow-up task
  │   ├─ Notify admin
  │   └─ Ask user to contact support
  ↓
END
```

### Card Payment Processing

```
START
  ↓
[User selects Card Payment] → Checkout Step 2
  ↓
[Enter Card Details]
  ├─ Card Number (16 digits)
  ├─ Expiry Date (MM/YY)
  ├─ CVV (3-4 digits)
  ├─ Cardholder Name
  └─ Billing Address
  ↓
[Frontend: Validate Card Details]
  ├─ Luhn algorithm check
  ├─ Expiry date validation
  ├─ CVV format validation
  ├─ Required fields check
  └─ If invalid → Show error
  ↓
[Backend: Process Payment]
  ├─ Tokenize card details (PCI DSS compliant)
  ├─ Send to payment gateway (Stripe/Pesapal)
  ├─ Initiate payment transaction
  ├─ Create payment transaction record
  └─ Wait for gateway response
  ↓
[Payment Gateway Response]
  ├─ If 3D Secure required:
  │   ├─ Redirect to 3D Secure verification
  │   ├─ User completes verification
  │   └─ Return to payment processing
  │
  └─ If direct approval:
      ├─ Process payment
      ├─ Return transaction ID
      └─ Confirm payment
  ↓
[If Success]
  ├─ Update payment status to "Completed"
  ├─ Update order status to "Confirmed"
  ├─ Store transaction ID
  ├─ Generate receipt
  ├─ Send confirmation email
  ├─ Notify admin
  └─ Proceed to Step 3
  ↓
[If Failed]
  ├─ Display error message
  ├─ Show failure reason
  ├─ Offer retry option
  ├─ Create failed payment record
  ├─ Create admin follow-up
  └─ Allow user to try different card
  ↓
END
```

---

## Data Flow

### Order Data Flow

```
User Input (Checkout)
  ↓
[Validate & Sanitize]
  ├─ Check required fields
  ├─ Validate email format
  ├─ Validate phone number
  ├─ Sanitize text inputs
  └─ Check cart not empty
  ↓
[Create Order Record]
  ├─ Generate order number
  ├─ Calculate totals
  ├─ Set initial status
  ├─ Store delivery details
  └─ Save to database
  ↓
[Create Order Items]
  ├─ For each cart item:
  │   ├─ Link to product
  │   ├─ Store quantity
  │   ├─ Store price
  │   └─ Save to database
  ↓
[Create Payment Record]
  ├─ Link to order
  ├─ Store payment method
  ├─ Set payment status
  ├─ Generate transaction ID
  └─ Save to database
  ↓
[Create Admin Follow-Up]
  ├─ Link to order
  ├─ Set type to "new_order"
  ├─ Set priority
  ├─ Set status to "pending"
  └─ Save to database
  ↓
[Trigger Notifications]
  ├─ Send confirmation email to customer
  ├─ Send alert to admin dashboard
  ├─ Create admin notification
  └─ Update real-time dashboard
  ↓
[Return to Frontend]
  ├─ Order confirmation page
  ├─ Display order number
  ├─ Show order details
  └─ Provide next steps
```

### Product Data Flow

```
Product Creation (Admin)
  ↓
[Enter Product Details]
  ├─ Name
  ├─ Description
  ├─ Category
  ├─ Price
  ├─ Stock
  ├─ Images
  └─ Specifications
  ↓
[Validate Data]
  ├─ Check required fields
  ├─ Validate price format
  ├─ Check stock quantity
  ├─ Validate images
  └─ Check for duplicates
  ↓
[Store in Database]
  ├─ Create product record
  ├─ Store images
  ├─ Create search index
  └─ Update inventory
  ↓
[Frontend: Display Products]
  ├─ Fetch products from API
  ├─ Cache results
  ├─ Display in grid
  ├─ Show product cards
  └─ Enable filtering/search
  ↓
[User Interaction]
  ├─ Click product
  ├─ View details
  ├─ Add to cart
  └─ Update cart state
```

---

## API Endpoints

### Authentication Endpoints

```
POST /api/trpc/auth.login
  Request: { email, password }
  Response: { user, token, session }

POST /api/trpc/auth.logout
  Request: {}
  Response: { success: true }

GET /api/trpc/auth.me
  Request: {}
  Response: { user } or { null }

POST /api/trpc/auth.adminAccess
  Request: { adminKey? }
  Response: { isAdmin, adminDetails }
```

### Product Endpoints

```
GET /api/trpc/products.list
  Query: { category?, search?, sort?, limit?, offset? }
  Response: { products: [], total, hasMore }

GET /api/trpc/products.getById
  Query: { id }
  Response: { product }

GET /api/trpc/products.getByCategory
  Query: { category }
  Response: { products: [] }

GET /api/trpc/products.search
  Query: { query }
  Response: { products: [] }
```

### Order Endpoints

```
POST /api/trpc/orders.create
  Request: { items, deliveryLocation, paymentMethod, phoneNumber }
  Response: { orderId, orderNumber, totalAmount }

GET /api/trpc/orders.getById
  Query: { id }
  Response: { order }

GET /api/trpc/orders.listByUser
  Query: { userId }
  Response: { orders: [] }

PUT /api/trpc/orders.updateStatus
  Request: { orderId, status, notes }
  Response: { success: true }

POST /api/trpc/orders.initiatePayment
  Request: { orderId, phoneNumber }
  Response: { checkoutRequestId, customerMessage }
```

### Payment Endpoints

```
POST /api/trpc/payments.initiateMpesa
  Request: { orderId, phoneNumber, amount }
  Response: { checkoutRequestId }

GET /api/trpc/payments.checkStatus
  Query: { checkoutRequestId }
  Response: { status, amount, transactionId }

POST /api/trpc/payments.initiateCard
  Request: { orderId, cardToken, amount }
  Response: { transactionId, status }

POST /api/payments/mpesa/callback
  Request: { CallbackMetadata }
  Response: { success: true }
```

### Contact Endpoints

```
POST /api/trpc/contacts.submit
  Request: { name, email, phone, subject, message, inquiryType }
  Response: { contactId, message }

GET /api/trpc/contacts.list
  Query: { status?, type?, limit?, offset? }
  Response: { contacts: [] }

PUT /api/trpc/contacts.respond
  Request: { contactId, response }
  Response: { success: true }
```

### Admin Endpoints

```
GET /api/trpc/admin.dashboard
  Query: {}
  Response: { stats, charts, recentOrders }

GET /api/trpc/admin.orders
  Query: { status?, dateRange?, search? }
  Response: { orders: [] }

GET /api/trpc/admin.analytics
  Query: { metric, dateRange }
  Response: { data: [] }

GET /api/trpc/admin.followUps
  Query: { status?, priority?, type? }
  Response: { followUps: [] }

PUT /api/trpc/admin.followUp.update
  Request: { followUpId, status, notes }
  Response: { success: true }
```

---

## Database Schema

### Key Tables

```sql
-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320) UNIQUE,
  phone VARCHAR(20),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category ENUM('routers', 'cctv_cameras', 'network_switches', 'cables'),
  price DECIMAL(10, 2) NOT NULL,
  discountPrice DECIMAL(10, 2),
  stock INT DEFAULT 0,
  image VARCHAR(500),
  sku VARCHAR(100) UNIQUE,
  warranty VARCHAR(100),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Orders Table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  userId INT NOT NULL,
  orderNumber VARCHAR(50) UNIQUE NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  totalAmount DECIMAL(10, 2) NOT NULL,
  deliveryLocation TEXT,
  paymentMethod ENUM('mpesa', 'card'),
  paymentStatus ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  paymentReference VARCHAR(100),
  estimatedDelivery TIMESTAMP,
  trackingNumber VARCHAR(100),
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Payment Transactions Table
CREATE TABLE paymentTransactions (
  id SERIAL PRIMARY KEY,
  orderId INT NOT NULL,
  userId INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  paymentMethod ENUM('mpesa', 'card'),
  paymentGateway VARCHAR(50),
  transactionId VARCHAR(100) UNIQUE,
  status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  gatewayResponse JSONB,
  errorMessage TEXT,
  retryCount INT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Contacts Table
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  inquiryType ENUM('product', 'service', 'installation', 'support', 'other'),
  status ENUM('new', 'responded', 'closed') DEFAULT 'new',
  adminResponse TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Admin Follow-Ups Table
CREATE TABLE adminFollowUps (
  id SERIAL PRIMARY KEY,
  orderId INT,
  quotationId INT,
  contactId INT,
  ticketId INT,
  type ENUM('new_order', 'new_quotation', 'new_inquiry', 'support_ticket', 'status_update', 'payment_issue'),
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  notes TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

---

**Document End**

This comprehensive app flow documentation provides complete visibility into how the Mwanga Grid platform operates from all perspectives: user, admin, and system level.
