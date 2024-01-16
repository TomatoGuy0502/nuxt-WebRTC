# Nuxt WebRTC

## 問題研究

- 如何在切換鏡頭/麥克風時，不會造成畫面閃爍
  - 原本想法：將畫面畫在canvas上，在切換時略過畫的動作。但是發現canvas還是會閃爍
  - 解決方法：使用2個重疊的video，並且透過交替切換 `display: none` 來達成(觀察google meet的做法)
