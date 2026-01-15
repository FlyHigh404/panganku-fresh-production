"use client";

import { useState } from "react";

interface Review {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string;
    image?: string | null;
  };
  reply?: string | null;
  replyBy?: string | null;
  admin?: {
    name: string;
    role?: string;
  } | null;
}

interface ReviewSectionProps {
  reviews: Review[];
  userRole?: string; 
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ reviews, userRole }) => {
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localReviews, setLocalReviews] = useState(reviews);

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Get default profile image
  const getProfileImage = (image: string | null | undefined) => {
    return image || "/default-avatar.png";
  };

  // Handle reply submission
  const handleSubmitReply = async (reviewId: string) => {
    const token = localStorage.getItem('token');
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/app/api/admin/reply-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reviewId,
          replyText: replyText.trim(),
        }),
      });

      if (response.ok) {
        const updatedReview = await response.json();
        
        // Update local state dengan reply baru
        setLocalReviews(prevReviews =>
          prevReviews.map(review =>
            review.id === reviewId
              ? {
                  ...review,
                  reply: updatedReview.reply,
                  replyBy: updatedReview.replyBy,
                  admin: updatedReview.admin || { name: "Admin", role: "ADMIN" }
                }
              : review
          )
        );

        // Reset form
        setReplyText("");
        setReplyingReviewId(null);
      } else {
        const errorData = await response.json();
        alert(`Gagal mengirim balasan: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Terjadi kesalahan saat mengirim balasan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel reply
  const handleCancelReply = () => {
    setReplyText("");
    setReplyingReviewId(null);
  };

  return (
    <div className="bg-white rounded-xl shadow-[6px_6px_54px_0_rgba(0,0,0,0.05)] p-6 mt-8">
      {localReviews.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-[#6D706E] font-['Plus Jakarta Sans'] text-[16px] font-semibold">
            Belum ada ulasan untuk produk ini
          </p>
        </div>
      ) : (
        localReviews.map((item, index) => (
          <div key={item.id} className="pb-6">
            {/* Header user */}
            <div className="flex items-start gap-4">
              {/* Foto profil */}
              <div
                className="w-[41.916px] h-[41.916px] rounded-full bg-gray-200 flex-shrink-0 overflow-hidden"
                style={{
                  backgroundImage: `url(${getProfileImage(item.user.image)})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>

              <div className="flex flex-col w-full">
                {/* Nama & tanggal */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-[#16151C] font-['Plus Jakarta Sans'] text-[18px] font-medium">
                    {item.user.name}
                  </h3>
                  <span className="text-[#6D706E] text-[10px] font-['Plus Jakarta Sans'] font-medium mt-1 sm:mt-0">
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                {/* Isi ulasan */}
                <p className="text-[#6D706E] font-['Plus Jakarta Sans'] text-[14px] font-semibold mt-2">
                  {item.content}
                </p>

                {/* Form Reply untuk ADMIN */}
                {userRole === "ADMIN" && !item.reply && (
                  <div className="mt-4">
                    {replyingReviewId === item.id ? (
                      // Form reply aktif
                      <div className="bg-[#F7F7F7] rounded-md p-4">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Tulis balasan Anda..."
                          className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-[#26A81D] focus:border-transparent"
                          rows={3}
                          disabled={isSubmitting}
                        />
                        <div className="flex justify-end gap-2 mt-3">
                          <button
                            onClick={handleCancelReply}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => handleSubmitReply(item.id)}
                            disabled={isSubmitting || !replyText.trim()}
                            className="px-4 py-2 text-sm text-white bg-[#26A81D] rounded-md hover:bg-[#1f8c17] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? "Mengirim..." : "Kirim Balasan"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Tombol untuk membuka form reply
                      <button
                        onClick={() => setReplyingReviewId(item.id)}
                        className="px-4 py-2 text-sm text-white bg-[#26A81D] rounded-md hover:bg-[#1f8c17] transition-colors"
                      >
                        Balas Ulasan
                      </button>
                    )}
                  </div>
                )}

                {/* Balasan admin yang sudah ada */}
                {item.reply && (
                  <div className="mt-4 bg-[#F7F7F7] rounded-md p-4 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-[#16151C] font-['Plus Jakarta Sans'] text-[14px] font-semibold">
                          {item.admin?.name || "Admin"}
                        </span>
                        <span className="bg-[#E6F3E6] text-[#26A81D] text-xs px-2 py-[2px] rounded-md font-medium">
                          {item.admin?.role || "Admin"}
                        </span>
                      </div>
                      <span className="text-[#6D706E] text-[10px] font-['Plus Jakarta Sans'] font-medium">
                        {item.replyBy ? formatDate(item.replyBy) : "Baru saja"}
                      </span>
                    </div>
                    <p className="text-[#6D706E] text-[13px] leading-snug">
                      {item.reply}
                    </p>
                    
                    {/* Tombol Edit Reply untuk ADMIN */}
                    {userRole === "ADMIN" && (
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => {
                            setReplyingReviewId(item.id);
                            setReplyText(item.reply || "");
                          }}
                          className="px-3 py-1 text-xs text-[#26A81D] border border-[#26A81D] rounded-md hover:bg-[#E6F3E6] transition-colors"
                        >
                          Edit Balasan
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Garis pemisah */}
            {index !== localReviews.length - 1 && (
              <div className="w-full h-[1px] bg-[#E5E5E5] mt-6 mx-auto"></div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewSection;