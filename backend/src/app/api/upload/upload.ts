import { supabase } from '../../../lib/supabase';

export const uploadFileResponse = async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const file = req.file;
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `profiles/${fileName}`;

    const { data, error } = await supabase.storage
      .from('ProfilePage_Bucket')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('ProfilePage_Bucket')
      .getPublicUrl(filePath);

    return res.json({ url: publicUrl });

  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

// export const uploadFileResponse = (req: Request, res: Response) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "Tidak ada file yang diupload." });
//     }

//     // URL untuk akses file (Multer sudah menyimpan file ke folder public/uploads)
//     const fileUrl = `${process.env.NEXTAUTH_URL}/uploads/${req.file.filename}`;

//     return res.json({ url: fileUrl });
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     return res.status(500).json({ error: "Terjadi kesalahan saat mengupload file." });
//   }
// };