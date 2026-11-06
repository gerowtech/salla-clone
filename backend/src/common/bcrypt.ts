// Typed wrapper around bcryptjs. Keeps application and seed code independent
// of third-party declaration package availability.
declare const require: (id: string) => {
  hash(plaintext: string, saltRounds: number | string): Promise<string>;
  compare(plaintext: string, hashed: string): Promise<boolean>;
};

const bcrypt = require('bcryptjs');

export function hash(plaintext: string, saltRounds: number | string): Promise<string> {
  return bcrypt.hash(plaintext, saltRounds);
}

export function compare(plaintext: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hashed);
}
