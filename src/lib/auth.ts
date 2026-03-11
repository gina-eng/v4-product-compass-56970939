import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const ALLOWED_EMAIL_DOMAIN = "v4company.com";
export const LOCAL_PREVIEW_EMAIL = "preview@localhost";
const ALLOWED_LOGIN_EMAILS_TABLE = "allowed_login_emails" as const;
const LOCAL_PREVIEW_AUTH_KEY = "v4_local_preview_auth";
const AUTH_ZERO_MARK_ISO = "2026-02-27T20:40:21Z";
const AUTH_ZERO_MARK_MS = Date.parse(AUTH_ZERO_MARK_ISO);
export const AUTH_SESSION_MAX_AGE_MS = 6 * 60 * 60 * 1000;

const normalizeEmail = (email?: string | null) => email?.trim().toLowerCase() ?? "";

export const isAllowedV4Email = (email?: string | null): boolean => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;

  return normalizedEmail.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
};

export const isAllowedAppEmail = async (email?: string | null): Promise<boolean> => {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return false;
  if (isAllowedV4Email(normalizedEmail)) return true;

  const { data, error } = await supabase
    .from(ALLOWED_LOGIN_EMAILS_TABLE)
    .select("id")
    .eq("email", normalizedEmail)
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to validate login access list", error);
    return false;
  }

  return Boolean(data?.id);
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

const parseTimestamp = (value?: string | null): number => {
  if (!value) return NaN;
  return Date.parse(value);
};

const resolveSessionSignInTimestamp = (session: Session): number => {
  const signInMs = parseTimestamp(session.user.last_sign_in_at);
  if (Number.isFinite(signInMs)) return signInMs;

  const createdMs = parseTimestamp(session.user.created_at);
  if (Number.isFinite(createdMs)) return createdMs;

  return 0;
};

export const shouldForceSessionReauth = (session: Session, now = Date.now()): boolean => {
  const signInMs = resolveSessionSignInTimestamp(session);
  if (!signInMs) return true;
  if (signInMs < AUTH_ZERO_MARK_MS) return true;

  return now - signInMs >= AUTH_SESSION_MAX_AGE_MS;
};

export const getSessionRemainingMs = (session: Session, now = Date.now()): number => {
  const signInMs = resolveSessionSignInTimestamp(session);
  if (!signInMs || signInMs < AUTH_ZERO_MARK_MS) return 0;

  return Math.max(0, AUTH_SESSION_MAX_AGE_MS - (now - signInMs));
};
