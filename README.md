# 明日方舟通行证抽盒模拟器
一个模拟《明日方舟》通行证盲盒抽卡的小型前端应用。用户设置预算后，可选择不同盒子进行不放回抽卡，抽到的通行证存入背包，所有状态保存在浏览器本地。

！已经使用React重构，此版本停止维护更新，新版本请移步https://github.com/arabidopsis07/arknights-pass-simulator2.0

## 主要功能

预算管理：进入商店前设定预算，每次抽卡扣除25元，实时显示剩余预算

多盒选择：内置多个主题盒子（#31、#49、#52等），每个盒子有独立配色和14个不同通行证。

真实盲盒逻辑：在同一盒子内抽卡为不放回，不会重复获得已抽物品。

背包系统：抽到的通行证自动加入背包，支持一键清空。

数据持久化：使用localStorage保存背包和每个盒子的抽卡进度，刷新页面不丢失。

响应式设计：适配手机、平板和桌面屏幕。

## 技术栈
HTML5 + CSS3（Flexbox、Grid、响应式媒体查询）

原生JavaScript（ES6+，模块化设计）

LocalStorage API实现客户端存储

无任何第三方依赖，轻量可部署

## 如何运行
克隆本仓库到本地：

text
git clone https://github.com/arabidopsis07/arknights-pass-simulator.git
进入项目文件夹，直接用浏览器打开index.html即可。

若要在手机上预览，可使用npx serve或Python的http.server启动本地服务器。

已部署网页：https://arabidopsis07.github.io/arknights-pass-simulator/

## 项目结构
text

├── index.html          # 主页面

├── css/

│   └── style.css       # 所有样式

├── js/

│   ├── config.js       # 盒子配置数据（名称、主题色、物品列表）

│   ├── storage.js      # localStorage读写封装

│   └── main.js         # 核心业务逻辑

└── README.md           # 本文件

## 未来计划
该版本不会再更新

## 联系方式
作者：陈亭伊

项目地址：https://github.com/arabidopsis07/arknights-pass-simulator
