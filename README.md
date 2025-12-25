<div align="center">

# 🚀 QuickServe

> **A Revolutionary Service Marketplace Platform**  
> *Connecting customers with verified, nearby service providers in real-time*

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)](https://quickserve-nu.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://quickserve-mdn2.onrender.com)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue?style=for-the-badge&logo=python)](https://www.python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)

[🌐 Live Demo](#-live-urls) • [📚 Documentation](#-api-documentation) • [🏗️ Architecture](#-architecture) • [⚙️ Installation](#-installation--setup)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🌐 Live URLs](#-live-urls)
- [🧱 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🏗️ Architecture](#-architecture)
- [🔐 Environment Variables](#-environment-variables)
- [⚙️ Installation & Setup](#-installation--setup)
- [🚀 Running Locally](#-running-locally)
- [🎯 Key Functionalities](#-key-functionalities)
- [📊 Database Schema](#-database-schema)
- [🔒 Security Features](#-security-features)
- [📈 Performance & Scalability](#-performance--scalability)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👨‍💻 Author](#-author)

---

## ✨ Features

### 🎯 For Customers
- 🔍 **Smart Service Discovery** - Find verified providers near you using AI-powered image recognition
- 📍 **Real-time Location Tracking** - Live provider updates with interactive maps
- 💰 **Transparent Pricing** - No hidden charges, upfront cost estimates
- ⭐ **Provider Ratings & Reviews** - Make informed decisions based on community feedback
- 🔔 **Live Job Updates** - Real-time status notifications (Pending → Assigned → En Route → Arrived → Payment → Completed)
- 📱 **Responsive Design** - Works seamlessly on mobile, tablet, and desktop
- 🛡️ **Secure Payments** - Integrated payment gateway with escrow protection

### 🎯 For Providers
- 📊 **Advanced Job Dashboard** - Accept/reject requests with analytics
- 🗺️ **Smart Routing** - Optimized job locations with distance calculations
- 📈 **Earnings Tracking** - Detailed analytics and payment history
- ✅ **KYC Verification** - Simple verification process with document upload
- 🌐 **Online Status Management** - Control availability in real-time
- 📱 **Mobile-First Experience** - Optimized for on-the-go service providers

### 🎯 For Admins
- 👥 **User Management** - Full control over customers, providers, and services
- 📊 **Business Analytics** - Comprehensive dashboards with KPIs
- ✅ **KYC Approval Workflow** - Secure provider verification pipeline
- 🚨 **Report Management** - Handle disputes and customer complaints
- 💳 **Transaction Monitoring** - Real-time payment and commission tracking
- 🔐 **Role-Based Access Control** - Granular permissions management

---

## 🌐 Live URLs

| Component | URL | Status |
|-----------|-----|--------|
| 🌍 **Frontend** | https://quickserve-nu.vercel.app | ![Active](https://img.shields.io/badge/Active-green) |
| 🔌 **Backend API** | https://quickserve-mdn2.onrender.com | ![Active](https://img.shields.io/badge/Active-green) |
| 📚 **API Docs (Swagger)** | https://quickserve-mdn2.onrender.com/docs | ![Active](https://img.shields.io/badge/Active-green) |
| 🔑 **API Docs (ReDoc)** | https://quickserve-mdn2.onrender.com/redoc | ![Active](https://img.shields.io/badge/Active-green) |

---

## 🧱 Tech Stack

### 💻 Frontend

**Hosting:** Vercel (Auto-deployments from GitHub)

### 🔌 Backend

**Hosting:** Render (Docker + PostgreSQL)

### 🗄️ Database


**Managed by:** Render PostgreSQL

### ☁️ External Services
- **📦 Supabase Storage** - KYC documents, profile photos
- **🖼️ Cloudinary** - Image optimization & delivery
- **🤖 Groq Vision API** - AI image analysis for service detection
- **🗺️ Leaflet + OpenStreetMap** - Mapping & geolocation

---

## 📁 Project Structure


**Managed by:** Render PostgreSQL

### ☁️ External Services
- **📦 Supabase Storage** - KYC documents, profile photos
- **🖼️ Cloudinary** - Image optimization & delivery
- **🤖 Groq Vision API** - AI image analysis for service detection
- **🗺️ Leaflet + OpenStreetMap** - Mapping & geolocation

---

---

## ⚙️ Installation & Setup

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 15+**
- **Git**
- **Supabase Account** (for file storage)
- **Cloudinary Account** (for image optimization)



---

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **CORS Protection** - Whitelist allowed origins
- ✅ **SQL Injection Prevention** - SQLAlchemy parameterized queries
- ✅ **Rate Limiting** - Prevent brute force attacks
- ✅ **Input Validation** - Pydantic schemas
- ✅ **Secure File Storage** - Supabase with access controls
- ✅ **HTTPS Only** - All connections encrypted

---

## 📈 Performance & Scalability

### Optimization Strategies

- **Database Indexing** on frequently queried columns
- **Query Optimization** with SQLAlchemy select optimization
- **Caching** with Redis (future enhancement)
- **CDN Distribution** via Vercel & Cloudinary
- **Async/Await** in FastAPI for non-blocking I/O
- **Connection Pooling** for database efficiency
- **Load Balancing** via Render's infrastructure

### Monitoring & Logging

- **Sentry** for error tracking
- **Datadog** for performance monitoring
- **Request logging** for debugging

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** changes (`git commit -m 'Add AmazingFeature'`)
4. **Push** to branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Omkar Solanke**

- 💼 LinkedIn: [@omkarsolanke](https://linkedin.com/in/omkarsolanke)
- 🐙 GitHub: [@omkarsolanke](https://github.com/omkarsolanke)


---

<div align="center">

### 🌟 If this project helped you, please consider giving it a star! ⭐

**Made with ❤️ using React, FastAPI, and PostgreSQL**

[⬆ Back to Top](#-quickserve)

</div>

