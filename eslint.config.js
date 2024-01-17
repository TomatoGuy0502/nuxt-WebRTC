import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: {
    overrides: {
      'brace-style': ['error', '1tbs'],
      'ts/brace-style': ['error', '1tbs'],
      'style/brace-style': ['error', '1tbs'],
    },
  },
})
