import fs from 'fs';

function looksLikePem(value: string): boolean {
  return value.startsWith('-----BEGIN ') || value.includes('\n');
}

export function resolveSecretValue(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (looksLikePem(trimmed)) {
    return trimmed;
  }

  return fs.readFileSync(trimmed, 'utf8');
}

export function requireSecretValue(name: string, value: string | undefined): string {
  const resolved = resolveSecretValue(value);

  if (!resolved) {
    throw new Error(`${name} is not configured. Provide the PEM contents or a readable file path.`);
  }

  return resolved;
}