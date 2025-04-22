import { createClient } from '@supabase/supabase-js';

// Create a Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

/**
 * Request a password reset email
 * @param {string} email - User's email address
 * @returns {Promise<{error: Error|null}>}
 */
export const requestPasswordReset = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.REACT_APP_CLIENT_URL}/reset-password`
    });

    return { error };
  } catch (error) {
    return { error };
  }
};

/**
 * Verify a password reset token
 * @param {string} token - The reset token from the URL
 * @returns {Promise<{error: Error|null}>}
 */
export const verifyResetToken = async (token) => {
  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery'
    });

    return { error };
  } catch (error) {
    return { error };
  }
};

/**
 * Update user's password
 * @param {string} password - New password
 * @returns {Promise<{error: Error|null}>}
 */
export const updatePassword = async (password) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password
    });

    return { error };
  } catch (error) {
    return { error };
  }
}; 