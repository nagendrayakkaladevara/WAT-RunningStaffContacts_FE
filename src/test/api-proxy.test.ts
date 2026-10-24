import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import handler from '../../netlify/functions/api'
describe('Directory proxy boundary', () => {
  beforeEach(() => {
    vi.stubEnv('WAT_API_BASE_URL', 'https://backend.example.com')
    vi.stubEnv('WAT_API_KEY', 'server-only-key')
    vi.stubEnv('WAT_API_USERNAME', 'server-user')
    vi.stubEnv('WAT_API_PASSWORD', 'server-password')
    vi.mocked(fetch).mockReset()
  })
  afterEach(() => vi.unstubAllEnvs())
  it('injects credentials only upstream and preserves the API payload', async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json({ success: true, data: [] }))
    const response = await handler(new Request('https://directory.example.com/api/contacts/search/name?query=Ravi'))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true, data: [] })
    const [url, options] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toBe('https://backend.example.com/api/contacts/search/name?query=Ravi')
    expect(options?.headers).toMatchObject({ 'X-API-Key': 'server-only-key', Authorization: expect.stringContaining('Basic ') })
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(response.headers.get('Authorization')).toBeNull()
  })
  it.each(['/api/contacts/admin/deleteAllContacts', '/api/contacts/all', '/api/contacts/unknown'])('rejects non-allowlisted route %s', async path => {
    expect((await handler(new Request(`https://directory.example.com${path}`))).status).toBe(404)
    expect(fetch).not.toHaveBeenCalled()
  })
  it('does not forward query credentials or caller-provided URLs', async () => {
    expect((await handler(new Request('https://directory.example.com/api/contacts?apiKey=attacker'))).status).toBe(400)
    expect(fetch).not.toHaveBeenCalled()
  })
  it('fails closed when server configuration is absent', async () => {
    vi.stubEnv('WAT_API_PASSWORD', '')
    expect((await handler(new Request('https://directory.example.com/api/contacts'))).status).toBe(503)
    expect(fetch).not.toHaveBeenCalled()
  })
  it('rejects mutations and cross-origin visit writes', async () => {
    expect((await handler(new Request('https://directory.example.com/api/contacts', { method: 'POST' }))).status).toBe(404)
    expect((await handler(new Request('https://directory.example.com/api/analytics/visits', { method: 'POST', headers: { Origin: 'https://other.example.com' } }))).status).toBe(403)
  })
  it('supports the Netlify rewrite path and hides upstream errors', async () => {
    vi.mocked(fetch).mockResolvedValue(Response.json({ message: 'private error' }, { status: 500 }))
    const response = await handler(new Request('https://directory.example.com/.netlify/functions/api/contacts'))
    expect(response.status).toBe(502)
    expect(await response.text()).not.toContain('private error')
  })
})
