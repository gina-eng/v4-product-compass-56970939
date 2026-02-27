export const ALLOWED_EMAIL_DOMAIN = "v4company.com";
export const LOCAL_PREVIEW_EMAIL = "preview@localhost";
const LOCAL_PREVIEW_AUTH_KEY = "v4_local_preview_auth";

export const isAllowedV4Email = (email?: string | null): boolean => {
  if (!email) return false;

  return email.trim().toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
};

export const isLocalPreviewAuthEnabled = (): boolean => {
  if (!import.meta.env.DEV) return false;
  return window.localStorage.getItem(LOCAL_PREVIEW_AUTH_KEY) === "1";
};

export const enableLocalPreviewAuth = () => {
  if (!import.meta.env.DEV) return;
  window.localStorage.setItem(LOCAL_PREVIEW_AUTH_KEY, "1");
};

export const disableLocalPreviewAuth = () => {
  window.localStorage.removeItem(LOCAL_PREVIEW_AUTH_KEY);
};
