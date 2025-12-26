import { Request, Response } from "express";

export const uploadFileResponse = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Tidak ada file yang diupload." });
    }

    // URL untuk akses file (Multer sudah menyimpan file ke folder public/uploads)
    const fileUrl = `/uploads/${req.file.filename}`;

    return res.json({ url: fileUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).json({ error: "Terjadi kesalahan saat mengupload file." });
  }
};