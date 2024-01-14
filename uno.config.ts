// uno.config.ts
import { defineConfig, presetAttributify, presetUno, presetWebFonts } from 'unocss'
import transformerVariantGroup from '@unocss/transformer-variant-group'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetWebFonts({}),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
})
