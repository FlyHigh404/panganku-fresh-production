import { Router } from "express";
import multer from "multer";
import path from "path";
import { nanoid } from "nanoid";
import { uploadFileResponse } from "./upload";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Konfigurasi Penyimpanan Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads"); // Pastikan folder ini sudah ada
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const fileNameWithoutExt = path.parse(file.originalname).name;
    const uniqueFilename = `${fileNameWithoutExt}-${nanoid(8)}${fileExtension}`;
    cb(null, uniqueFilename);
  },
});

// Konfigurasi Filter & Limit
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Maksimal 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipe file tidak didukung. Hanya JPG, PNG, dan PDF yang diizinkan."));
    }
  },
});

// Route: /app/api/upload
// 'file' adalah nama field yang dikirim dari FormData frontend
router.post("/", authenticate, upload.single("file"), uploadFileResponse);

export default router;

// import { NextResponse } from "next/server";
// import { writeFile, mkdir } from "fs/promises";
// import { nanoid } from "nanoid";
// import path from "path";

// export async function POST(request: Request): Promise<NextResponse> {
//   try {
//     const formData = await request.formData();
//     const file = formData.get("file") as File;

//     if (!file) {
//       return NextResponse.json(
//         { error: "Tidak ada file yang diupload." },
//         { status: 400 }
//       );
//     }

//     const maxSize = 5 * 1024 * 1024;
//     if (file.size > maxSize) {
//       return NextResponse.json(
//         {
//           error: `File terlalu besar. Maksimal 5MB. Ukuran file: ${Math.round(
//             file.size / 1024 / 1024
//           )}MB`,
//         },
//         { status: 400 }
//       );
//     }

//     const allowedTypes = [
//       "image/jpeg",
//       "image/jpg",
//       "image/png",
//       "application/pdf",
//     ];
//     if (!allowedTypes.includes(file.type)) {
//       return NextResponse.json(
//         {
//           error:
//             "Tipe file tidak didukung. Hanya JPG, PNG, dan PDF yang diizinkan.",
//         },
//         { status: 400 }
//       );
//     }

//     // Konversi File ke Buffer
//     const bytes = await file.arrayBuffer();
//     const buffer = Buffer.from(bytes);

//     // Buat nama file unik
//     const fileExtension = file.name.split(".").pop();
//     const fileNameWithoutExt = file.name.split(".").slice(0, -1).join(".");
//     const uniqueFilename = `${fileNameWithoutExt}-${nanoid(8)}.${fileExtension}`;

//     // Path untuk menyimpan file
//     const uploadDir = path.join(process.cwd(), "public", "uploads");
//     const filePath = path.join(uploadDir, uniqueFilename);

//     // Buat folder jika belum ada
//     await mkdir(uploadDir, { recursive: true });

//     // Simpan file
//     await writeFile(filePath, buffer);

//     // URL untuk akses file
//     const fileUrl = `/uploads/${uniqueFilename}`;

//     return NextResponse.json({ url: fileUrl });
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     return NextResponse.json(
//       { error: "Terjadi kesalahan saat mengupload file." },
//       { status: 500 }
//     );
//   }
// }