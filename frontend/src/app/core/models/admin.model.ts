export interface Admin {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  admin: Admin;
}
