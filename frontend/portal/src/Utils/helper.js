// Validation functions

export const validateEmail = (email) => {
  if (!email.trim()) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/\d/.test(password))
    return "Password must contain at least one number";
  return "";
};

export const validateAvatar = (file) => {
  if (!file) return ""; // Avatar is optional

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

  if (!allowedTypes.includes(file.type)) {
    return "Avatar must be a JPG or PNG file";
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return "Avatar must be less than 5MB";
  }

  return "";
};
