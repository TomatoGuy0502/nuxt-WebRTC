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
3. 優化介面
    - [x] landing page
    - [ ] Room page
      - [x] 顯示房間狀態(房間是否存在)
      - [ ] 顯示分享按鈕
        - [x] 複製連結
        - [x] 使用新的tab開啟
        - [ ] 使用QR code
      - [ ] 顯示對方狀態
    - [ ] RWD

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

以下是過程中遇到的問題，以及後來的解決辦法

- 如何在切換鏡頭時，不會造成畫面閃爍
  - 靈感：google meet的做法是，使用2個重疊的video，並且透過交替切換 `display: none` 來達成
  - 解決辦法：將最後一刻的畫面畫在canvas上，然後先顯示canvas，將videoTrack換掉之後，再把canvas隱藏起來

- 如何不造成傳輸停止的情況下，切換鏡頭/麥克風
  - 解決辦法：
    - 先創建一個新的`MediaStream`，並依照鏡頭/麥克風取得對應的track
    - 本地端(使用者自己看到的畫面)：使用 `addTrack` 來新增track，並且使用 `removeTrack` 來移除舊的track
    - 遠端：使用 `replaceTrack` 來替換舊的track [參考](https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpSender/replaceTrack)

- 如何切換顯示/關閉自己的鏡頭與麥克風
  - 解決辦法：使用`MediaStreamTrack`的`enabled` 來控制 [參考](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/enabled)
