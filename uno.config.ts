// uno.config.ts
import { defineConfig, presetUno, presetWebFonts } from 'unocss'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import presetIcons from '@unocss/preset-icons'

export default defineConfig({
  presets: [
    presetIcons({ /* options */ }),
    presetUno(),
    presetWebFonts({
      fonts: {
        sans: ['Noto Sans TC:400,500,700,900'],
      },
    }),
  ],
  transformers: [
    transformerVariantGroup(),
  ],
})
