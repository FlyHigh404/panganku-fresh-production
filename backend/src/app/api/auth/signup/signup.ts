import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// const JWT_SECRET = process.env.NEXTAUTH_SECRET as string;

export const signUp = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: 'Data tidak lengkap' });

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: 'User sudah terdaftar' });

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                emailVerified: new Date(),
                image: '/polar-bear.png'
            }
        });

        return res.status(201).json({ message: 'User created successfully', user: { id: user.id, email: user.email } });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

// export const login = async (req: Request, res: Response) => {
//     try {
//         const { email, password } = req.body;
//         const user = await prisma.user.findUnique({ where: { email } });

//         if (!user || !user.password) return res.status(401).json({ error: "User tidak ditemukan" });

//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(401).json({ error: "Password salah" });

//         const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

//         return res.json({
//             user: { id: user.id, name: user.name, email: user.email, role: user.role },
//             token
//         });
//     } catch (error) {
//         res.status(500).json({ error: "Login failed" });
//     }
// };

// import { NextRequest, NextResponse } from 'next/server'
// import bcrypt from 'bcryptjs'
// import { prisma } from "@/lib/prisma"

// export async function POST(request: NextRequest) {
//   try {
//     const { name, email, password } = await request.json()

//     if (!name || !email || !password) {
//       return NextResponse.json(
//         { error: 'Name, email, and password are required' },
//         { status: 400 }
//       )
//     }

//     // Check if user already exists
//     const existingUser = await prisma.user.findUnique({
//       where: { email }
//     })

//     if (existingUser) {
//       return NextResponse.json(
//         { error: 'User already exists' },
//         { status: 400 }
//       )
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 12)

//     // Create user
//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//         emailVerified: new Date(), // Auto verify for now
//         image: '/polar-bear.png'
//       }
//     })

//     return NextResponse.json(
//       { message: 'User created successfully', user: { id: user.id, email: user.email } },
//       { status: 201 }
//     )

//   } catch (error) {
//     console.error('Signup error:', error)
//     return NextResponse.json(
//       { error: 'Internal server error' },
//       { status: 500 }
//     )
//   }
// }