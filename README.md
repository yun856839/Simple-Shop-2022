# Simple-Shop-2022
使用 Node.js 與 Express 製作的商店網站，串接藍新金流，使用 nodemailer 寄出下訂單後的 mail 通知。

[專案網址請按此](https://simple-shop-2022.herokuapp.com)

# 專案畫面
![首頁圖](https://github.com/yun856839/Simple-Shop-2022/blob/master/SimpleShop.jpg)

# 功能描述 (features)
- 尚未登入的使用者可以瀏覽所有商品以及單一商品
- 依想購買的商品加入購物車，增加、減少、刪除購物車中的商品
- 購買商品(下訂單)需登入
- 使用者登入 / 註冊功能
- 下訂單後寄出 email 通知
- 使用者需登入才能看到自己的訂單
- 管理者能新增、查看、編輯、刪除商品
- 管理者能瀏覽全部訂單
- 一般使用者不能進入管理者頁面


# 環境建置與需求 (prerequisites)
- "bcryptjs": "^2.4.3",
- "connect-flash": "^0.1.1",
- "dotenv": "^16.0.2",
- "express": "^4.18.1",
- "express-handlebars": "^6.0.6",
- "express-session": "^1.17.3",
- "faker": "^5.4.0",
- "imgur": "^1.0.0",
- "method-override": "^3.0.0",
- "multer": "^1.4.5-lts.1",
- "mysql2": "^2.3.3",
- "nodemailer": "^6.7.8",
- "passport": "^0.6.0",
- "passport-local": "^1.0.0",
- "sequelize": "^6.21.4",
- "sequelize-cli": "^6.4.1"

# 安裝與執行步驟(installation and execution)

1. 打開終端機(Terminal)，Clone 此專案至本地電腦
```
git clone https://github.com/yun856839/Simple-Shop-2022.git
```

2. 開啟終端機，進入專案資料夾
```
cd simple-shop2022
```

3. 安裝 npm 套件
```
npm install
```

4. 使用 MySQL Workbench 建立資料庫
```
drop database if exists simple_shop;
create database simple_shop;
use simple_shop;
```

5. 在終端機執行：把專案裡的 migration 設定檔同步到資料庫，並執行種子資料
```
npx sequelize db:migrate
npx sequelize db:seed:all
```

6. 執行 server
```
npm run dev
```

7. 更改 .env.example 中資料並把名稱更改為 .env

8. 使用種子資料中測試帳號進行登入
```
管理者：
  Email → root@example.com 
  Password → 12345678
使用者1： 
  Email → user1@example.com 
  Password → 12345678
```
