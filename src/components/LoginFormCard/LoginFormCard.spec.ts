import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import LoginFormCard from '@/components/LoginFormCard/LoginFormCard.vue'

function mountLoginFormCard(props = {}) {
  return mount(LoginFormCard, {
    props: {
      username: '',
      password: '',
      rememberMe: true,
      isSubmitting: false,
      isSubmitDisabled: true,
      errorMessage: '',
      ...props,
    },
  })
}

describe('LoginFormCard', () => {
  it('renders status, error, and disabled submit state', () => {
    const wrapper = mountLoginFormCard({
      statusMessage: 'Sua sessao expirou.',
      errorMessage: 'Credenciais invalidas',
      isSubmitDisabled: true,
    })

    expect(wrapper.get('[role="status"]').text()).toBe('Sua sessao expirou.')
    expect(wrapper.get('[role="alert"]').text()).toBe('Credenciais invalidas')
    expect(wrapper.get('button[type="submit"]').attributes()).toHaveProperty('disabled')
  })

  it('shows loading copy while submitting', () => {
    const wrapper = mountLoginFormCard({
      isSubmitting: true,
      isSubmitDisabled: true,
    })

    expect(wrapper.get('button[type="submit"]').text()).toBe('Preparando acesso...')
  })

  it('emits field updates and submit events', async () => {
    const wrapper = mountLoginFormCard({
      username: 'lucas',
      password: '',
      rememberMe: true,
      isSubmitDisabled: false,
    })

    await wrapper.get('#username').setValue('maria')
    await wrapper.get('#password').setValue('secret')
    await wrapper.get('input[type="checkbox"]').setValue(false)
    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('update:username')).toEqual([['maria']])
    expect(wrapper.emitted('update:password')).toEqual([['secret']])
    expect(wrapper.emitted('update:rememberMe')).toEqual([[false]])
    expect(wrapper.emitted('submit')).toHaveLength(1)
  })
})
