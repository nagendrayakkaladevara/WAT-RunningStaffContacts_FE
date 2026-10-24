import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useContactsSearch } from './use-contacts-search'
import { contactsService } from '@/services/contacts.service'
import type { PaginatedContactsResponse } from '@/types/contact'
vi.mock('@/services/contacts.service')
const response: PaginatedContactsResponse = { success: true, data: [{ id: '1', name: 'Old result' }], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } }
describe('Search cancellation', () => {
  beforeEach(() => vi.clearAllMocks())
  it('clearing invalidates pending results even when the transport ignores abort', async () => {
    let finish!: (value: PaginatedContactsResponse) => void
    vi.mocked(contactsService.searchByName).mockReturnValue(new Promise(resolve => { finish = resolve }))
    const { result } = renderHook(useContactsSearch)
    let pending!: Promise<void>
    act(() => { pending = result.current.searchByName('Old') })
    const signal = vi.mocked(contactsService.searchByName).mock.calls[0][3]!
    act(() => result.current.clearResults())
    expect(signal.aborted).toBe(true)
    await act(async () => { finish(response); await pending })
    expect(result.current.contacts).toEqual([])
    expect(result.current.loading).toBe(false)
  })
  it('aborts the previous request when switching from name to phone', async () => {
    vi.mocked(contactsService.searchByName).mockReturnValue(new Promise(() => {}))
    vi.mocked(contactsService.searchByPhone).mockResolvedValue(response)
    const { result, unmount } = renderHook(useContactsSearch)
    act(() => { void result.current.searchByName('123') })
    const signal = vi.mocked(contactsService.searchByName).mock.calls[0][3]!
    await act(async () => { await result.current.searchByPhone('123') })
    expect(signal.aborted).toBe(true)
    expect(result.current.contacts).toEqual(response.data)
    const phoneSignal = vi.mocked(contactsService.searchByPhone).mock.calls[0][1]!
    unmount()
    expect(phoneSignal.aborted).toBe(true)
  })
})
