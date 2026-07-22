# Mwanga Grid - Deployment & Security Strategy

**Document Version:** 1.0  
**Last Updated:** June 2026  
**Status:** Final

---

## 1. Deployment Strategy

### 1.1 Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  Development Environment                │
│  - Local development with hot reload                    │
│  - SQLite database for testing                          │
│  - Mock payment gateways                                │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  Staging Environment                    │
│  - Manus Cloud staging instance                         │
│  - MySQL database (replica of production)               │
│  - Test payment gateway accounts                        │
│  - SSL certificate (self-signed or staging)             │
│  - Full feature testing and UAT                         │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                 Production Environment                  │
│  - Manus Cloud production instance                      │
│  - MySQL database with automated backups                │
│  - Live payment gateway integration                     │
│  - SSL certificate (Let's Encrypt)                      │
│  - CDN for static assets                                │
│  - Monitoring and alerting                              │
│  - Disaster recovery setup                              │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Deployment Environments

| Environment     | Purpose           | Database        | Payment | SSL           | Monitoring |
| --------------- | ----------------- | --------------- | ------- | ------------- | ---------- |
| **Development** | Local development | SQLite          | Mock    | No            | Local logs |
| **Staging**     | Testing & UAT     | MySQL (replica) | Test    | Self-signed   | Basic      |
| **Production**  | Live platform     | MySQL           | Live    | Let's Encrypt | Full       |

### 1.3 Deployment Pipeline

```yaml
# GitHub Actions Workflow
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: pnpm install
      - name: Run tests
        run: pnpm test
      - name: Run linter
        run: pnpm lint
      - name: Check types
        run: pnpm check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build application
        run: pnpm build
      - name: Upload artifacts
        uses: actions/upload-artifact@v3

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          # Deploy to Manus staging environment
          manus-deploy --environment staging
      - name: Run smoke tests
        run: |
          # Run smoke tests on staging
          pnpm test:e2e:staging

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Create backup
        run: |
          # Backup production database
          mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > backup.sql
      - name: Deploy to production
        run: |
          # Deploy to Manus production environment
          manus-deploy --environment production
      - name: Run smoke tests
        run: |
          # Run smoke tests on production
          pnpm test:e2e:production
      - name: Monitor for errors
        run: |
          # Monitor for 24 hours
          monitor-deployment --duration 24h
```

### 1.4 Deployment Checklist

**Pre-Deployment (24 hours before)**

- [ ] All tests passing
- [ ] Code review completed and approved
- [ ] Performance benchmarks met
- [ ] Security audit passed
- [ ] Database migrations tested on staging
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] Team notified

**Deployment Day**

- [ ] Monitoring setup active
- [ ] Alerting configured
- [ ] On-call team ready
- [ ] Deployment window scheduled
- [ ] Stakeholders notified
- [ ] Deployment executed
- [ ] Smoke tests passed
- [ ] Monitoring verified

**Post-Deployment (24 hours after)**

- [ ] Error rate normal
- [ ] Performance metrics normal
- [ ] User feedback positive
- [ ] Analytics data flowing
- [ ] Payment processing working
- [ ] Backups running
- [ ] All systems operational

---

## 2. Security Strategy

### 2.1 Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                  Application Layer                      │
│  - Input validation and sanitization                    │
│  - Output encoding                                      │
│  - CSRF protection                                      │
│  - XSS prevention                                       │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  Authentication Layer                   │
│  - OAuth 2.0 authentication                             │
│  - Session management                                   │
│  - Role-based access control                            │
│  - Multi-factor authentication (future)                 │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Transport Layer                       │
│  - HTTPS/TLS 1.3 encryption                             │
│  - Certificate pinning (future)                         │
│  - Secure headers                                       │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                           │
│  - Encrypted at rest                                    │
│  - Database access control                              │
│  - Prepared statements                                  │
│  - Data masking for sensitive fields                    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                Infrastructure Layer                     │
│  - DDoS protection                                      │
│  - Web Application Firewall (WAF)                       │
│  - Network segmentation                                 │
│  - Intrusion detection                                  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Security Headers

```typescript
// Express middleware for security headers
app.use((req, res, next) => {
  // Content Security Policy
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.manus.im"
  );

  // X-Frame-Options (prevent clickjacking)
  res.setHeader("X-Frame-Options", "DENY");

  // X-Content-Type-Options (prevent MIME sniffing)
  res.setHeader("X-Content-Type-Options", "nosniff");

  // X-XSS-Protection (legacy XSS protection)
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer-Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions-Policy
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=()"
  );

  // HSTS (HTTP Strict Transport Security)
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  next();
});
```

### 2.3 Authentication Security

**Session Security:**

```typescript
// Secure session cookie configuration
const sessionCookie = {
  name: "__session",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  secure: true, // HTTPS only
  httpOnly: true, // No JavaScript access
  sameSite: "none", // Cross-site requests
  path: "/",
  domain: ".manus.space",
};
```

**Password Security:**

- Passwords never stored locally (OAuth provider handles)
- If local passwords needed: bcrypt with salt rounds = 12
- Password reset tokens expire after 1 hour
- Rate limiting on login attempts (5 attempts per 15 minutes)

**Multi-Factor Authentication (Future):**

- SMS-based OTP
- Email-based OTP
- TOTP (Google Authenticator)
- Backup codes

### 2.4 Data Protection

**Encryption at Rest:**

```typescript
// Encrypt sensitive data before storing
import crypto from "crypto";

function encryptData(data: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decryptData(encrypted: string, key: string): string {
  const parts = encrypted.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(parts[1], "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
```

**PCI DSS Compliance:**

- Never store full credit card numbers
- Use tokenization for saved cards
- Encrypt card data in transit (TLS 1.3)
- Implement 3D Secure for card payments
- Regular security audits
- Vulnerability scanning
- Penetration testing

### 2.5 Input Validation & Sanitization

```typescript
// Server-side validation example
import { z } from "zod";

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number().positive(),
        quantity: z.number().positive().max(100),
      })
    )
    .min(1),
  deliveryLocation: z.string().min(5).max(500),
  paymentMethod: z.enum(["mpesa", "card"]),
});

// Validate input
const result = createOrderSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json({ error: result.error });
}

// Use validated data
const order = await createOrder(result.data);
```

**Output Encoding:**

```typescript
// React automatically escapes JSX content
function ProductCard({ product }) {
  return (
    <div>
      {/* Automatically escaped */}
      <h3>{product.name}</h3>
      <p>{product.description}</p>
    </div>
  );
}
```

### 2.6 CSRF Protection

```typescript
// CSRF token generation and validation
import csrf from "csurf";

const csrfProtection = csrf({ cookie: false });

// Generate token for forms
app.get("/form", csrfProtection, (req, res) => {
  res.send(`<form action="/process" method="POST">
    <input type="hidden" name="_csrf" value="${req.csrfToken()}">
    <input type="submit">
  </form>`);
});

// Validate token on submission
app.post("/process", csrfProtection, (req, res) => {
  res.send("Data processed");
});
```

### 2.7 Rate Limiting

```typescript
// Rate limiting middleware
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all routes
app.use(limiter);

// Stricter limit for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
});

app.post("/login", loginLimiter, (req, res) => {
  // Login logic
});
```

### 2.8 SQL Injection Prevention

```typescript
// Using Drizzle ORM (parameterized queries)
import { eq } from "drizzle-orm";

// ✅ Safe - parameterized query
const user = await db
  .select()
  .from(users)
  .where(eq(users.email, userEmail))
  .limit(1);

// ❌ Unsafe - string concatenation (NEVER DO THIS)
// const user = await db.query(`SELECT * FROM users WHERE email = '${userEmail}'`);
```

---

## 3. Monitoring & Logging

### 3.1 Monitoring Stack

```
┌─────────────────────────────────────────────────────────┐
│                  Application Monitoring                 │
│  - Error tracking (Sentry)                              │
│  - Performance monitoring (APM)                          │
│  - Uptime monitoring (Pingdom)                           │
│  - User analytics (Umami)                               │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  Infrastructure Monitoring              │
│  - Server health (CPU, memory, disk)                    │
│  - Database performance (slow query log)                │
│  - Network performance (latency, bandwidth)             │
│  - SSL certificate expiry                               │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                  Security Monitoring                    │
│  - Failed login attempts                                │
│  - Suspicious API calls                                 │
│  - DDoS attacks                                         │
│  - Vulnerability scans                                  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Logging Strategy

**Log Levels:**

- **DEBUG:** Detailed information for debugging
- **INFO:** General informational messages
- **WARN:** Warning messages (non-critical issues)
- **ERROR:** Error messages (critical issues)
- **FATAL:** Fatal errors (system shutdown)

**Log Retention:**

- Application logs: 30 days
- Access logs: 90 days
- Error logs: 1 year
- Audit logs: 2 years
- Payment logs: 7 years (PCI DSS requirement)

### 3.3 Alerting Rules

| Alert                  | Condition              | Severity | Action       |
| ---------------------- | ---------------------- | -------- | ------------ |
| High Error Rate        | > 1% errors            | Critical | Page on-call |
| Slow API Response      | > 1 second             | High     | Investigate  |
| Database Down          | Connection failed      | Critical | Page on-call |
| Low Disk Space         | < 10% free             | High     | Investigate  |
| SSL Certificate Expiry | < 7 days               | Medium   | Renew cert   |
| Payment Failure        | > 5% failures          | High     | Investigate  |
| Suspicious Activity    | Multiple failed logins | Medium   | Review logs  |

---

## 4. Backup & Disaster Recovery

### 4.1 Backup Strategy

**Daily Backups:**

```bash
# Automated daily backup at 2 AM UTC
0 2 * * * /usr/local/bin/backup-database.sh

# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/backups/mwanga_grid_$DATE.sql"

mysqldump \
  --user=$DB_USER \
  --password=$DB_PASS \
  --single-transaction \
  --quick \
  --lock-tables=false \
  $DB_NAME > $BACKUP_FILE

# Compress backup
gzip $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE.gz s3://mwanga-backups/

# Keep only last 30 days
find /backups -name "mwanga_grid_*.sql.gz" -mtime +30 -delete
```

**Backup Retention:**

- Daily backups: 30 days
- Weekly backups: 12 weeks
- Monthly backups: 12 months
- Yearly backups: 7 years

**Backup Testing:**

- Restore test daily
- Full recovery test monthly
- Disaster recovery drill quarterly

### 4.2 Disaster Recovery Plan

**Recovery Time Objective (RTO):** 1 hour  
**Recovery Point Objective (RPO):** 1 day

**Disaster Recovery Procedures:**

1. **Database Corruption:**
   - Stop application
   - Restore from latest backup
   - Verify data integrity
   - Restart application

2. **Server Failure:**
   - Provision new server
   - Restore database from backup
   - Deploy application
   - Verify all systems

3. **Data Loss:**
   - Restore from backup
   - Verify data integrity
   - Notify affected users
   - Document incident

4. **Security Breach:**
   - Isolate affected systems
   - Investigate breach
   - Reset passwords
   - Notify users
   - Implement fixes

### 4.3 Business Continuity

**Failover Procedures:**

- Automatic failover to backup server (if available)
- Manual failover procedures documented
- Regular failover testing
- Redundant systems for critical components

**Alternative Operations:**

- Manual order processing capability
- Offline payment recording
- Customer communication templates
- Support team escalation procedures

---

## 5. Compliance & Auditing

### 5.1 Compliance Requirements

| Requirement      | Standard    | Status | Notes                          |
| ---------------- | ----------- | ------ | ------------------------------ |
| Data Protection  | GDPR, CCPA  | ✅     | Privacy policy, data retention |
| Payment Security | PCI DSS     | ✅     | Tokenization, encryption       |
| Accessibility    | WCAG 2.1 AA | ✅     | Keyboard nav, screen readers   |
| Security         | ISO 27001   | 🔄     | In progress                    |
| Uptime           | 99.9% SLA   | ✅     | Monitoring, alerting           |

### 5.2 Audit Logging

```typescript
// Audit log middleware
function auditLog(action: string, userId: number, details: any) {
  const log = {
    timestamp: new Date(),
    action,
    userId,
    details,
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
  };

  // Store in database
  db.insert(auditLogs).values(log);

  // Log to file
  logger.info(`[AUDIT] ${action} by user ${userId}`, details);
}

// Usage
auditLog("ORDER_CREATED", userId, { orderId, amount });
auditLog("ADMIN_CHANGE", adminId, {
  changedField: "price",
  oldValue,
  newValue,
});
```

### 5.3 Security Audits

**Quarterly Security Audits:**

- Vulnerability scanning
- Penetration testing
- Code review
- Dependency updates
- Security patch application

**Annual Security Audit:**

- Third-party security assessment
- Compliance verification
- Risk assessment
- Recommendations implementation

---

## 6. Incident Response

### 6.1 Incident Classification

| Severity          | Definition                                        | Response Time | Resolution Time |
| ----------------- | ------------------------------------------------- | ------------- | --------------- |
| **P1 (Critical)** | System down, data loss, security breach           | 15 minutes    | 1 hour          |
| **P2 (High)**     | Major feature broken, payment failure             | 1 hour        | 4 hours         |
| **P3 (Medium)**   | Feature partially broken, performance degradation | 4 hours       | 24 hours        |
| **P4 (Low)**      | Minor UI issue, typo, cosmetic bug                | 24 hours      | 1 week          |

### 6.2 Incident Response Procedure

```
1. DETECT
   - Monitoring alert
   - User report
   - Automated detection
   ↓
2. ASSESS
   - Determine severity
   - Identify affected systems
   - Estimate impact
   ↓
3. RESPOND
   - Page on-call team
   - Investigate root cause
   - Implement fix
   ↓
4. RECOVER
   - Deploy fix
   - Verify resolution
   - Monitor for recurrence
   ↓
5. DOCUMENT
   - Post-mortem meeting
   - Root cause analysis
   - Preventive measures
   - Update runbooks
```

### 6.3 Incident Response Team

| Role                   | Name             | Responsibilities                        |
| ---------------------- | ---------------- | --------------------------------------- |
| **Incident Commander** | Brian Ngatia     | Coordinate response, communicate status |
| **Technical Lead**     | (To be assigned) | Investigate, implement fix              |
| **DevOps**             | (To be assigned) | Deploy fix, monitor systems             |
| **Communications**     | (To be assigned) | Update stakeholders, customers          |

---

## 7. Performance Optimization

### 7.1 Performance Targets

| Metric                   | Target        | Measurement            |
| ------------------------ | ------------- | ---------------------- |
| Page Load Time           | < 1.5 seconds | Google Lighthouse      |
| First Contentful Paint   | < 1 second    | Web Vitals             |
| Largest Contentful Paint | < 2.5 seconds | Web Vitals             |
| Cumulative Layout Shift  | < 0.05        | Web Vitals             |
| Time to Interactive      | < 3 seconds   | Lighthouse             |
| API Response Time        | < 500ms       | Application monitoring |
| Database Query Time      | < 100ms       | Database monitoring    |

### 7.2 Performance Optimization Checklist

- [ ] Code splitting by route
- [ ] Image optimization (WebP, lazy loading)
- [ ] CSS minification and purging
- [ ] JavaScript minification and tree-shaking
- [ ] Gzip compression
- [ ] Browser caching (1 year for static assets)
- [ ] Service Worker for offline support
- [ ] Database query optimization
- [ ] Connection pooling
- [ ] CDN for static assets
- [ ] Monitoring and alerting

---

## 8. Rollback Procedure

### 8.1 Automated Rollback

```bash
#!/bin/bash
# Automated rollback script

# Check error rate
ERROR_RATE=$(curl -s https://monitoring.example.com/api/error-rate)

if [ "$ERROR_RATE" -gt 1 ]; then
  echo "Error rate > 1%, initiating rollback..."

  # Get previous version
  PREVIOUS_VERSION=$(git describe --tags --abbrev=0 HEAD^)

  # Rollback to previous version
  git checkout $PREVIOUS_VERSION

  # Rebuild and deploy
  pnpm build
  manus-deploy --environment production

  # Verify rollback
  sleep 60
  NEW_ERROR_RATE=$(curl -s https://monitoring.example.com/api/error-rate)

  if [ "$NEW_ERROR_RATE" -lt 1 ]; then
    echo "Rollback successful!"
    # Notify team
    send-notification "Rollback completed to $PREVIOUS_VERSION"
  fi
fi
```

### 8.2 Manual Rollback

```bash
# Manual rollback procedure
1. Identify issue (< 15 minutes)
2. Notify team (< 5 minutes)
3. Checkout previous version
   git checkout <previous-version>
4. Rebuild application
   pnpm build
5. Deploy to production
   manus-deploy --environment production
6. Verify rollback
   - Check error logs
   - Verify functionality
   - Monitor metrics
7. Post-mortem
   - Root cause analysis
   - Preventive measures
   - Update procedures
```

---

## 9. Sign-Off

| Role          | Name             | Status     | Date       |
| ------------- | ---------------- | ---------- | ---------- |
| Security Lead | Brian Ngatia     | ☐ Approved | **\_\_\_** |
| DevOps Lead   | (To be assigned) | ☐ Approved | **\_\_\_** |
| Client        | Mr. Daniel       | ☐ Approved | **\_\_\_** |

---

**Document End**
