import { describe, expect, it } from 'vitest'
import { dialNumber, toVCard } from './contact-sharing'
import { isPhoneQuery } from './contact-search'
describe('Contact actions', () => {
  it('normalizes dialing without discarding a country prefix', () => { expect(dialNumber('+91 (90000) 12345')).toBe('+919000012345') })
  it('escapes vCard text so names cannot inject fields', () => {
    const value = toVCard({ id: '1', name: 'A;B,C\nTEL:999', phone: '+91 123' })
    expect(value).toContain('FN:A\\;B\\,C\\nTEL:999\r\n')
    expect(value).toContain('TEL;TYPE=VOICE:+91123\r\n')
    expect(value).not.toContain('\r\nTEL:999')
  })
  it('detects phone input with an explicit override for numeric names', () => {
    expect(isPhoneQuery('+91 123', 'auto')).toBe(true)
    expect(isPhoneQuery('Ravi', 'auto')).toBe(false)
    expect(isPhoneQuery('123', 'name')).toBe(false)
  })
})
