import { apiGet, apiPost, apiPut } from "./api/client";
import { API } from "../constants/api";
import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  InviteStaffRequest,
  InviteStaffResponse,
  RegisterStaffRequest,
  RegisterStaffResponse,
  StaffListResponse,
  BlockStaffRequest,
  BlockStaffResponse,
} from "../types/auth";

export async function registerUser(
  userData: Omit<RegisterRequest, "role">,
): Promise<RegisterResponse> {
  return apiPost<RegisterResponse>(API.account.register, userData);
}

export async function loginUser(
  userData: LoginRequest,
): Promise<LoginResponse> {
  return apiPost<LoginResponse>(API.account.login, userData);
}

export async function forgotPassword(
  userData: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  return apiPost<ForgotPasswordResponse>(API.account.forgetPassword, userData);
}

export async function resetPassword(
  userData: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  return apiPost<ResetPasswordResponse>(API.account.resetPassword, userData);
}

export async function verifyEmail(
  userData: VerifyEmailRequest,
): Promise<VerifyEmailResponse> {
  return apiPost<VerifyEmailResponse>(API.account.verifyEmail, userData);
}

export async function resendOtp(
  userData: ResendOtpRequest,
): Promise<ResendOtpResponse> {
  return apiPost<ResendOtpResponse>(API.account.resendOtp, userData);
}

export async function refreshToken(
  userData: RefreshTokenRequest,
): Promise<RefreshTokenResponse> {
  return apiPost<RefreshTokenResponse>(API.account.refresh, userData);
}

export async function changePassword(
  userData: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
  return apiPost<ChangePasswordResponse>(API.account.changePassword, userData);
}

export async function inviteStaff(payload: InviteStaffRequest): Promise<InviteStaffResponse> {
  return apiPost<InviteStaffResponse>(API.account.inviteStaff, payload);
}

export async function registerStaff(payload: RegisterStaffRequest): Promise<RegisterStaffResponse> {
  return apiPost<RegisterStaffResponse>(API.account.registerStaff, payload);
}

export async function getStaffMembers(): Promise<StaffListResponse> {
  return apiGet<StaffListResponse>(API.account.staffList);
}

export async function blockStaffMember(payload: BlockStaffRequest): Promise<BlockStaffResponse> {
  return apiPut<BlockStaffResponse>(API.account.blockStaff, payload);
}
