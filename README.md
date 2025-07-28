# 🎟️ Event Booking Backend

A modular and scalable **Node.js** backend for managing users, events, ticketing, and promotions.

---

## 🔧 Requirements

- **Node.js**: `v20.18.3`
- **MongoDB**: Cloud or local database instance

---

## 📁 Project Structure

```
.
├── exports/         # Reusable utility modules
├── helpers/         # General-purpose helper functions
├── middlewares/     # Express middleware (e.g., auth)
├── models/          # Mongoose schemas and models
├── routes/          # API route definitions
├── services/        # Core business logic
├── validations/     # Input validation rules (e.g., Joi)
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/UP-Assignment-Exam/event-booking-backend.git
cd event-booking-backend.git
```

### 2. Install Node Version

Use `nvm` to install and use the required Node.js version:

```bash
nvm install 20.18.3
nvm use 20.18.3
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory and populate it with the following:

```
PORT=8080
USE_DB=db_name

# Max upload size
LIMIT_BODY_PARSER=50mb

# MongoDB connection
DATABASE_CONNECTION_STRING=mongodb+srv://<account>:<password>@<host>/<db_name>?retryWrites=true&w=majority

# Email config
EMAIL_USER=your_email
EMAIL_APP_PASSWORD=your_app_password

# App config
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
JWT_SECRET=your_secret

# AWS config
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
AWS_S3_BUCKET_NAME=
```

> ⚠️ Replace `<account>`, `<password>`, `<host>`, and `<db_name>` with your actual MongoDB Atlas credentials.

### 5. Run the Server

```bash
npm start
```

Visit the API: [http://localhost:8080](http://localhost:8080)

---

## 📘 Features

- 👥 Admin & User role support
- 🔐 JWT Authentication
- 📧 Email verification & password reset
- 🏷️ Event categories and promo codes
- 🎫 Ticket types and purchases
- 💳 Payment method options
- 🌍 i18n/multi-language support
- 📤 File upload support (limit: 50MB)

## 🧩 Entity Relationship Diagram

```mermaid
erDiagram
    ADMIN_USERS {
        ObjectId _id PK
        Boolean isDeleted
        String username
        String firstName
        String lastName
        String password
        String phone
        String email
        Date passwordChangedAt
        ObjectId role FK
        Boolean isSetup
        ObjectId organization FK
        Boolean status
        String location
        Date lastLogin
        String bio
        String avatar
        Date createdAt
        Date updatedAt
    }

    ADMIN_USER_REQUESTS {
        ObjectId _id PK
        String status "pending|approved|rejected"
        String priority "low|medium|high"
        String contactName
        String firstName
        String lastName
        String organizationName
        String organizationCategory "Company|Non-Profit|Government|School|Other"
        Number foundedYear
        String revenue
        String address
        String description
        String requestReason
        String industry
        String website
        String phone
        String email
        ObjectId actionBy FK
        Date actionAt
        String actionReason
        Date createdAt
        Date updatedAt
    }

    APP_USERS {
        ObjectId _id PK
        Boolean isDeleted
        String username
        String firstName
        String lastName
        String phone
        String password
        String email
        Boolean emailVerified
        Boolean isActive
        String avatar
        Date lastLogoutAt
        Date passwordChangedAt
        Date createdAt
        Date updatedAt
    }

    CATEGORIES {
        ObjectId _id PK
        String title
        String color
        String iconUrl
        String description
        ObjectId createdBy FK
        Boolean isDeleted
        Date createdAt
        Date updatedAt
    }

    EVENTS {
        ObjectId _id PK
        String title
        String description
        ObjectId organization FK
        ObjectId createdBy FK
        ObjectId category FK
        Array ticketTypes "embedded"
        Boolean isPurchasable
        Object disabledPurchase "embedded"
        Date startDate
        Date endDate
        Boolean isDeleted
        Date createdAt
        Date updatedAt
    }

    TICKET_TYPES {
        ObjectId _id PK
        String title
        String description
        String imageUrl
        ObjectId createdBy FK
        Boolean isActive
        Boolean isDeleted
        Date createdAt
        Date updatedAt
    }

    PAYMENT_METHODS {
        ObjectId _id PK
        String name
        String provider
        String type "card|bank|wallet|crypto|qr"
        Number processingFee
        String description
        String apiKey
        Array supportedCurrencies
        String webhookUrl
        Boolean isActive
        String imageUrl
        Boolean isDeleted
        ObjectId createdBy FK
        ObjectId updatedBy FK
        ObjectId deletedBy FK
        Date createdAt
        Date updatedAt
    }
    
    PROMO_CODES {
        ObjectId _id PK
        String promoCode
        String title
        String description
        String discountType "percentage|fixed"
        Number discountValue
        Number minOrder
        Number maxUses
        Number currentUses
        String status "active|inactive|expired"
        String priority "low|medium|high"
        Date startDate
        Date endDate
        ObjectId createdBy FK
        ObjectId updatedBy FK
        Boolean isDeleted
        Date createdAt
        Date updatedAt
    }

    TICKETS {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId eventId FK
        Number price
        Number quantity
        Number totalPrice
        String status "pending|confirmed|cancelled"
        ObjectId ticketType FK
        ObjectId paymentMethod FK
        Object discount "embedded"
        Date purchasedAt
        ObjectId createdBy FK
        Date createdAt
        Date updatedAt
    }

    RIGHTS {
        ObjectId _id PK
        String type "website|app"
        String group
        String name
        String description
        Boolean isDeleted
        Date createdAt
        Date updatedAt
    }

    ROLES {
        ObjectId _id PK
        String type "website|app"
        String name
        String description
        String status "active|inactive"
        Boolean superAdmin
        Boolean organizationSuperAdmin
        Array associatedRights FK
        ObjectId createdBy FK
        ObjectId updatedBy FK
        ObjectId organization FK
        Boolean isDeleted
        Date createdAt
        Date updatedAt
    }

    PASSWORD_RESET_TOKEN {
        ObjectId _id PK
        ObjectId adminUserId FK
        ObjectId appUserId FK
        String email
        String token
        String hashedToken
        Date expiresAt
        Boolean used
        Date createdAt
    }

    SETUP_PASSWORD_TOKEN {
        ObjectId _id PK
        ObjectId adminUserId FK
        String token
        Date createdAt
        Date updatedAt
    }

    ORGANIZATIONS {
        ObjectId _id PK
        String name
        String type "Company|Non-Profit|Government|School|Other"
        String industry
        String bio
        String contactInfo
        String email
        String phone
        String website
        String logoUrl
        ObjectId adminUserRequest FK
        Boolean isActive
        ObjectId createdBy FK
        Date createdAt
        Date updatedAt
    }

    OTP_TOKENS {
        ObjectId _id PK
        ObjectId userId FK
        String email
        String otp "first 3 digits"
        String hashedOTP
        String purpose "email_verification|password_reset|account_activation|phone_verification|two_factor_auth|account_recovery"
        Date expiresAt
        Number attempts "0..5"
        Boolean used
        Date usedAt
        String requestIP
        String userAgent
        Date createdAt
        Date updatedAt
    }

    APP_USERS {
        ObjectId _id PK
        Boolean isDeleted
        String username
        String firstName
        String lastName
        String phone
        String password
        String email
        Date lastLogoutAt
        Boolean isActive
        Boolean emailVerified
        String avatar
        Date passwordChangedAt
        Date createdAt
        Date updatedAt
    }

    %% Relationships
    ADMIN_USERS ||..|| ROLES : has_role
    ADMIN_USERS ||..|| ORGANIZATIONS : belongs_to
    ADMIN_USER_REQUESTS ||..|| ADMIN_USERS : action_taken_by
    CATEGORIES ||..|| ADMIN_USERS : created_by

    EVENTS ||..|| ADMIN_USERS : created_by
    EVENTS ||..|| CATEGORIES : has_category
    EVENTS ||..|| ORGANIZATIONS : belongs_to

    TICKET_TYPES ||..|| ADMIN_USERS : created_by

    PAYMENT_METHODS ||..|| ADMIN_USERS : created_by
    PAYMENT_METHODS ||..|| ADMIN_USERS : updated_by
    PAYMENT_METHODS ||..|| ADMIN_USERS : deleted_by

    PROMO_CODES ||..|| ADMIN_USERS : created_by
    PROMO_CODES ||..|| ADMIN_USERS : updated_by
    
    TICKETS ||..|| APP_USERS : belongs_to_user
    TICKETS ||..|| EVENTS : belongs_to_event
    TICKETS ||..|| TICKET_TYPES : has_ticket_type
    TICKETS ||..|| PAYMENT_METHODS : paid_by
    TICKETS ||..|| ADMIN_USERS : discount_set_by
    TICKETS ||..|| ADMIN_USERS : created_by
    TICKETS ||..|| PROMO_CODES : applied_promo_code
    
    ROLES ||..|| RIGHTS : has_rights
    ROLES ||..|| ADMIN_USERS : created_by
    ROLES ||..|| ADMIN_USERS : updated_by
    ROLES ||..|| ORGANIZATIONS : belongs_to

    PASSWORD_RESET_TOKEN ||..|| ADMIN_USERS : belongs_to_admin_user
    PASSWORD_RESET_TOKEN ||..|| APP_USERS : belongs_to_app_user

    SETUP_PASSWORD_TOKEN ||..|| ADMIN_USERS : belongs_to_admin_user

    ORGANIZATIONS ||..|| ADMIN_USER_REQUESTS : requested_by
    ORGANIZATIONS ||..|| ADMIN_USERS : created_by

    OTP_TOKENS ||--|| APP_USERS : userId
```

> **Note:** This ERD shows the MongoDB collections and their relationships. Embedded documents like `ticketTypes` in events and `discount` in tickets are noted with "embedded" labels.

## 📌 Additional Notes

- Ensure your MongoDB URI is correct and accessible.
- Make sure the email config allows SMTP access (e.g., Gmail app password).
- This backend is meant to support a separate frontend (React/Vue/etc.).

---

## 📄 License

This project is licensed under the **MIT License**.
