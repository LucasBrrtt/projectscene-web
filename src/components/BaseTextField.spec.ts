import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import BaseTextField from '@/components/BaseTextField.vue'

describe('BaseTextField', () => {
  it('renders label and input attributes', () => {
    const wrapper = mount(BaseTextField, {
      props: {
        id: 'username',
        label: 'Usuario',
        modelValue: 'lucas',
        autocomplete: 'username',
        placeholder: 'Digite seu usuario',
      },
    })

    const label = wrapper.get('label')
    const input = wrapper.get('input')

    expect(label.text()).toBe('Usuario')
    expect(label.attributes('for')).toBe('username')
    expect(input.attributes('id')).toBe('username')
    expect(input.attributes('type')).toBe('text')
    expect(input.attributes('autocomplete')).toBe('username')
    expect(input.attributes('placeholder')).toBe('Digite seu usuario')
    expect((input.element as HTMLInputElement).value).toBe('lucas')
  })

  it('emits model updates when the input changes', async () => {
    const wrapper = mount(BaseTextField, {
      props: {
        id: 'password',
        label: 'Senha',
        modelValue: '',
        type: 'password',
      },
    })

    await wrapper.get('input').setValue('secret')

    expect(wrapper.emitted('update:modelValue')).toEqual([['secret']])
  })
})
