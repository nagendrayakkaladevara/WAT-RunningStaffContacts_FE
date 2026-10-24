import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Categories } from './Categories'
import { contactsService } from '@/services/contacts.service'
vi.mock('@/services/contacts.service')
const response = { success: true, data: [{ id: '1', name: 'Example Person' }], pagination: { page: 1, limit: 50, total: 1, totalPages: 1 } }
describe('Applied category filters', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(contactsService.getLobbies).mockResolvedValue(['WALTAIR']); vi.mocked(contactsService.getDesignations).mockResolvedValue(['LOCO PILOT']); vi.mocked(contactsService.getBloodGroups).mockResolvedValue(['O+']); vi.mocked(contactsService.getAllContacts).mockResolvedValue(response); vi.mocked(contactsService.filterContacts).mockResolvedValue(response) })
  it('retains current results until filters are applied and resets page', async () => {
    render(<MemoryRouter initialEntries={['/categories?category=all-contacts&page=2']}><Categories /></MemoryRouter>)
    await screen.findByText('Example Person')
    fireEvent.click(await screen.findByRole('checkbox', { name: 'WALTAIR' }))
    expect(contactsService.filterContacts).not.toHaveBeenCalled()
    expect(screen.getByText('Example Person')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Apply filters' }))
    await waitFor(() => expect(contactsService.filterContacts).toHaveBeenCalledWith([], ['WALTAIR'], [], 1, 50, expect.any(AbortSignal)))
    fireEvent.click(screen.getByRole('button', { name: 'Remove Lobby WALTAIR filter' }))
    await waitFor(() => expect(contactsService.getAllContacts).toHaveBeenLastCalledWith(1, 50, expect.any(AbortSignal)))
  })
})
