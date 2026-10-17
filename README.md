# START · DNF 手机操作体验（公开演示版）

[在线体验](https://himoral.github.io/start-dnf-prototype/)

新版点击方案默认在城镇显示角色，顶部半透明操作栏支持拖动，鼠标方式与单击／双击分别保持选中。战斗技能在按钮周围展开等分扇区圆盘，不滑动时松手释放默认技能。

城镇街道采用 [DFO 官方 Origin: Area](https://www.dfoneople.com/news/updates/877/Origin/Origin:-Area) 的赫顿玛尔原图；城镇角色透明版使用内置 image_gen 从原角色素材生成，作为原型示意。战斗场景仍使用原角色动画。

静态网页交互原型，可直接打开 index.html，或将本目录内容作为 GitHub Pages 站点根目录。无需安装依赖或构建。保留 assets 和 steam 的相对目录结构。

## 公开素材说明

Steam 主页、游戏库、游戏详情、安装详情和登录背景均已替换为全新绘制的 SVG 示意界面。公开副本不包含被替换的原始账号截图，不展示真实账号头像、好友列表、游玩记录或可扫描登录二维码。其余 Steam 加载画面未见用户标识；P5R 游戏场景继续用于既有交互演示。

DNF 场景和角色动画来自国际服 DFO 官方资料，来源链接见网页中的“素材与说明”，不代表国服当前版本画面。游戏相关图像与商标归各自权利人所有。

本原型不连接真实 START、Steam 或 DNF 账号，不接收密码，不执行真实支付。战斗、材料、游戏库与云端状态均为本地演示。角色布局配置仅保存在访问者自己的浏览器中。

## 入口

- 首页：index.html
- DNF 详情：index.html#dnf
- 点击方案：index.html#play/click
- 日常战斗：index.html#play/daily
- 高阶战斗：index.html#play/advanced
- Steam 原有流程：steam/index.html#steam-detail

包含 .nojekyll，支持 GitHub Pages 仓库子路径。详细操作见使用说明.md。
