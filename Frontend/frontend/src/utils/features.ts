// Feature flags (set in .env, e.g. VITE_ENABLE_LOGIN_OTP=true).
// Keep a flag off until the matching API endpoint exists, so users never hit a 404.
const flag = (value: unknown) => String(value ?? "").toLowerCase() === "true";

export const FEATURES = {
  // needs POST /api/auth/request-login-otp and /api/auth/verify-login-otp
  loginOtp: flag(import.meta.env.VITE_ENABLE_LOGIN_OTP),
} as const;
