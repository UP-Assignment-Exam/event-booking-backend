
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
git clone https://github.com/your-username/up-blog.git
cd up-blog
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
        Date createdAt
        Date updatedAt
    }

    ADMIN_USER_REQUESTS {
        ObjectId _id PK
        String status "pending|approved|rejected"
        String username
        String firstName
        String lastName
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
        String password
        String email
        Date passwordChangedAt
        Date createdAt
        Date updatedAt
    }

    CATEGORIES {
        ObjectId _id PK
        String name
        String color
        String iconUrl
        ObjectId createdBy FK
        Boolean isDeleted
        Date createdAt
        Date updatedAt
    }

    EVENTS {
        ObjectId _id PK
        String title
        String description
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
        ObjectId createdBy FK
        Boolean isDeleted
        Date createdAt
        Date updatedAt
    }

    PAYMENT_METHODS {
        ObjectId _id PK
        String name
        String type "card|bank_transfer|cash"
        String description
        String imageUrl
        Boolean isActive
        Date createdAt
        Date updatedAt
    }

    PROMO_CODES {
        ObjectId _id PK
        String promoCode
        Number discountPercentage
        String color
        String imageUrl
        Array bindedEvents FK
        Array bindedCategories FK
        ObjectId createdBy FK
        Date expirdAt
        Boolean isActive
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
        Date createdAt
        Date updatedAt
    }

    RIGHTS {
        ObjectId _id PK
        String type "website|app"
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
        Array associatedRights FK
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

    %% Relationships
    ADMIN_USERS ||--o{ ADMIN_USER_REQUESTS : "actionBy"
    ADMIN_USERS ||--o{ CATEGORIES : "createdBy"
    ADMIN_USERS ||--o{ EVENTS : "createdBy"
    ADMIN_USERS ||--o{ TICKET_TYPES : "createdBy"
    ADMIN_USERS ||--o{ PROMO_CODES : "createdBy"
    ADMIN_USERS ||--o{ PASSWORD_RESET_TOKEN : "adminUserId"
    ADMIN_USERS ||--o{ SETUP_PASSWORD_TOKEN : "adminUserId"

    APP_USERS ||--o{ PASSWORD_RESET_TOKEN : "appUserId"
    APP_USERS ||--o{ TICKETS : "userId"

    CATEGORIES ||--o{ EVENTS : "category"
    CATEGORIES ||--o{ PROMO_CODES : "bindedCategories"

    EVENTS ||--o{ TICKETS : "eventId"
    EVENTS ||--o{ PROMO_CODES : "bindedEvents"
    EVENTS }o--o{ TICKET_TYPES : "ticketTypes.name"

    TICKET_TYPES ||--o{ TICKETS : "ticketType"

    PAYMENT_METHODS ||--o{ TICKETS : "paymentMethod"

    PROMO_CODES ||--o{ TICKETS : "discount.promoCode"

    RIGHTS ||--o{ ROLES : "associatedRights"
```

> **Note:** This ERD shows the MongoDB collections and their relationships. Embedded documents like `ticketTypes` in events and `discount` in tickets are noted with "embedded" labels.

## 📌 Additional Notes

- Ensure your MongoDB URI is correct and accessible.
- Make sure the email config allows SMTP access (e.g., Gmail app password).
- This backend is meant to support a separate frontend (React/Vue/etc.).

---

## 📄 License

This project is licensed under the **MIT License**.
