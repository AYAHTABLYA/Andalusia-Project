import axiosInstance from "./axiosInstance";

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
export interface OtpVerifyRequest {
  email: string;
  code: string;
}
export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export const login = async (data: LoginRequest) =>
  (await axiosInstance.post("/api/auth/login", data)).data;
export const register = async (data: RegisterRequest) =>
  (await axiosInstance.post("/api/auth/register", data)).data;
export const confirmEmail = async (data: { email: string; otp: string }) =>
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
  (
    await axiosInstance.post("/api/auth/reset-password", {
      email: data.email,
      otp: data.token,
      newPassword: data.newPassword,
    })
  ).data;

export const saveAuthenticatedSession = (response: any) => {
  // AuthResponseDto returns UserId, FullName, Email, Role, Token and ExpiresAt at the root.
  // The shape saved here must match SessionUser in utils/session.ts ({ id, name, email, role }).
  const token = response.token ?? response.Token;
  if (!token) throw new Error("The API did not return an access token.");

  const user = {
    id: response.userId ?? response.UserId,
    name: response.fullName ?? response.FullName,
    email: response.email ?? response.Email,
    role: response.role ?? response.Role,
    expiresAt: response.expiresAt ?? response.ExpiresAt,
  };

  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("access_token", token);
};
