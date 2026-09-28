# Store Ratings Hub

A full-stack web application for managing stores and collecting user ratings. The platform provides role-based access for **System Administrators, Normal Users, and Store Owners**.

## 🚀 Live Demo

**Live Application:** https://storaterhub-bqxmlkpn.manus.space/

**GitHub Repository:** https://github.com/AaryanSingh10/Store-Hub

---

## 📌 Features

### 👨‍💼 System Administrator

* View an administrative dashboard
* View total users, stores, and submitted ratings
* Add new stores
* Add normal users and administrator users
* View all stores with their ratings
* View users with their roles and details
* Search and filter users/stores
* Sort table data in ascending or descending order
* View detailed user information
* Manage platform data

### 👤 Normal User

* Create an account
* Log in securely
* View all registered stores
* Search stores by name and address
* View overall store ratings
* View their own submitted rating
* Submit a rating from 1 to 5
* Modify their existing rating
* Update their password
* Log out

### 🏪 Store Owner

* Log in to the platform
* View their store's average rating
* View users who submitted ratings for their store
* Update their password
* Log out

---

## 🛠️ Tech Stack

### Frontend

* React.js
* TypeScript
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL
* Drizzle ORM

### Development Tools

* Git & GitHub
* pnpm
* Vitest
* Prettier

---

## 🔐 Authentication & Authorization

The application uses role-based access control.

There are three user roles:

```text
ADMIN
USER
OWNER
```

Each role has access to different features and dashboards.

Protected application routes ensure that users can only access functionality permitted for their role.

---

## ⭐ Rating System

Users can submit ratings for registered stores on a scale of:

```text
1 ⭐ → 5 ⭐
```

A user can update their previously submitted rating rather than creating multiple ratings for the same store.

Store owners can view the average rating for their store.

---

## 🔎 Search, Filtering & Sorting

The application supports:

* Store search by name
* Store search by address
* User filtering by name
* User filtering by email
* User filtering by address
* User filtering by role
* Ascending and descending sorting for relevant table fields

---

## 📋 Form Validation

The application validates:

* Name length
* Address length
* Email format
* Password length
* Password complexity
* Rating range

Passwords must contain at least one uppercase letter and one special character.

---

## 📁 Project Structure

```text
Store-Hub/
│
├── client/              # React frontend
│   ├── src/
│   └── public/
│
├── server/              # Backend and API logic
│
├── shared/              # Shared types/utilities
│
├── drizzle/             # Database schema/migrations
│
├── patches/             # Project patches
│
├── package.json
├── pnpm-lock.yaml
├── drizzle.config.ts
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

* Node.js
* pnpm
* PostgreSQL

### Clone the repository

```bash
git clone https://github.com/AaryanSingh10/Store-Hub.git
cd Store-Hub
```

### Install dependencies

```bash
pnpm install
```

### Environment Variables

Create a `.env` file in the project root and configure the required database and application environment variables.

Example:

```env
DATABASE_URL=your_postgresql_connection_string
```

Do not commit `.env` files or other secrets to GitHub.

### Run the application

```bash
pnpm dev
```

The development server will start locally according to the project configuration.

---

## 🗄️ Database

The project uses **PostgreSQL** with **Drizzle ORM** for database interaction and schema management.

The main entities include:

```text
Users
Stores
Ratings
```

Relationships between users, stores, and ratings allow the application to calculate store ratings and identify users who submitted ratings.

---

## 🧪 Testing

The project includes Vitest configuration for automated testing.

Run tests with:

```bash
pnpm test
```

---

## 📸 Screenshots

Screenshots can be added here to demonstrate:

* Login page
* Admin dashboard
* Store listing
* Rating interface
* Store owner dashboard

---

## 🎯 Project Objective

The project was developed as a full-stack implementation of a role-based store rating platform, focusing on:

* React frontend development
* Backend API development
* Database design
* Authentication and authorization
* CRUD operations
* Role-based access control
* Search and filtering
* Data validation
* Rating management

---

## 👨‍💻 Author

**Aaryan Singh**

* GitHub: https://github.com/AaryanSingh10
* Repository: https://github.com/AaryanSingh10/Store-Hub
* Live Demo: https://storaterhub-bqxmlkpn.manus.space/
