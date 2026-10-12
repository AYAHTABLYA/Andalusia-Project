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

export const login = async (data: LoginRequest) => {
  const response = await axiosInstance.post("/api/auth/login", data);
  return response.data;
};

export const register = async (data: RegisterRequest) => {
  const response = await axiosInstance.post("/api/auth/register", data);
  return response.data;
};
