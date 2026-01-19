import { Response } from "express";
import { prisma } from "../../../../lib/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import { checkDeliveryRange } from "./location";

// GET Fetch All Addresses
export const getAddresses = async (req: AuthRequest, res: Response) => {
    try {
        const addresses = await prisma.address.findMany({
            where: { userId: req.user!.id },
        });
        return res.status(200).json(addresses);
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch address", error });
    }
};

// POST Add New Address
export const addAddress = async (req: AuthRequest, res: Response) => {
    try {
        const { label, fullAddress, recipientName, phoneNumber, note, isPrimary } = req.body;
        console.log('req body: ', req.body)

        // Validasi Input
        if (!recipientName || !phoneNumber || !fullAddress ) {
            return res.status(400).json({
                message: "Nama penerima, No Telepon, dan Alamat harus diisi"
            });
        }
        
        // Validasi Format Telepon
        const phoneRegex = /^[\d+\-\s()]+$/;
        if (!phoneRegex.test(phoneNumber)) {
            return res.status(400).json({ message: "Nomor telepon harus berupa angka." });
        }

        // Alamat Utama
        if (isPrimary) {
            const existingPrimaryAddress = await prisma.address.findFirst({
                where: {
                    userId: req.user!.id,
                    isPrimary: true,
                },
            });

            if (existingPrimaryAddress) {
                return res.status(400).json({
                    message: "Anda sudah memiliki alamat utama. Tolong hapus alamat utama saat ini terlebih dahulu."
                });
            }
        }
        
        // 4. Create ke Database
        const addressPayload = {
            userId: req.user!.id,
            recipientName,
            phoneNumber,
            label,
            fullAddress,
            note,
            isPrimary: isPrimary || false,
        }
        console.log('address to db: ', addressPayload)

        const newAddress = await prisma.address.create({
            data: addressPayload,
        });

        return res.status(201).json(newAddress);
    } catch (error) {
        return res.status(500).json({ message: "Failed to add address", error });
    }
};