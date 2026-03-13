type HeadersLike = {
  get(name: string): string | null;
};

const DEFAULT_ALLOWED_IP_HASHES = [
  "fa8108dc82027d57f02afdbb95129071595c31c36d193787d7fddaf9de505254",
];
const DEFAULT_ADMIN_EMAIL_HASHES = [
  "f76cf3ae39b549e8e794174eb4ff9f6241efb02cee4ca4323d8c6e13b1d8e5c0",
];
const LOCAL_IPS = new Set(["127.0.0.1", "localhost"]);

function splitCsv(raw: string | undefined) {
  return (raw ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function normalizeIp(ip: string) {
  const trimmed = ip.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("::ffff:")) {
    return trimmed.slice("::ffff:".length);
  }
  if (trimmed === "::1") {
    return "127.0.0.1";
  }
  return trimmed;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
}

async function resolveAllowedHashes({
  rawValues,
  rawHashValues,
  normalize,
  defaultHashes,
}: {
  rawValues?: string;
  rawHashValues?: string;
  normalize: (value: string) => string;
  defaultHashes: string[];
}) {
  const configuredHashes = splitCsv(rawHashValues).map((value) => value.toLowerCase());
  if (configuredHashes.length > 0) {
    return new Set(configuredHashes);
  }

  const configuredValues = splitCsv(rawValues).map(normalize).filter(Boolean);
  if (configuredValues.length > 0) {
    return new Set(await Promise.all(configuredValues.map((value) => sha256Hex(value))));
  }

  return new Set(defaultHashes);
}

export function getRequestIp(headersLike: HeadersLike) {
  const forwardedFor = headersLike.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0];
    return normalizeIp(first);
  }

  const realIp = headersLike.get("x-real-ip");
  if (realIp) {
    return normalizeIp(realIp);
  }

  return "";
}

async function hasIpHashAccess(
  requestIp: string,
  {
    rawValues,
    rawHashValues,
    defaultHashes,
  }: {
    rawValues?: string;
    rawHashValues?: string;
    defaultHashes: string[];
  }
) {
  if (!requestIp) {
    return false;
  }

  if (process.env.NODE_ENV !== "production" && LOCAL_IPS.has(requestIp)) {
    return true;
  }

  const allowedHashes = await resolveAllowedHashes({
    rawValues,
    rawHashValues,
    normalize: normalizeIp,
    defaultHashes,
  });

  return allowedHashes.has(await sha256Hex(requestIp));
}

export async function hasDevSiteAccess(headersLike: HeadersLike) {
  const requestIp = getRequestIp(headersLike);
  return hasIpHashAccess(requestIp, {
    rawValues: process.env.DEV_ALLOWED_IPS ?? process.env.ADMIN_ALLOWED_IPS,
    rawHashValues:
      process.env.DEV_ALLOWED_IP_HASHES ?? process.env.ADMIN_ALLOWED_IP_HASHES,
    defaultHashes: DEFAULT_ALLOWED_IP_HASHES,
  });
}

export async function hasAdminIpAccess(headersLike: HeadersLike) {
  const requestIp = getRequestIp(headersLike);
  return hasIpHashAccess(requestIp, {
    rawValues: process.env.ADMIN_ALLOWED_IPS ?? process.env.DEV_ALLOWED_IPS,
    rawHashValues:
      process.env.ADMIN_ALLOWED_IP_HASHES ?? process.env.DEV_ALLOWED_IP_HASHES,
    defaultHashes: DEFAULT_ALLOWED_IP_HASHES,
  });
}

export async function hasAdminEmailAccess(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  const allowedHashes = await resolveAllowedHashes({
    rawValues: process.env.ADMIN_EMAILS,
    rawHashValues: process.env.ADMIN_EMAIL_HASHES,
    normalize: normalizeEmail,
    defaultHashes: DEFAULT_ADMIN_EMAIL_HASHES,
  });

  return allowedHashes.has(await sha256Hex(normalizeEmail(email)));
}

export async function hasAdminAccess(
  headersLike: HeadersLike,
  email: string | null | undefined
) {
  const [hasIpAccess, hasEmailAccess] = await Promise.all([
    hasAdminIpAccess(headersLike),
    hasAdminEmailAccess(email),
  ]);

  return hasIpAccess && hasEmailAccess;
}
