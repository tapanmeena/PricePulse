import { clearSession, getAccessToken, getSession, setAccessToken, setSession, setUser, type AuthUser } from "./session";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = RequestInit & {
  auth?: boolean;
  retry?: boolean;
};

interface AuthEnvelope {
  success?: boolean;
  message?: string;
  accessToken?: string;
  token?: string;
  accessTokenExpiresAt?: number;
  accessTokenExpiresIn?: number;
  expiresIn?: number;
  user?: AuthUser;
  data?: Record<string, unknown>;
  [key: string]: unknown;
}

// Types (frontend view models)
export interface PriceHistory {
  price: number;
  date: string;
}

export interface Product {
  _id: string;
  name: string;
  image?: string;
  url: string;
  domain: string;
  currency: string;
  availability: string;
  currentPrice: number;
  targetPrice?: number;
  priceHistory?: PriceHistory[];
  createdAt: string;
  updatedAt: string;
  lastChecked?: string;
  sku?: string;
  mpn?: string;
  brand?: string;
  articleType?: string;
  subCategory?: string;
  masterCategory?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
  isRunning?: boolean;
}

export interface AuthResult {
  success: boolean;
  message?: string;
  accessToken: string | null;
  accessTokenExpiresAt: number | null;
  user: AuthUser | null;
}

const REFRESH_ENDPOINT = "/auth/refresh";
let refreshPromise: Promise<string | null> | null = null;

function resolveUrl(path: string): string {
  if (path.startsWith("http")) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

function sanitizeUser(candidate: unknown): AuthUser | null {
  if (!candidate || typeof candidate !== "object") return null;
  const raw = candidate as Record<string, unknown>;
  const id = raw.id ?? raw._id;
  const email = raw.email;
  if (typeof id !== "string" || typeof email !== "string") return null;
  return {
    id,
    email,
    nickname: typeof raw.nickname === "string" ? raw.nickname : typeof raw.name === "string" ? raw.name : null,
    role: typeof raw.role === "string" ? raw.role : null,
  };
}

function computeExpiry(payload: Record<string, unknown>): number | null {
  const direct = payload.accessTokenExpiresAt;
  if (typeof direct === "number") return direct;
  const ttl = payload.accessTokenExpiresIn ?? payload.expiresIn;
  if (typeof ttl === "number") return Date.now() + ttl * 1000;
  return null;
}

function normalizeAuthPayload(payload: AuthEnvelope | null | undefined): AuthResult {
  const data = payload?.data && typeof payload.data === "object" ? (payload.data as Record<string, unknown>) : undefined;
  const accessToken = payload?.accessToken ?? data?.accessToken ?? payload?.token ?? data?.token ?? null;
  const user = sanitizeUser(payload?.user ?? data?.user);
  const accessTokenExpiresAt = computeExpiry((payload ?? {}) as Record<string, unknown>) ?? (data ? computeExpiry(data) : null);
  const message = payload?.message ?? data?.message;
  return {
    success: Boolean(payload?.success ?? true) && typeof accessToken === "string",
    message: typeof message === "string" ? message : undefined,
    accessToken: typeof accessToken === "string" ? accessToken : null,
    accessTokenExpiresAt,
    user,
  };
}

async function parseJson(response: Response): Promise<any> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const response = await fetch(resolveUrl(REFRESH_ENDPOINT), {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        clearSession();
        return null;
      }
      const payload = (await parseJson(response)) as AuthEnvelope | null;
      const normalized = normalizeAuthPayload(payload);
      if (!normalized.accessToken) {
        clearSession();
        return null;
      }
      setAccessToken(normalized.accessToken, normalized.accessTokenExpiresAt ?? undefined);
      if (normalized.user) setUser(normalized.user);
      return normalized.accessToken;
    } catch {
      clearSession();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, retry = false, headers, body, ...rest } = options;
  const finalHeaders = new Headers(headers ?? undefined);
  if (body && !(body instanceof FormData) && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getAccessToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(resolveUrl(path), {
    ...rest,
    body,
    headers: finalHeaders,
    credentials: "include",
  });

  if (response.status === 401 && auth && !retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request<T>(path, { ...options, retry: true });
    }
    throw new ApiError("Unauthorized", 401);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = await parseJson(response);

  if (!response.ok) {
    const message = (json && typeof json.message === "string") ? json.message : response.statusText;
    throw new ApiError(message || "Request failed", response.status, json ?? undefined);
  }

  return json as T;
}

// Internal: adapt backend product shape to frontend Product
function adaptProduct(p: any): Product {
  const toNum = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0));
  const priceHistory: PriceHistory[] | undefined = Array.isArray(p?.priceHistory)
    ? p.priceHistory.map((h: any) => ({ price: toNum(h.price), date: h.checkedAt ?? h.date })).filter((h: PriceHistory) => !!h.date)
    : undefined;

  const createdAt = (p?.createdAt ?? new Date().toISOString()) as string;
  const updatedAt = (p?.updatedAt ?? createdAt) as string;
  const lastChecked = (p?.lastCheckedAt ?? updatedAt ?? createdAt) as string;

  return {
    _id: (p?.id ?? p?._id) as string,
    name: (p?.name ?? "") as string,
    image: p?.image ?? undefined,
    url: (p?.url ?? "") as string,
    domain: (p?.domain ?? "") as string,
    currency: (p?.currency ?? "INR") as string,
    availability: (p?.availability ?? "Unknown") as string,
    currentPrice: toNum(p?.currentPrice),
    targetPrice: p?.targetPrice !== undefined ? toNum(p?.targetPrice) : undefined,
    priceHistory,
    createdAt,
    updatedAt,
    lastChecked,
    sku: p?.sku ?? undefined,
    mpn: p?.mpn ?? undefined,
    brand: p?.brand ?? undefined,
    articleType: p?.articleType ?? undefined,
    subCategory: p?.subCategory ?? undefined,
    masterCategory: p?.masterCategory ?? undefined,
  };
}

// API Functions
export const productApi = {
  async getAllProducts(): Promise<Product[]> {
    const result = await request<ApiResponse<any[]>>("/products");
    const items = Array.isArray(result?.data) ? result.data : Array.isArray(result) ? (result as any[]) : [];
    return items.map(adaptProduct);
  },

  async getProductById(id: string): Promise<Product> {
    const result = await request<ApiResponse<any>>(`/products/${id}`);
    const data = result?.data ?? result;
    if (!data) throw new ApiError("Product not found", 404);
    return adaptProduct(data);
  },

  async createProductByUrl(urls: string[]): Promise<Product[]> {
    const result = await request<ApiResponse<any[]>>("/products/url", {
      method: "POST",
      body: JSON.stringify({ urls }),
    });
    const items = Array.isArray(result?.data) ? result.data : [];
    return items.map(adaptProduct);
  },
};

export const schedulerApi = {
  async start(cronExpression: string = "0 */6 * * *"): Promise<void> {
    await request(`/schedule/start`, {
      method: "POST",
      body: JSON.stringify({ cronExpression }),
    });
  },

  async stop(): Promise<void> {
    await request(`/schedule/stop`, { method: "POST" });
  },

  async getStatus(): Promise<boolean> {
    const result = await request<ApiResponse<{ isRunning?: boolean }>>(`/schedule/status`);
    if (typeof result?.isRunning === "boolean") return result.isRunning;
    if (result?.data && typeof result.data.isRunning === "boolean") return result.data.isRunning;
    return false;
  },

  async checkNow(): Promise<void> {
    await request(`/schedule/check-now`, { method: "GET" });
  },
};

export interface RegisterPayload {
  email: string;
  password: string;
  nickname?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RequestPasswordResetPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

interface LoginResponseEnvelope extends ApiResponse<{ accessToken?: string; user?: AuthUser; accessTokenExpiresAt?: number; expiresIn?: number }> {
  accessToken?: string;
  user?: AuthUser;
  accessTokenExpiresAt?: number;
  expiresIn?: number;
}

export const authApi = {
  async register(payload: RegisterPayload): Promise<ApiResponse<unknown>> {
    const response = await request<ApiResponse<unknown>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
    return ensureSuccess(response);
  },

  async login(payload: LoginPayload): Promise<AuthResult> {
    const response = await request<LoginResponseEnvelope>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
    const normalized = normalizeAuthPayload(response as AuthEnvelope);
    if (!normalized.accessToken) {
      throw new ApiError(normalized.message ?? "Login failed", 400, response);
    }
    setSession({
      accessToken: normalized.accessToken,
      user: normalized.user,
      accessTokenExpiresAt: normalized.accessTokenExpiresAt,
    });
    return normalized;
  },

  async logout(): Promise<void> {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      clearSession();
    }
  },

  async refresh(): Promise<AuthResult> {
    const token = await refreshAccessToken();
    const snapshot = getSession();
    return {
      success: Boolean(token),
      message: token ? undefined : "Unable to refresh session",
      accessToken: snapshot.accessToken,
      accessTokenExpiresAt: snapshot.accessTokenExpiresAt ?? null,
      user: snapshot.user,
    };
  },

  async requestPasswordReset(payload: RequestPasswordResetPayload): Promise<ApiResponse<unknown>> {
    const response = await request<ApiResponse<unknown>>("/auth/request-password-reset", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
    return ensureSuccess(response);
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<unknown>> {
    const response = await request<ApiResponse<unknown>>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: false,
    });
    return ensureSuccess(response);
  },
};

export { ApiError };

function ensureSuccess<T>(response: ApiResponse<T>): ApiResponse<T> {
  if (!response.success) {
    throw new ApiError(response.message ?? "Request failed", 400, response);
  }
  return response;
}
