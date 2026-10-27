# 交互演示站肖像更新

## 范围

只更新 portfolio-demo-motion 的虚构人物肖像，不修改其他演示站或原版网站。继续使用彩色 AI 虚构人物，不恢复客户真实照片。

- 新素材：dist/assets/portrait-demo-studio-v2.webp，1086 × 1448，81,390 字节。
- 首页：同一素材的近景裁切，保留原椭圆外框与位置。
- 关于我：使用原有 3:4 肖像框、倾斜和滚动交互，保留虚构图片标识。
- 样式表、交互脚本、作品图片与其他文案不在本次修改范围内。
- 原 portrait-demo.webp 保留，可随时回退。

## 生成

使用内置 image_gen，以既有 AI 虚构肖像作身份参照。WebP 仅做格式压缩，不额外改画面；不同展示裁切由页面完成。

## 提示词

Use case: identity-preserve portrait edit.
Edit the supplied AI-GENERATED FICTIONAL WOMAN portrait into a colored independent-designer editorial studio portrait for a bold graphic-design portfolio website.
The input is an invented adult persona, not a real client photo. Preserve the SAME fictional person's facial identity, short dark bob haircut, facial proportions and natural friendly expression. Do not replace her with a different model.

CHANGE:
Replace the outdoor plants, concrete architecture and lifestyle setting with a clean seamless cool light-gray studio backdrop, very subtle natural tonal variation but no objects or graphic patterns.
Replace the soft fuzzy knit jacket with a structured dark navy / near-black cotton workwear overshirt or clean architectural jacket over an off-white crew-neck tee. Modern creative-professional styling, relaxed and practical, not a corporate suit, fashion glamour shoot or beauty advert.
Use lightly directional studio lighting from camera-left for crisp but natural facial and clothing definition, realistic skin texture, moderate contrast and true color. Face must remain clearly visible, no heavy shadow, no plastic skin smoothing.
Pose: upper torso turned slightly, shoulders relaxed and subtly asymmetric, face toward camera with a calm confident slight smile, not a rigid passport pose. A little spontaneous personality appropriate to a young visual designer.
Crop: portrait 3:4, from just above the hair to around the waist, not a full-body photo. The face is larger than in the input; position the face near horizontal center and around the upper third. Keep the entire hair silhouette visible with a little headroom. Leave useful shoulders/upper torso for a medium-sized about-page image; the same master will also be shown in a much tighter head-and-shoulders website avatar crop.
The visual should integrate with experimental typography and orange, olive, gray, red and white page themes: neutral cool-gray background, deep navy clothing, natural warm skin. COLOR photo, NOT grayscale, NOT monochrome, NOT a saturated orange backdrop.

INVARIANTS:
Same fictional woman and recognizably same face and short hair; still photorealistic; one person only; no text, badges, logos, watermarks, plants, accessories, props, office background or decorative graphic elements. Do not recreate the original website UI or pricing posters. Deliver a single clean photographic portrait only.

