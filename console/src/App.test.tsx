import { fireEvent, render, screen } from '@testing-library/react'
import { vi } from 'vitest'
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

  it('exports a review brief and confirms the action', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined)
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Export review brief' }))

    expect(click).toHaveBeenCalledOnce()
    expect(screen.getByRole('status')).toHaveTextContent('Review brief downloaded.')
    click.mockRestore()
  })

  it('navigates to the selected build-package section', () => {
    const scrollIntoView = vi.fn()
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Build package' }))

    expect(screen.getByRole('button', { name: 'Build package' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('heading', { name: 'Build package' })).toBeInTheDocument()
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  })

  it('rejects a negative dry-vehicle mass instead of reporting a false feasible state', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('Dry vehicle (lb)'), {
      target: { value: '-1' },
    })

    expect(screen.getByRole('alert')).toHaveTextContent('Dry vehicle mass must be between 0 and 40 lb.')
    expect(screen.getByText('Needs valid input')).toBeInTheDocument()
    expect(screen.queryByText('36.18 lb')).not.toBeInTheDocument()
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
