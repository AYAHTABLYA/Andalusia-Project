import { apiPost } from "./academyApi";
import { saveSession } from "../utils/session";

export interface LoginRequest {
  email: string;
  password: string;
}
export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  password: string;
  campusId?: number | null;
}
export interface OtpRequest {
  email: string;
}
export interface ConfirmEmailRequest {
  email: string;
  otp: string;
}
export interface OtpVerifyRequest {
  email: string;
  code: string;
}
export interface ResetPasswordRequest {
  email: string;
  token: string; // the 6-digit code the user typed (sent to the API as `otp`)
  newPassword: string;
}

const post = <T = any>(url: string, body: unknown): Promise<T> => apiPost<T>(url, body);

export const login = (data: LoginRequest) => post("/api/auth/login", data);
export const register = (data: RegisterRequest) =>
  post("/api/auth/register", data);
export const confirmEmail = (data: ConfirmEmailRequest) =>
  post("/api/auth/confirm-email", data);
export const resendConfirmation = (data: OtpRequest) =>
  post("/api/auth/resend-confirmation", data);
export const requestLoginOtp = (data: OtpRequest) =>
  post("/api/auth/request-login-otp", data);
export const verifyLoginOtp = (data: OtpVerifyRequest) =>
  post("/api/auth/verify-login-otp", data);
export const forgotPassword = (data: OtpRequest) =>
  post("/api/auth/forgot-password", data);
export const resetPassword = (data: ResetPasswordRequest) =>
  post("/api/auth/reset-password", {
    email: data.email,
    otp: data.token,
    newPassword: data.newPassword,
  });

// Stores { id, name, email, role } + the token, the shape utils/session.ts reads back.
// Accepts the AuthResponseDto in camelCase or PascalCase and throws if there's no token.
export const saveAuthenticatedSession = (response: any) =>
  saveSession(response);
