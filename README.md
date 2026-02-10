# Studio App

スマホで動作する PWA（Progressive Web App）。

## 技術スタック

- React 19 + TypeScript
- Vite 7
- vite-plugin-pwa（Service Worker / マニフェスト自動生成）

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
npm run preview
```

## スマホで使う

1. `npm run build && npm run preview` でサーバー起動
2. 同一ネットワーク内のスマホのブラウザからアクセス
3. 「ホーム画面に追加」でネイティブアプリ風に使える
