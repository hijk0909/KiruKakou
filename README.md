# KIRU KAKOU - Phaser 3 game for web browser

## ゲーム概要
* Phaser で開発されたブラウザ用ゲーム
* ダウンロード不要、PCでもスマホでも気軽に遊べます

## ゲームルール
* 左から現れる敵を攻撃し、右から現れる友を囲ってあげよう。
* PCではマウスドラッグ動作、スマホではスワイプ動作で軌跡を引きます。
* 軌跡を引いている最中に、敵が軌跡に触れると、ミスとなり、ライフが１つ減る。
　すべてのライフを失うとゲームオーバー。
* 軌跡を引き終わった時の、軌跡自身との交差の数で、軌跡の効果が変わります。
* **交差(CROSS)の数が０**の場合は攻撃。
　但し、軌跡の長さ(LENGTH)が短すぎると失敗し、攻撃効果は出ない。
　敵を攻撃するとスコア加算、友を攻撃するとマナが大幅減
* **交差(CROSS)が１**の場合は包囲。
　但し、囲み面積(AREA)が小さすぎると失敗し、包囲効果は出ない。
　敵を囲むとマナが減少、友を囲むとマナが上昇
* **交差(CROSS)が２以上**の場合は失敗、何の効果も出ない
* 面ごとに設定されたマナのノルマを集めればラウンドクリア
　友を一気に多数囲うと獲得マナに倍率が掛かってラウンドクリアしやすくなる
　ラウンドクリア時点の残り時間が得点に加算される
* 全てのラウンドをクリアすると、残っているライフが得点に加算される

---
## 実行URL
   https://hijk0909.github.io/KiruKakou/

## GITHUBリポジトリURL
　https://github.com/hijk0909/KiruKakou

---
## 本ゲームのソースコードのライセンス
　MITライセンス
　（自由に利用して頂いて良い。）
　（利用に際して生じた問題に当方は一切責任を負わない。）

## 作者
Masashi HIJIKATA (X / twitter: @hijk0909）

## 謝辞
本ゲームの開発では下記のフリー素材を使わせて頂きました。
深く感謝申し上げます。

### 音楽素材：
「DOVA-SYNDORME」
https://dova-s.jp/

* BGM_メイン「Dramatic diary」by 蒲鉾さちこ
* BGM_エンド「楽しい帰り道 」by GANO
* Jingle_クリア「ネクスト・チャプター」 by こばっと
* Jingle_開始「けいとだま」by キュス
* Jingle_失敗「jingle10」by VeryGoodMan

### 効果音素材：
「効果音ラボ」
https://soundeffect-lab.info/

### ビットマップ素材：
「OpenGameArt.Org」
https://opengameart.org/

* 敵キャラ「2D - Elemental Monster Spritesheets」by 2DPIXX
* 友キャラ「Jiggling Slime」by simulatoralive
* 春背景「32x32 Grass Tile」by pboop
* 夏背景「simple water flow」by madmedicsoft
* 秋背景「Autumn Tileset for RPGs」by knunery
* 冬背景「Snow Texture」by Downdate
* タイトルボタン「Blue Button Set」 by Haven
