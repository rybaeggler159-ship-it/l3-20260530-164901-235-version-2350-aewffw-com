纯静态电影网站生成说明

页面数量：
- 首页：index.html
- 分类总览：categories.html
- 独立分类页：10 个
- 搜索筛选页：search.html
- 热播榜页：ranking.html
- 影片详情页：2000 个
- sitemap.xml 与 robots.txt 已生成

影片数据：
- data_2000.txt 实际解析影片数量：2000
- 每条影片均生成独立详情页
- 每个 HTML 页面均写入百度统计脚本

图片说明：
- 页面封面与 Hero 轮播引用网站顶级目录 1.jpg 到 150.jpg
- 当前 ZIP 素材未包含这些 JPG 文件；部署时可把 1.jpg 至 150.jpg 放到网站根目录，页面会自动显示

播放说明：
- 每个详情页都有 HLS 播放器区域
- assets/player.js 会调用 assets/hls-vendor-dru42stk.js 初始化 m3u8 播放源
- 建议通过 Web 服务器访问，不建议直接用 file:// 打开模块脚本
