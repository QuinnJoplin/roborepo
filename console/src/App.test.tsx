import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'

describe('EPM-20 design console', () => {
  it('shows the reference design as feasible', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: 'EPM-20' })).toBeInTheDocument()
    expect(screen.getAllByText('54.00 lb')).toHaveLength(2)
    expect(screen.getByText('16.82 lb')).toBeInTheDocument()
    expect(screen.getByText('26.6%')).toBeInTheDocument()
    expect(screen.getByText('Feasible')).toBeInTheDocument()
  })

  it('flags the mass gate when the dry vehicle exceeds its allowance', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Dry vehicle (lb)'), {
      target: { value: '18' },
    })

    expect(screen.getAllByText('55.18 lb')).toHaveLength(2)
    expect(screen.getByText('Mass over target')).toBeInTheDocument()
  })
})
