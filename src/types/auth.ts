import type { ApiResponse } from './common';

export interface RegisterRequest {
  confirmPassword: string;
  displayName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  email: string;
  displayName: string;
  token: string;
  refreshToken: string;
}

export type RegisterResponse = ApiResponse<string>;
export type LoginResponse = ApiResponse<AuthTokens>;

export interface ForgotPasswordRequest {
  email: string;
}

export type ForgotPasswordResponse = ApiResponse<string>;

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export type ResetPasswordResponse = ApiResponse<string>;

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export type VerifyEmailResponse = ApiResponse<AuthTokens>;

export interface ResendOtpRequest {
  email: string;
}

export type ResendOtpResponse = ApiResponse<string>;

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export type RefreshTokenResponse = ApiResponse<AuthTokens>;

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type ChangePasswordResponse = ApiResponse<string>;

export interface InviteStaffRequest {
  email: string;
}

export interface RegisterStaffRequest {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  code: string;
}

export interface BlockStaffRequest {
  staffId: string;
}

export interface StaffMember {
  email?: string;
  phoneNumber?: string;
  userName?: string;
  displayName?: string;
}

export type InviteStaffResponse = ApiResponse<string>;
export type RegisterStaffResponse = ApiResponse<string>;
export type StaffListResponse = ApiResponse<StaffMember[]>;
export type BlockStaffResponse = ApiResponse<string>;



