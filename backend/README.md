# EduFlow: Modern Course Management API -)

EduFlow is a robust Laravel-based API designed for educational institutions to manage courses, student enrollments, and academic group organization. This platform integrates modern features like automated student grouping, interest-based course recommendations, and secure online payments.

---

## Key Features

### Authentication & Security
- **JWT Authentication**: Secure user registration and login using JSON Web Tokens.
- **Role-based Access**: Specialized functionalities for **Students** and **Teachers**.
- **Password Management**: Secure password reset flow.

### Course Management
- **Teacher Dashboard**: Comprehensive CRUD operations for courses, including pricing and metadata.
- **Student Discovery**: Advanced search and filtering to explore available courses.
- **Wishlist**: Save courses of interest to a personal favorites list for later viewing.

### Smart Recommendations
- **Interest-based Suggestions**: Automated course recommendations based on student's selected domains and career interests.

### Payments & Enrollment
- **Stripe Integration**: Seamless and secure credit card payments for course enrollment.
- **Course Lifecycle**: Easy enrollment and withdrawal processes.

### Automated Grouping
- **Dynamic Teams**: Automatic assignment of students into groups (max 25 participants per group).
- **Auto-scaling**: New groups are automatically created as enrollment grows.

---

## Tech Stack

- **Framework**: [Laravel 12](https://laravel.com)
- **Language**: PHP 8.2+
- **Database**: MySQL / PostgreSQL
- **Security**: [PHP Open Source Saver JWT-Auth](https://github.com/PHP-Open-Source-Saver/jwt-auth)
- **Payment Gateway**: [Stripe PHP](https://github.com/stripe/stripe-php)
- **API Documentation**: [L5-Swagger](https://github.com/DarkaOnline/L5-Swagger) (OpenAPI 3.0)
- **Testing**: PHPUnit

---

## Architecture Patterns

This project follows clean code principles and modular architecture:
- **Repository Pattern**: Abstraction layer between the domain and data mapping.
- **Service Layer**: Decoupled business logic from controllers for better maintainability and testability.
- **Form Requests**: Dedicated validation logic for all incoming API data.

---

## Getting Started

### Prerequisites
- PHP 8.2 or higher
- Composer
- MySQL/MariaDB
- Stripe Account (for payments)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd EduFlow
   ```

2. **Install dependencies**:
   ```bash
   composer install
   ```

3. **Environment Setup**:
   Copy the example environment file and configure your database and Stripe keys.
   ```bash
   cp .env.example .env
   php artisan key:generate
   php artisan jwt:secret
   ```

4. **Database Migration & Seeding**:
   ```bash
   php artisan migrate --seed
   ```

5. **Run the application**:
   ```bash
   php artisan serve
   ```

---

## API Documentation

The API documentation is automatically generated using Swagger. Once the server is running, you can access the interactive UI at:

`http://localhost:8000/api/documentation`

---

## Testing

To run the automated test suite:
```bash
php artisan test
```

---

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
