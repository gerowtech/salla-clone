declare module 'bcryptjs' {
  /** Hash a plaintext password using a numeric cost factor or salt string. */
  export function hash(plaintext: string, saltRounds: number | string): Promise<string>;

  /** Compare a plaintext password with a previously generated bcrypt hash. */
  export function compare(plaintext: string, hashed: string): Promise<boolean>;
}
