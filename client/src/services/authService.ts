import { apiFetch } from './apiClient';

export interface UserAuthResponse {
  token: string;
  accessToken?: string;
  refreshToken?: string;
  user: {
    _id: string;
    userId: string;
    name: string;
    mobile: string;
    email?: string;
    role: 'STUDENT' | 'TEACHER' | 'ADMIN';
    referralCode: string;
    isMobileVerified?: boolean;
    isEmailVerified?: boolean;
    learningPreference?: {
      stateCode?: string;
      categoryCode?: string;
      subCategory?: string;
      subCategoryTitle?: string;
      stream?: string;
      boardOrGrade?: string;
      subjectName?: string;
      isPreferenceSet?: boolean;
    };
  };
}

export interface LoginInitResponse {
  requiresOtp?: boolean;
  email?: string;
  mobile?: string;
  userId?: string;
  role?: string;
  otpSimulated?: string;
  token?: string;
  user?: any;
}

/**
 * Register a new user account (Student, Teacher, or Admin)
 */
export const registerUser = async (payload: {
  name: string;
  mobile: string;
  password: string;
  email?: string;
  role?: 'STUDENT' | 'TEACHER' | 'ADMIN';
  stateCode?: string;
  referredBy?: string;
}) => {
  return apiFetch<{ userId: string; mobile: string; referralCode: string; otpSimulated?: string }>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(payload)
    }
  );
};

/**
 * Verify 6-digit SMS OTP code
 */
export const verifyOTP = async (mobile: string, otp: string) => {
  return apiFetch<UserAuthResponse>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ mobile, otp })
  });
};

/**
 * Verify 6-digit Email OTP code sent via Nodemailer
 */
export const verifyEmailOTP = async (email: string, otp: string) => {
  return apiFetch<UserAuthResponse>('/auth/verify-email-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp })
  });
};

/**
 * Authenticate via Email / Mobile / UserID + Password (Step 1 of Email OTP flow)
 */
export const loginUser = async (identifier: string, password: string) => {
  return apiFetch<LoginInitResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password })
  });
};

/**
 * Update 6-Level Student Learning Preference
 */
export const updateStudentLearningPreference = async (payload: {
  stateCode: string;
  categoryCode: string;
  subCategory: string;
  subCategoryTitle: string;
  stream?: string;
  boardOrGrade?: string;
  subjectName?: string;
}) => {
  return apiFetch<{ user: any }>('/auth/preference', {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
};
