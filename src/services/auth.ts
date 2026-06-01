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

const USE_MOCK_MODE = import.meta.env.VITE_USE_MOCK_MODE === "true";
const MOCK_STATUS_CODE = 200;

export async function registerUser(
  userData: Omit<RegisterRequest, "role">,
): Promise<RegisterResponse> {
  if (USE_MOCK_MODE) {
    // Mock registration requiring email confirmation
    await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

    return {
      statusCode: MOCK_STATUS_CODE,
      meta: "mock",
      succeeded: true,
      message:
        "Registration successful! Please check your email to confirm your account.",
      errors: [],
      data: userData.email,
    };
  }

  const requestData: RegisterRequest = {
    ...userData,
  };

  return apiPost<RegisterResponse>(API.account.register, requestData);
}

export async function loginUser(
  userData: LoginRequest,
): Promise<LoginResponse> {
  if (USE_MOCK_MODE) {
    // Mock successful login for testing

    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

    // Simple mock validation - in real app this would be handled by backend
    if (
      userData.email === "test@example.com" &&
      userData.password === "password"
    ) {
      return {
        statusCode: MOCK_STATUS_CODE,
        meta: "mock",
        succeeded: true,
        message: "Login successful",
        errors: [],
        data: {
          email: userData.email || "test@example.com",
          displayName: "Test User",
          token: "mock-jwt-token-" + Date.now(),
          refreshToken: "mock-refresh-token",
        },
      };
    } else {
      throw new Error("Invalid email or password");
    }
  }

  return apiPost<LoginResponse>(API.account.login, userData);
}

export async function forgotPassword(
  userData: ForgotPasswordRequest,
): Promise<ForgotPasswordResponse> {
  if (USE_MOCK_MODE) {
    // Mock successful password reset for testing
    console.log("MOCK MODE: Simulating password reset with data:", userData);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

    return {
      statusCode: MOCK_STATUS_CODE,
      meta: "mock",
      succeeded: true,
      message: "Password reset link sent to your email",
      errors: [],
      data: userData.email,
    };
  }

  return apiPost<ForgotPasswordResponse>(API.account.forgetPassword, userData);
}

export async function resetPassword(
  userData: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  if (USE_MOCK_MODE) {
    // Mock successful password reset for testing
    console.log("MOCK MODE: Simulating password reset with data:", userData);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate network delay

    // Simple mock validation - in real app this would be handled by backend
    if (userData.token === "valid-token") {
      return {
        statusCode: MOCK_STATUS_CODE,
        meta: "mock",
        succeeded: true,
        message: "Password reset successful",
        errors: [],
        data: userData.email,
      };
    } else {
      throw new Error("Invalid or expired reset token");
    }
  }

  return apiPost<ResetPasswordResponse>(API.account.resetPassword, userData);
}

export async function verifyEmail(
  userData: VerifyEmailRequest,
): Promise<VerifyEmailResponse> {
  if (USE_MOCK_MODE) {
    console.log(
      "MOCK MODE: Simulating email verification with data:",
      userData,
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      statusCode: MOCK_STATUS_CODE,
      meta: "mock",
      succeeded: true,
      message: "Email verified successfully! You can now log in.",
      errors: [],
      data: {
        email: userData.email,
        displayName: "Mock User",
        token: "mock-token-" + Date.now(),
        refreshToken: "mock-refresh-token",
      },
    };
  }

  return apiPost<VerifyEmailResponse>(API.account.verifyEmail, userData);
}

export async function resendOtp(
  userData: ResendOtpRequest,
): Promise<ResendOtpResponse> {
  if (USE_MOCK_MODE) {
    console.log("MOCK MODE: Simulating resend OTP with data:", userData);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      statusCode: MOCK_STATUS_CODE,
      meta: "mock",
      succeeded: true,
      message: "New verification code sent to your email!",
      errors: [],
      data: userData.email,
    };
  }

  return apiPost<ResendOtpResponse>(API.account.resendOtp, userData);
}

export async function refreshToken(
  userData: RefreshTokenRequest,
): Promise<RefreshTokenResponse> {
  if (USE_MOCK_MODE) {
    console.log("MOCK MODE: Simulating token refresh with data:", userData);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock token refresh - in real app this would validate the refresh token
    if (
      userData.refreshToken &&
      userData.refreshToken.startsWith("mock-refresh-token")
    ) {
      return {
        statusCode: MOCK_STATUS_CODE,
        meta: "mock",
        succeeded: true,
        message: "Token refreshed successfully",
        errors: [],
        data: {
          email: "test@example.com",
          displayName: "Test User",
          token: "new-access-token-" + Date.now(),
          refreshToken: "new-refresh-token-" + Date.now(),
        },
      };
    } else {
      throw new Error("Invalid refresh token");
    }
  }

  return apiPost<RefreshTokenResponse>(API.account.refresh, userData);
}

export async function changePassword(
  userData: ChangePasswordRequest,
): Promise<ChangePasswordResponse> {
  if (USE_MOCK_MODE) {
    console.log("MOCK MODE: Simulating password change with data:", userData);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock password change - in real app this would validate current password
    if (userData.currentPassword === "correct-current-password") {
      // Validate new password matches confirmation
      if (userData.newPassword !== userData.confirmPassword) {
        return {
          statusCode: 400,
          meta: "mock",
          succeeded: false,
          message: "New password and confirmation do not match",
          errors: ["New password and confirmation do not match"],
          data: "",
        };
      }

      // Validate password strength (same rules as registration)
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(userData.newPassword)) {
        return {
          statusCode: 400,
          meta: "mock",
          succeeded: false,
          message:
            "New password must be at least 8 characters with uppercase, lowercase, number, and special character",
          errors: [
            "New password must be at least 8 characters with uppercase, lowercase, number, and special character",
          ],
          data: "",
        };
      }

      return {
        statusCode: MOCK_STATUS_CODE,
        meta: "mock",
        succeeded: true,
        message: "Password changed successfully",
        errors: [],
        data: "Password changed successfully",
      };
    } else {
      return {
        statusCode: 400,
        meta: "mock",
        succeeded: false,
        message: "Current password is incorrect",
        errors: ["Current password is incorrect"],
        data: "",
      };
    }
  }

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
