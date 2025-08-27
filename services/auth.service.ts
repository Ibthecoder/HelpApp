import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { LoginSchema, SignupSchema } from "@/schemas/auth.schema";
// Import Prisma's own ClientError types for robust error handling.
import { Prisma } from "@prisma/client";

//Hashes a plaintext password using a salt.
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  // Hash the password with the generated salt::
  return bcrypt.hash(password, salt);
}

//@returns A boolean indicating if the passwords match::
//Compares a plaintext password with a hashed password::.
async function comparePasswords(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// handle the user registration process::
export async function signupUser(userData: SignupSchema) {
  console.log(`Attempting to register new user with email: ${userData.email}`);

  try {
    // First, hash the user's password before storing it.
    // This is a critical security measure.
    const hashedPassword = await hashPassword(userData.password);

    // Then, create the new user record in the database.
    const newUser = await prisma.user.create({
      data: {
        ...userData, // Spread the other user data (name, email, role).
        password: hashedPassword, // CORRECT: Override the plaintext password with the hashed one.
      },
      // We select a subset of fields to return to the client.
      // NEVER return the password field.
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    console.log(`User registered successfully: ${newUser.email}`);
    return newUser;
  } catch (error) {
    // Handle a unique constraint violation (e.g., email already exists).
    // This is a specific Prisma error we can check for.
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        console.error("Registration failed: Email already in use.");
        throw new Error(
          "This email address is already in use. Please use a different one."
        );
      }
    }
    // If it's another type of error, log it and throw a generic message
    // to avoid exposing internal details to the client.
    console.error("Error during user signup:", error);
    throw new Error("Failed to create user. Please try again later.");
  }
}

// Now let handle the login::
export async function loginUser(credentials: LoginSchema) {
  console.log(`Attempting to log in user with email: ${credentials.email}`);

  // first i need to find if we have the user email in my db::
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  //// If  user !found, throw an error::.
  if (!user) {
    console.warn(
      `Login failed: User not found for email: ${credentials.email}`
    );
    throw new Error("Invalid email or password.");
  }

  // i need to compare the plaintext password with the hashed from the db:
  const isPasswordValid = await comparePasswords(
    credentials.password,
    user.password
  );

  //// If the passwords don't match, throw an error::
  if (!isPasswordValid) {
    console.warn(
      `Login failed: Invalid password for email: ${credentials.email}`
    );
    throw new Error("Invalid email or password.");
  }

  // incase the no issue:
  console.log(`User logged in successfully: ${user.email}`);

  //// The password is not included in the returned object.
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
}
