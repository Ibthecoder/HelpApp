import prisma from "./lib/prisma";
import { Role } from "@prisma/client";

async function createTestService() {
  try {
    // Find the provider user
    const provider = await prisma.user.findUnique({
      where: { email: "provider@example.com", role: Role.PROVIDER },
    });

    if (!provider) {
      console.error("Provider user not found. Please create 'provider@example.com' first.");
      return;
    }

    // Find the ServiceType (e.g., Plumbing)
    const serviceType = await prisma.serviceType.findUnique({
      where: { name: "Plumbing" },
    });

    if (!serviceType) {
      console.error("ServiceType 'Plumbing' not found. Please create it first.");
      return;
    }

    const service = await prisma.service.create({
      data: {
        title: "Basic Plumbing Fix",
        description: "Fixing minor plumbing issues.",
        price: 50.00,
        providerId: provider.id,
        serviceTypeId: serviceType.id,
      },
    });
    console.log("Test Service created:", service);
  } catch (e) {
    console.error("Error creating test service:", e);
  } finally {
    await prisma.$disconnect();
  }
}

createTestService();
