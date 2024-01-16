// uno.config.ts
import { defineConfig, presetAttributify, presetUno, presetWebFonts } from 'unocss'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import presetIcons from '@unocss/preset-icons'

export default defineConfig({
  presets: [
    presetIcons({ /* options */ }),
    presetUno(),
    presetAttributify(),
    presetWebFonts({}),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
})
