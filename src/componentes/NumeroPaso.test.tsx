import { expect, test } from 'vitest'
import { render } from '@testing-library/react'
import { NumeroPaso } from './NumeroPaso'

test('diez cambios rápidos conservan sólo el valor actual y el anterior inmediato', () => {
  const { container, rerender } = render(<NumeroPaso valor={0} />)
  for (let valor = 1; valor <= 10; valor++) rerender(<NumeroPaso valor={valor} />)
  expect(container.querySelector('.numero-paso__actual')).toHaveTextContent('10')
  expect(container.querySelectorAll('.numero-paso__anterior')).toHaveLength(1)
  expect(container.querySelector('.numero-paso__anterior')).toHaveTextContent('9')
  expect(container.querySelector('.numero-paso')).toHaveClass('numero-paso--sube')
  rerender(<NumeroPaso valor={9} />)
  expect(container.querySelector('.numero-paso')).toHaveClass('numero-paso--baja')
})
