import axiosInstance from "./axiosInstance";
import { saveSession } from "../utils/session";

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest {
  firstName: string; lastName: string; email: string; mobileNumber: string;
  password: string; campusId?: number | null;
}
export interface OtpRequest { email: string; }
export interface OtpVerifyRequest { email: string; code: string; }
export interface ResetPasswordRequest { email: string; token: string; newPassword: string; }

export const login = async (data: LoginRequest) => (await axiosInstance.post("/api/auth/login", data)).data;
export const register = async (data: RegisterRequest) => (await axiosInstance.post("/api/auth/register", data)).data;
export const confirmEmail = async (data: { email: string; token: string }) =>
  (await axiosInstance.post("/api/auth/confirm-email", data)).data;
export const resendConfirmation = async (data: OtpRequest) =>
  (await axiosInstance.post("/api/auth/resend-confirmation", data)).data;
export const requestLoginOtp = async (data: OtpRequest) =>
  (await axiosInstance.post("/api/auth/request-login-otp", data)).data;
export const verifyLoginOtp = async (data: OtpVerifyRequest) =>
  (await axiosInstance.post("/api/auth/verify-login-otp", data)).data;
export const forgotPassword = async (data: OtpRequest) =>
  (await axiosInstance.post("/api/auth/forgot-password", data)).data;
export const resetPassword = async (data: ResetPasswordRequest) =>
  (await axiosInstance.post("/api/auth/reset-password", data)).data;

// Stores { id, name, email, role } + the token, the shape utils/session.ts reads back.
export const saveAuthenticatedSession = (response: any) => saveSession(response);
