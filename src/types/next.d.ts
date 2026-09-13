// Type declarations for Next.js modules used by Supabase SSR helpers
declare module "next/headers" {
  export interface ReadonlyRequestCookies {
    get(name: string): { name: string; value: string } | undefined;
    getAll(): Array<{ name: string; value: string }>;
    set(name: string, value: string, options?: any): void;
    delete(name: string): void;
    has(name: string): boolean;
    [Symbol.iterator](): IterableIterator<[string, { name: string; value: string }]>;
  }

  export function cookies(): Promise<ReadonlyRequestCookies>;
}

declare module "next/server" {
  export class NextResponse {
    static next(options?: any): NextResponse;
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      getAll(): Array<{ name: string; value: string }>;
      set(name: string, value: string, options?: any): void;
      delete(name: string): void;
    };
    [key: string]: any;
  }

  export interface NextRequest {
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      getAll(): Array<{ name: string; value: string }>;
      set(name: string, value: string, options?: any): void;
      delete(name: string): void;
    };
    headers: Headers;
    [key: string]: any;
  }
}
