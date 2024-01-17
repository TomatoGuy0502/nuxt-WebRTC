# Nuxt WebRTC

## 目標

1. 取得使用者的影像與聲音(getUserMedia)
    - [x] 取得鏡頭與麥克風權限
    - [x] 顯示鏡頭畫面
    - [x] 切換鏡頭 / 麥克風
    - [x] 切換喇叭
2. 透過WebRTC傳送影像與聲音
    - [x] Signaling:
      - 建立和管理通信會話時，瀏覽器之間進行通信的過程
      - 傳輸的資訊為SDP (Session Description Protocol)
      - 可以用Socket.io/peerjs/Firebase來實作
    - [x] 建立RTCPeerConnection
    - [x] 使用peerjs來實作

## 相關名詞解釋
- ICE (Interactive Connectivity Establishment)
  - 用來建立P2P連線的協定
  - 用來應對NAT與防火牆的問題
  - 透過STUN/TURN伺服器來取得IP位址
- STUN (Session Traversal Utilities for NAT)
  - 用於檢查和獲取設備的公共IP地址和端口
- TURN (Traversal Using Relays around NAT)
  - 當STUN無法取得IP時，會透過TURN來進行中轉
- NAT (Network Address Translation)
  - 網路位址轉換
  - 用來解決IP位址不足的問題
  - 會造成P2P連線的問題(因為IP位址不是公開的)

## 問題研究

- 如何在切換鏡頭/麥克風時，不會造成畫面閃爍
  - 原本想法：將畫面畫在canvas上，在切換時略過畫的動作。但是發現canvas還是會閃爍
  - 靈感：使用2個重疊的video，並且透過交替切換 `display: none` 來達成(觀察google meet的做法)
  - 解決辦法：還是將畫面畫在canvas上，然後先顯示canvas，經過短暫延遲才把video的source換掉
