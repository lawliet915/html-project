-- html-project/db/init/01_create_users_table.sql

-- user_db データベースがなければ作成し、使用する
-- CREATE DATABASE IF NOT EXISTS user_db; -- docker-compose.ymlのMYSQL_DATABASEで作成されるので通常は不要
USE user_db;

CREATE TABLE IF NOT EXISTS Users (
    id CHAR(36) PRIMARY KEY,               -- UUID型 (MySQLではCHAR(36)やVARCHAR(36)で表現)
    name VARCHAR(20) NOT NULL,             -- 名前
    age INT,                               -- 年齢
    sex INT,                               -- 性別 (0, 1, 2 などで表現)
    description VARCHAR(500),              -- 自己紹介文
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 作成日時 (任意で追加)
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP -- 更新日時 (任意で追加)
);