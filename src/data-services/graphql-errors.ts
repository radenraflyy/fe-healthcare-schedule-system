export function safeGraphQLError(
  message?: string,
  code?: string,
  status?: number,
  rateLimit?: { limit?: number; retryAfterSeconds?: number },
): string {
  if (code === 'CONFLICT')
    return message?.toLowerCase().includes('slot') || message?.toLowerCase().includes('waktu')
      ? 'Slot ini baru saja terisi. Silakan pilih slot lain.'
      : safeBackendMessage(message) || 'Data berubah. Muat ulang lalu coba lagi.';
  if (code === 'UNAUTHENTICATED') return 'Sesi Anda telah berakhir. Silakan masuk kembali.';
  if (code === 'INVALID_CREDENTIALS')
    return (
      safeBackendMessage(message) || 'Email atau password salah. Periksa kembali lalu coba lagi.'
    );
  if (code === 'FORBIDDEN') return 'Akun Anda tidak memiliki izin untuk melakukan tindakan ini.';
  if (code === 'TOO_MANY_REQUESTS') {
    const limitText = rateLimit?.limit ? ` Batas ${rateLimit.limit} percobaan.` : '';
    const retryText =
      rateLimit?.retryAfterSeconds && rateLimit.retryAfterSeconds > 0
        ? ` Coba lagi dalam ${formatRetryDuration(rateLimit.retryAfterSeconds)}.`
        : ' Tunggu sebentar lalu coba lagi.';
    return `Terlalu banyak percobaan login.${limitText}${retryText}`;
  }
  if (code === 'SERVICE_UNAVAILABLE' || status === 502 || status === 503)
    return 'Layanan sedang tidak tersedia. Coba lagi sebentar.';
  if (code === 'INTERNAL_SERVER_ERROR')
    return 'Terjadi kendala pada server. Silakan coba lagi sebentar.';
  if (code === 'BAD_USER_INPUT' || code === 'NOT_FOUND')
    return safeBackendMessage(message) || 'Data belum dapat ditemukan atau tidak valid.';
  return 'Permintaan belum berhasil. Periksa data Anda lalu coba lagi.';
}

function formatRetryDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} detik`;
  if (seconds === 0) return `${minutes} menit`;
  return `${minutes} menit ${seconds} detik`;
}

function safeBackendMessage(message?: string) {
  const value = message?.trim();
  return value &&
    value.length < 180 &&
    !/stack| at |\.ts:\d|\.js:\d|token|bearer|prisma|sql|database|exception/i.test(value)
    ? value
    : null;
}
