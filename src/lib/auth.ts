export const ALLOWED_EMAIL_DOMAIN = "v4company.com";

export const isAllowedV4Email = (email?: string | null): boolean => {
  if (!email) return false;

  return email.trim().toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
};
