import type { Request } from 'express';
import { describe, expect, it } from 'vitest';
import { clientIp, isInternal, isInternalServerCall } from '../src/middleware/client-ip';

const KEY = 'internal-test-key-that-is-long-enough-000000';

function fakeRequest(headers: Record<string, string>, ip = '10.0.0.1'): Request {
  const lower = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), v]));
  return { ip, get: (name: string) => lower[name.toLowerCase()] } as unknown as Request;
}

describe('client IP trust', () => {
  it('uses the relayed visitor IP only when the internal key is valid', () => {
    expect(clientIp(fakeRequest({ 'x-internal-key': KEY, 'x-client-ip': '203.0.113.7' }))).toBe('203.0.113.7');
    expect(clientIp(fakeRequest({ 'x-internal-key': KEY, 'x-client-ip': '2001:db8::1' }))).toBe('2001:db8::1');
  });

  it('ignores a spoofed x-client-ip without the key or with a wrong key', () => {
    expect(clientIp(fakeRequest({ 'x-client-ip': '203.0.113.7' }))).toBe('10.0.0.1');
    expect(clientIp(fakeRequest({ 'x-internal-key': 'wrong', 'x-client-ip': '203.0.113.7' }))).toBe('10.0.0.1');
    expect(isInternal(fakeRequest({ 'x-internal-key': `${KEY}x` }))).toBe(false);
  });

  it('rejects malformed relayed IPs', () => {
    expect(clientIp(fakeRequest({ 'x-internal-key': KEY, 'x-client-ip': '1.2.3.4, evil' }))).toBe('10.0.0.1');
  });

  it('treats keyed calls without a visitor IP as frontend server calls (not rate-limited)', () => {
    expect(isInternalServerCall(fakeRequest({ 'x-internal-key': KEY }))).toBe(true);
    expect(isInternalServerCall(fakeRequest({ 'x-internal-key': KEY, 'x-client-ip': '203.0.113.7' }))).toBe(false);
    expect(isInternalServerCall(fakeRequest({}))).toBe(false);
  });
});
