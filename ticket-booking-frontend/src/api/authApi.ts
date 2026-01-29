import { api } from "./axios";

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export const login = (data: LoginRequest) =>
  api.post("/auth/login", data);

export const register = (data: RegisterRequest) =>
  api.post("/auth/register", data);
