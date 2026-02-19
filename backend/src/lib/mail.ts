import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${process.env.FRONTEND_URL}/auth/verify?token=${token}`;

  await resend.emails.send({
    from: 'Panganku Fresh <no-reply@pangankufresh.com>', // Gunakan domain terverifikasi jika sudah ada
    to: email,
    subject: 'Verifikasi Akun Panganku Fresh',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #22c55e;">Halo dari Panganku Fresh!</h2>
        <p>Terima kasih telah mendaftar. Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda:</p>
        <a href="${confirmLink}" style="display: inline-block; background-color: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Verifikasi Email</a>
        <p style="margin-top: 20px; font-size: 12px; color: #888;">Jika Anda tidak merasa mendaftar di platform kami, silakan abaikan email ini.</p>
        <hr />
        <p style="font-size: 10px; color: #bbb;">Link ini akan kedaluwarsa dalam 1 jam.</p>
      </div>
    `
  });
};