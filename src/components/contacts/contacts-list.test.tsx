import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ContactsList } from './contacts-list'
describe('Accessible contact actions', () => {
  it('opens details through keyboard focus without nesting call actions', async () => {
    const user = userEvent.setup()
    render(<ContactsList contacts={[{ id: 'keyboard', name: 'Example Person', phone: '+91 123', address: 'Station Road', notes: 'Desk contact' }]} loading={false} error={null} />)
    const details = screen.getByRole('button', { name: "View Example Person's details" })
    details.focus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Station Road')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Call Example Person' })).toHaveAttribute('href', 'tel:+91123')
  })
})
