----------------------------------------------------------------------------------------
KIRU KAKOU - Phaser 3 game for web browser

## Game Overview

Browser game developed with Phaser
No download required, can be easily played on both PC and smartphones

## Game Rules

* Attack enemies appearing from the left and surround friends appearing from the right.
* Draw trails using mouse drag on PC or swipe on smartphones.
* While drawing a trail, if an enemy touches it, you lose one life.
* Exceeding the time limit also results in losing one life.
* Losing all lives results in game over.
* The effect of your trail changes depending on the number of self-intersections in your trail.
* With 0 intersections (CROSS), it's an attack.
  However, if the trail length (LENGTH) is too short, the attack fails.
  Attacking enemies adds to your score, attacking friends significantly reduces mana.
* With 1 intersection (CROSS), it's a surrounding action.
  However, if the surrounded area (AREA) is too small, the surrounding effect fails.
  Surrounding enemies decreases mana, surrounding friends increases mana.
* With 2 or more intersections (CROSS), time stops.
  Enemies and friends stop moving, but the time limit continues to decrease.
  Extend your trail to attack many enemies or surround many friends.
* Collect the required mana for each stage to clear the round.
* The location of items is displayed as a hint at the start of a stage and
   when you make a large circle.
   Items will appear when you make a narrow circle. 
   You can activate the item's effect by slashing.
   - S: Adds score,
   - T: Adds remaining time, 
   - P: Power Storm (pushes enemies to the left and friends to the right)
* Surrounding multiple friends at once multiplies the mana gained, making it easier to clear rounds.
* Remaining time at round completion is added to your score.
* When all rounds are cleared, remaining lives are added to your score.

## Game URL
https://hijk0909.github.io/KiruKakou/
## GitHub Repository URL
https://github.com/hijk0909/KiruKakou

## License for the Game Source Code
MIT License
* Free to use
* The creator assumes no responsibility for any issues arising from its use

##Creator
Masashi HIJIKATA (X / twitter: @hijk0909)

##Acknowledgements
This game uses the following free resources.
Deep appreciation to all creators.

### Music Resources:
"DOVA-SYNDORME" https://dova-s.jp/
* Main BGM "Dramatic diary" by Kamaboko Sachiko
* End BGM "Enjoyable Way Home" by GANO
* Clear Jingle "Next Chapter" by Kobatto
* Start Jingle "Keitodama" by Kyusu
* Failure Jingle "jingle10" by VeryGoodMan

### Sound Effects:
"Effect Sound Lab" https://soundeffect-lab.info/

### Bitmap Resources:
"OpenGameArt.Org" https://opengameart.org/
* Enemy Characters "2D - Elemental Monster Spritesheets" by 2DPIXX
* Friend Characters "Jiggling Slime" by simulatoralive
* Spring Background "32x32 Grass Tile" by pboop
* Summer Background "simple water flow" by madmedicsoft
* Autumn Background "Autumn Tileset for RPGs" by knunery
* Winter Background "Snow Texture" by Downdate
* Title Buttons "Blue Button Set" by Haven
* Tornaod "Whirlwind - Arne16" by zwonky
* Flower "Generated Flowers" by Harunatsuko

----------------------------------------------------------------------------------------
KIRU KAKOU - Phaser 3 game for web browser

## ゲーム概要
* Phaser で開発されたブラウザ用ゲーム
* ダウンロード不要、PCでもスマホでも気軽に遊べます

## ゲームルール
* 左から現れる敵を攻撃し、右から現れる友を囲ってあげよう。
* PCではマウスドラッグ動作、スマホではスワイプ動作で軌跡を引きます。
* 軌跡を引いている最中に、敵が軌跡に触れると、ミスとなり、ライフが１つ減る。
　制限時間を超過してもライフが１つ減る。
　すべてのライフを失うとゲームオーバー。
* 軌跡を引き終わった時の、軌跡自身との交差の数で、軌跡の効果が変わります。
* 交差(CROSS)の数が０の場合は攻撃。
　但し、軌跡の長さ(LENGTH)が短すぎると失敗し、攻撃効果は出ない。
　敵を攻撃するとスコア加算、友を攻撃するとマナが大幅減
* 交差(CROSS)が１の場合は包囲。
　但し、囲み面積(AREA)が小さすぎると失敗し、包囲効果は出ない。
　敵を囲むとマナが減少、友を囲むとマナが上昇
* 交差(CROSS)が２以上の場合は時間停止。
　敵や友の動きが停止します。但し制限時間は減り続けます。
　軌跡を伸ばして、大量の敵を攻撃したり、大量の友を囲んだりしよう。
* 面ごとに設定されたマナのノルマを集めればラウンドクリア
　友を一気に多数囲うと獲得マナに倍率が掛かってラウンドクリアしやすくなる
　ラウンドクリア時点の残り時間が得点に加算される
* 面の開始時および大きく囲った時にアイテムの位置がヒントとして表示される。
　狭く囲うとアイテムが登場する。斬る動作でアイテムの効果を発動できる。
　S:スコア加算、T:残り時間加算、P:暴風（敵を左に、友を右に、押し分ける）
* 全てのラウンドをクリアすると、残っているライフが得点に加算される

---
## 実行URL
https://hijk0909.github.io/KiruKakou/

## GITHUBリポジトリURL
https://github.com/hijk0909/KiruKakou

---
## 本ゲームのソースコードのライセンス
MITライセンス
* 自由に利用して頂いて良い。
* 利用に際して生じた問題に当方は一切責任を負わない。

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
* 竜巻 「Whirlwind - Arne16」 by zwonky
* 花 「Generated Flowers」 by Harunatsuko
