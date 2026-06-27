import bcrypt from "bcrypt"
import envConfig from "../config/env.config.js";
import { prisma } from "./prisma.js";
import { Role } from "../generated/prisma/enums.js";

const seedDataToDB = async()=>{
    const adminEmail = envConfig.ADMIN_EMAIL ?? "admin@example.com";
    const adminPassword = envConfig.ADMIN_PASSWORD ?? "Admin@123";
    const adminName = envConfig.ADMIN_NAME ?? "Admin";

    const existingAdmin = await prisma.user.findUnique({
        where: {
        email: adminEmail,
        },
    });

    if (existingAdmin) {
        console.log("Admin already exists.");
        return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.create({
        data: {
            name: adminName,
            email: adminEmail,
            passwordHash: hashedPassword,   
            role: Role.ADMIN,
        },
    });

    console.log("Admin created successfully.");
    console.log({
        id: admin.id,
        email: admin.email,
        role: admin.role,
    });
}

export default seedDataToDB