# EduFlow 🎓

EduFlow is a modern e-learning platform where students can discover and enroll in courses taught by expert instructors, and teachers can create and manage their curriculum.

The project is divided into two main parts:
- **Frontend**: A lightweight, Vanilla JavaScript Single Page Application (SPA) with custom routing and modular components.
- **Backend**: A robust Laravel-based REST API handling course management, enrollments, payments, and automated grouping.

## Key Features

- **For Students**: Discover courses with advanced filtering, receive interest-based recommendations, manage a personalized wishlist, and enroll securely via Stripe. Once enrolled, students are automatically assigned to dynamic study groups.
- **For Teachers**: A comprehensive dashboard to create, price, and manage courses and curriculum metadata.
- **Roles & Authentication**: Secure JWT-based authentication separating functionalities for Students and Teachers.
- **Payment Integration**: Seamless and secure credit card enrollments through Stripe.

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES Modules), HTML5, CSS3, Lucide Icons.
- **Backend**: Laravel 12 (PHP 8.2+), MySQL/PostgreSQL.
- **Integrations**: JWT-Auth for Security, Stripe PHP for payments, Swagger (OpenAPI 3) for documentation.

## Getting Started

To run EduFlow locally, you must run both the Laravel Backend and the frontend static server.

### 1. Backend Setup (API)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
# Configure your db credentials and Stripe keys in .env
php artisan migrate --seed
php artisan serve
```
*Interactive API documentation is automatically generated via Swagger and can be accessed at `http://localhost:8000/api/documentation`.*

### 2. Frontend Setup

Since the frontend is built with Vanilla JavaScript and HTML/CSS, it does not require a complex build step. You can serve it using any basic static file server (for example, VS Code Live Server or Python).

```bash
cd frontend
# Example using npx:
npx serve .
# Or open index.html using an extension like Live Server
```
*Note: Ensure that your frontend is configured to communicate with the local backend server (usually `http://localhost:8000/api`).*

## Further Reading

For more specific and in-depth details about the backend architecture, API patterns, and tests, please check out the [Backend README](backend/README.md).

## License

This project is open-sourced software licensed under the MIT license.
