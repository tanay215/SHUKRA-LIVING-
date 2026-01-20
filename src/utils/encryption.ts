export const encrypt = (text: string): string => {
  return btoa(text);
};

export const decrypt = (ciphertext: string): string => {
  return atob(ciphertext);
};

export const hashPassword = (password: string): string => {
  return btoa(password + 'shukra_salt');
};

export const generateOTP = (): string => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

export const generateUserId = (firstName: string, lastName: string): string => {
  const timestamp = Date.now().toString().slice(-4);
  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  return `${initials}${timestamp}${Math.floor(Math.random() * 100)}`;
};