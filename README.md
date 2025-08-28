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

## API Test Data

This section provides `curl` commands to test all implemented API routes. Before running these commands, ensure your Next.js development server is running (`npm run dev`) and your PostgreSQL database is accessible and has the latest migrations applied (`npx prisma migrate dev`).

**Important Note:** Replace placeholder tokens and IDs (e.g., `<CLIENT_TOKEN>`, `<PROVIDER_ID>`, `<BOOKING_ID>`) with the actual values you obtain from the responses of previous commands.

---

### Step 0: Clean up existing data (Optional but Recommended)

If you want to start with a clean slate, you can reset your database. This will delete all data.

```bash
npx prisma migrate reset
```

Then run migrations again to recreate the tables:

```bash
npx prisma migrate dev
```

---

### Step 1: User Management Endpoints

#### `POST /api/signup` - Register Users

*   **Client User:**

    ```bash
    curl -X POST http://localhost:3000/api/signup \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test Client",
      "email": "client@example.com",
      "password": "clientpassword",
      "role": "CLIENT"
    }'
    ```

    *Expected Output:* A JSON object with `message`, `token`, and `user` details (including `id`). Copy the `token` for later use.

*   **Provider User:**

    ```bash
    curl -X POST http://localhost:3000/api/signup \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test Provider",
      "email": "provider@example.com",
      "password": "providerpassword",
      "role": "PROVIDER"
    }'
    ```

    *Expected Output:* A JSON object with `message`, `token`, and `user` details. Copy the `token` and the `id` of the provider for later use.

*   **Admin User:**

    ```bash
    curl -X POST http://localhost:3000/api/signup \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test Admin",
      "email": "admin@example.com",
      "password": "adminpassword",
      "role": "ADMIN"
    }'
    ```

    *Expected Output:* A JSON object with `message`, `token`, and `user` details. Copy the `token` for later use.

#### `POST /api/login` - Authenticate Users

*   **Login as Client:**

    ```bash
    curl -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "client@example.com",
      "password": "clientpassword"
    }'
    ```

    *Expected Output:* A JSON object with `message`, `token`, and `user` details.

*   *(Repeat for Provider and Admin if you want to get fresh tokens)*

#### `GET /api/me` - Get Current User Profile

*   **As Client:**

    ```bash
    # Replace <CLIENT_TOKEN> with the token obtained from client signup/login
    curl -X GET http://localhost:3000/api/me \
    -H "Authorization: Bearer <CLIENT_TOKEN>"
    ```

    *Expected Output:* A JSON object with the client's profile details.

*   *(Repeat for Provider and Admin using their respective tokens)*

---

### Step 2: Service Endpoints

#### `POST /api/services` - Create a Service Type (Admin Only)

*   **Create "Plumbing" Service Type:**

    ```bash
    # Replace <ADMIN_TOKEN> with the token obtained from admin signup/login
    curl -X POST http://localhost:3000/api/services \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <ADMIN_TOKEN>" \
    -d '{
      "name": "Plumbing",
      "description": "General plumbing services"
    }'
    ```

    *Expected Output:* A JSON object with the created `ServiceType` details (including `id`). Copy the `id` for "Plumbing" service type for later use (e.g., `PLUMBING_SERVICE_TYPE_ID`).

*   **Create "Electrical" Service Type:**

    ```bash
    # Replace <ADMIN_TOKEN> with the token obtained from admin signup/login
    curl -X POST http://localhost:3000/api/services \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <ADMIN_TOKEN>" \
    -d '{
      "name": "Electrical",
      "description": "Electrical repair and installation services"
    }'
    ```

    *Expected Output:* A JSON object with the created `ServiceType` details.

#### `GET /api/services` - List All Service Types

```bash
curl -X GET http://localhost:3000/api/services
```

*Expected Output:* A JSON array containing the "Plumbing" and "Electrical" service types.

---

### Step 3: Manually Create a `Service` Entry (Important for Booking)

As discussed, there's no direct API endpoint to create a `Service` instance (which links a `ServiceType` to a `Provider`). You'll need to temporarily modify `pages/api/services/index.ts` to create a `Service` directly, or use a tool like Prisma Studio.

*   **Temporary Modification of `pages/api/services/index.ts`:**

    *   Open `pages/api/services/index.ts`.
    *   Locate the `createServiceTypeHandler` function.
    *   **Replace its content temporarily** with the following code to create a `Service` instead of a `ServiceType`.

        ```typescript
        // Inside pages/api/services/index.ts
        // ... (other imports)
        import prisma from "@/lib/prisma"; // Ensure this import is present at the top of the file

        const createServiceTypeHandler = async (
          req: NextApiRequest,
          res: NextApiResponse,
          validatedData: any // Type will be inferred by withValidation
        ) => {
          try {
            // TEMPORARY: Create a Service instead of ServiceType for testing bookings
            const { title, description, price, providerId, serviceTypeId } = req.body;

            const newService = await prisma.service.create({
              data: {
                title,
                description,
                price,
                providerId,
                serviceTypeId,
              },
            });
            return res.status(201).json(newService);
          } catch (error: any) {
            console.error("API Error creating service:", error);
            return res.status(500).json({ message: "Failed to create service." });
          }
        };

        // ... (rest of the file)
        ```

    *   **Also, temporarily remove `withValidation` from the `POST` handler in the `default export` function:**

        ```typescript
        // Inside pages/api/services/index.ts
        // ... (default export function)
        export default function (req: NextApiRequest, res: NextApiResponse) {
          if (req.method === "POST") {
            const authenticatedAndValidatedHandler = withAuth(
              createServiceTypeHandler, // Changed from withValidation(createServiceTypeSchema, createServiceTypeHandler)
              Role.ADMIN
            );
            return authenticatedAndValidatedHandler(req, res);
          } else {
            // For GET requests, just use the base handler
            return handler(req, res);
          }
        }
        ```

    *   **Save the file.**

*   **Create a `Service` instance using the modified endpoint:**

    ```bash
    # Replace <ADMIN_TOKEN> with your admin token
    # Replace <PROVIDER_ID> with the ID of your Provider user (from Provider signup output)
    # Replace <PLUMBING_SERVICE_TYPE_ID> with the ID of the "Plumbing" ServiceType
    curl -X POST http://localhost:3000/api/services \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <ADMIN_TOKEN>" \
    -d '{
      "title": "Advanced Drain Cleaning",
      "description": "Advanced techniques for stubborn clogs.",
      "price": 120.00,
      "providerId": "<PROVIDER_ID>",
      "serviceTypeId": "<PLUMBING_SERVICE_TYPE_ID>"
    }'
    ```

    *Expected Output:* A JSON object with the created `Service` details (including `id`). Copy the `id` of this service for later use (e.g., `DRAIN_CLEANING_SERVICE_ID`).

*   **Revert `pages/api/services/index.ts`:**

    *   **Revert the `createServiceTypeHandler` content** back to its original state (creating `ServiceType` using `createServiceType` from `service.service.ts`).
    *   **Re-add `withValidation`** to the `POST` handler in the `default export` function.
    *   **Save the file.**

---

### Step 4: Booking Endpoints

#### `POST /api/bookings` - Client Books a Service Provider

```bash
# Replace <CLIENT_TOKEN> with your client token
# Replace <PROVIDER_ID> with the ID of your Provider user
# Replace <DRAIN_CLEANING_SERVICE_ID> with the ID of the created Service instance
curl -X POST http://localhost:3000/api/bookings \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <CLIENT_TOKEN>" \
-d '{
  "providerId": "<PROVIDER_ID>",
  "serviceId": "<DRAIN_CLEANING_SERVICE_ID>"
}'
```

*Expected Output:* A JSON object with the newly created `Booking` details (status `PENDING`). Copy the `id` of this booking for later use (e.g., `BOOKING_ID`).

#### `GET /api/bookings` - Get Bookings for Logged-in User

*   **As Client:**

    ```bash
    # Replace <CLIENT_TOKEN> with your client token
    curl -X GET http://localhost:3000/api/bookings \
    -H "Authorization: Bearer <CLIENT_TOKEN>"
    ```

    *Expected Output:* A JSON array containing the booking(s) made by the client.

*   **As Provider:**

    ```bash
    # Replace <PROVIDER_TOKEN> with your provider token
    curl -X GET http://localhost:3000/api/bookings \
    -H "Authorization: Bearer <PROVIDER_TOKEN>"
    ```

    *Expected Output:* A JSON array containing the booking(s) assigned to the provider.

#### `PATCH /api/bookings/:id` - Provider Accepts/Rejects/Completes a Booking

*   **Accept Booking (as Provider):**

    ```bash
    # Replace <PROVIDER_TOKEN> with your provider token
    # Replace <BOOKING_ID> with the ID of the booking you want to update
    curl -X PATCH http://localhost:3000/api/bookings/<BOOKING_ID> \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <PROVIDER_TOKEN>" \
    -d '{
      "status": "ACCEPTED"
    }'
    ```

    *Expected Output:* A JSON object with the `Booking` details, with `status` updated to `ACCEPTED`.

*   **Complete Booking (as Provider):**

    ```bash
    # Replace <PROVIDER_TOKEN> with your provider token
    # Replace <BOOKING_ID> with the ID of the booking you want to update
    curl -X PATCH http://localhost:3000/api/bookings/<BOOKING_ID> \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <PROVIDER_TOKEN>" \
    -d '{
      "status": "COMPLETED"
    }'
    ```

    *Expected Output:* A JSON object with the `Booking` details, with `status` updated to `COMPLETED`.

*   **Test Invalid Status Transition (e.g., from COMPLETED to PENDING):**

    ```bash
    # Replace <PROVIDER_TOKEN> with your provider token
    # Replace <BOOKING_ID> with the ID of the booking you want to update
    curl -X PATCH http://localhost:3000/api/bookings/<BOOKING_ID> \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <PROVIDER_TOKEN>" \
    -d '{
      "status": "PENDING"
    }'
    ```

    *Expected Output:* A 400 Bad Request response with an error message.

*   **Test Unauthorized Update (e.g., Client trying to update):**

    ```bash
    # Replace <CLIENT_TOKEN> with your client token
    # Replace <BOOKING_ID> with the ID of the booking you want to update
    curl -X PATCH http://localhost:3000/api/bookings/<BOOKING_ID> \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <CLIENT_TOKEN>" \
    -d '{
      "status": "ACCEPTED"
    }'
    ```

    *Expected Output:* A 403 Forbidden response.

---

### Step 5: Review Endpoint

#### `POST /api/reviews` - Client Reviews a Completed Service

```bash
# Replace <CLIENT_TOKEN> with your client token
# Replace <BOOKING_ID> with the ID of the booking that is now COMPLETED
curl -X POST http://localhost:3000/api/reviews \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <CLIENT_TOKEN>" \
-d '{
  "bookingId": "<BOOKING_ID>",
  "rating": 5,
  "comment": "Excellent service, very professional and efficient!"
}'
```

*Expected Output:* A JSON object with the newly created `Review` details.
