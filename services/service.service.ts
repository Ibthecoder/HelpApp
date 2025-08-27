import prisma from "@/lib/prisma";
import { CreateServiceTypeSchema } from "@/schemas/service.schema";

export async function getAllServices() {
  return prisma.serviceType.findMany({
    include: {
      services: {
        include: {
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

export async function createServiceType(data: CreateServiceTypeSchema) {
  try {
    const newServiceType = await prisma.serviceType.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
    return newServiceType;
  } catch (error) {
    // Handle unique constraint violation for service type name
    if (error.code === 'P2002' && error.meta?.target?.includes('name')) {
      throw new Error(`Service type with name '${data.name}' already exists.`);
    }
    throw error; // Re-throw other errors
  }
}
