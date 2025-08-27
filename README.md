# Help App - Backend

This is the backend for the Help App, a platform that connects clients with service providers for on-demand tasks.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [JWT](https://jwt.io/)
- **Validation**: [Zod](https://zod.dev/)
- **Hashing**: [Bcrypt](https://www.npmjs.com/package/bcrypt)
- **Linting**: [ESLint](https://eslint.org/)

## Setup and Run Instructions

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Set up environment variables**:

    Create a `.env` file in the root of the project and add the following variables:

    ```
    DATABASE_URL="your-postgresql-database-url"
    JWT_SECRET_KEY="a-very-secret-key-for-jwt"
    ```

    *Replace `your-postgresql-database-url` with your actual PostgreSQL connection string.*
    *Replace `a-very-secret-key-for-jwt` with a strong, random string.*

4.  **Run database migrations**:

    ```bash
    npx prisma migrate dev
    ```

    This will apply the database schema and create tables.

5.  **Run the development server**:

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:3000`.

## API Endpoints

All API endpoints are documented using OpenAPI (Swagger).

## Hosted Swagger Documentation

[Link to your hosted Swagger UI here] (Please deploy the application and update this link)

## Assumptions and Shortcuts Made

- **Service Creation**: The `POST /api/services` endpoint is implemented for creating `ServiceType`s (e.g., "Plumbing", "Electrical"). It is assumed that actual `Service` instances (e.g., "Drain Cleaning" offered by a specific provider) would be created via a separate endpoint, likely by providers themselves, which was not explicitly defined in the assessment task.
- **Manual Swagger Documentation**: Due to limitations in automatically generating OpenAPI specifications from Next.js API routes within this environment, the `swagger.json` file has been manually created and maintained.
- **Temporary Service Creation for Testing**: To facilitate testing of the booking endpoint, a `Service` instance was temporarily created via a direct Prisma call within a temporary API route, as a dedicated endpoint for `Service` creation was not part of the specified tasks.