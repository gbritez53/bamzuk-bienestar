import { describe, it, expect } from 'vitest'
import { routing } from '../routing'

describe('i18n routing config', () => {
  it('tiene locales es y pt', () => {
    expect(routing.locales).toContain('es')
    expect(routing.locales).toContain('pt')
  })
  it('defaultLocale es es', () => {
    expect(routing.defaultLocale).toBe('es')
  })
})
