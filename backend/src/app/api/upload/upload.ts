import { Request, Response, Express } from "express";
import path from "path";

export const uploadFileResponse = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Tidak ada file yang diupload." });
    }

    // URL untuk akses file (Multer sudah menyimpan file ke folder public/uploads)
    const fileUrl = `${process.env.BACKEND_URL}/uploads/${req.file.filename}`;

    return res.json({ url: fileUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ error: "Terjadi kesalahan saat mengupload file." });
  }
};