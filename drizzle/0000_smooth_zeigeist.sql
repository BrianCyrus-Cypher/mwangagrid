CREATE TYPE "public"."contactStatus" AS ENUM('new', 'read', 'replied', 'closed');--> statement-breakpoint
CREATE TYPE "public"."followUpPriority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."followUpStatus" AS ENUM('pending', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."followUpType" AS ENUM('new_order', 'new_quotation', 'new_inquiry', 'support_ticket', 'status_update', 'payment_issue');--> statement-breakpoint
CREATE TYPE "public"."inquiryType" AS ENUM('product', 'service', 'installation', 'support', 'other');--> statement-breakpoint
CREATE TYPE "public"."orderStatus" AS ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."paymentMethod" AS ENUM('mpesa', 'card');--> statement-breakpoint
CREATE TYPE "public"."paymentStatus" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."quotationStatus" AS ENUM('pending', 'approved', 'rejected', 'converted');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."subscriptionStatus" AS ENUM('active', 'paused', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."ticketPriority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."ticketStatus" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TABLE "adminFollowUps" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer,
	"quotationId" integer,
	"contactId" integer,
	"ticketId" integer,
	"adminId" integer NOT NULL,
	"type" "followUpType" NOT NULL,
	"status" "followUpStatus" DEFAULT 'pending' NOT NULL,
	"priority" "followUpPriority" DEFAULT 'medium' NOT NULL,
	"note" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(20),
	"inquiryType" "inquiryType",
	"subject" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"status" "contactStatus" DEFAULT 'new' NOT NULL,
	"adminResponse" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orderItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"productId" integer,
	"servicePackageId" integer,
	"quantity" integer DEFAULT 1 NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"orderNumber" varchar(50) NOT NULL,
	"status" "orderStatus" DEFAULT 'pending' NOT NULL,
	"totalAmount" numeric(10, 2) NOT NULL,
	"deliveryLocation" text,
	"paymentMethod" "paymentMethod",
	"paymentStatus" "paymentStatus" DEFAULT 'pending' NOT NULL,
	"paymentReference" varchar(100),
	"paymentDetails" text,
	"estimatedDelivery" timestamp,
	"trackingNumber" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_orderNumber_unique" UNIQUE("orderNumber")
);
--> statement-breakpoint
CREATE TABLE "paymentTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer,
	"userId" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"method" "paymentMethod" NOT NULL,
	"status" "paymentStatus" DEFAULT 'pending' NOT NULL,
	"reference" varchar(100),
	"mpesaReceiptNumber" varchar(100),
	"mpesaPhoneNumber" varchar(20),
	"mpesaTransactionDate" timestamp,
	"stripePaymentIntentId" varchar(255),
	"metadata" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(100) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"discountPrice" numeric(10, 2),
	"stock" integer DEFAULT 0 NOT NULL,
	"image" varchar(500),
	"sku" varchar(100),
	"warranty" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "quotations" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"quotationNumber" varchar(50) NOT NULL,
	"description" text,
	"items" text,
	"totalAmount" numeric(10, 2) NOT NULL,
	"status" "quotationStatus" DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "quotations_quotationNumber_unique" UNIQUE("quotationNumber")
);
--> statement-breakpoint
CREATE TABLE "rateLimits" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar(255) NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"windowStart" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "servicePackages" (
	"id" serial PRIMARY KEY NOT NULL,
	"serviceId" integer NOT NULL,
	"tier" varchar(50) NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"features" text,
	"duration" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"serviceType" varchar(100) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"tokenHash" varchar(255) NOT NULL,
	"device" varchar(255),
	"browser" varchar(255),
	"ipAddress" varchar(45),
	"lastActivity" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_tokenHash_unique" UNIQUE("tokenHash")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"servicePackageId" integer NOT NULL,
	"status" "subscriptionStatus" DEFAULT 'active' NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp,
	"renewalDate" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "supportTickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"ticketNumber" varchar(50) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"description" text,
	"status" "ticketStatus" DEFAULT 'open' NOT NULL,
	"priority" "ticketPriority" DEFAULT 'medium' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "supportTickets_ticketNumber_unique" UNIQUE("ticketNumber")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"phone" varchar(20),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	"passwordHash" varchar(255),
	"emailVerified" boolean DEFAULT false NOT NULL,
	"verificationToken" varchar(255),
	"verificationExpires" timestamp,
	"resetToken" varchar(255),
	"resetTokenExpires" timestamp,
	"twoFactorSecret" varchar(255),
	"twoFactorEnabled" boolean DEFAULT false NOT NULL,
	"twoFactorBackupCodes" text,
	"bio" text,
	"location" varchar(255),
	"dateOfBirth" varchar(100),
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
