create table users
(
    id             int auto_increment
        primary key,
    login          varchar(100) not null,
    password_hash  char(32)     not null,
    create_time    datetime     not null,
    sex_is_boy     tinyint(1)   not null,
    ava_file_id    char(32)     null,
    status         varchar(100) null,
    email          varchar(100) null,
    premium_expire datetime     null,
    coins          int          not null,
    last_active    datetime     null,
    constraint users_email_uindex
        unique (email),
    constraint users_files_id_fk
        foreign key (ava_file_id) references files (id)
);

INSERT INTO webhub.users (id, login, password_hash, create_time, sex_is_boy, ava_file_id, status, email, premium_expire, coins, last_active) VALUES (7, 'Габе', '81dc9bdb52d04dc20036dbd8313ed055', '2020-03-07 10:26:30', 1, 'e9e1999fbc2093e3ac7f13ff3a544d79', 'живой', 'gabe@the.dog', '2033-03-07 10:26:11', 1, '2020-03-12 20:45:04');
INSERT INTO webhub.users (id, login, password_hash, create_time, sex_is_boy, ava_file_id, status, email, premium_expire, coins, last_active) VALUES (8, 'Газиз', '81dc9bdb52d04dc20036dbd8313ed055', '2020-03-07 10:42:02', 1, 'ff00218d5b17d0838b8e378947fb7405', 'знаток mail.ru', 'gaziz@mail.ru', '2020-03-07 10:43:04', 1000, null);
INSERT INTO webhub.users (id, login, password_hash, create_time, sex_is_boy, ava_file_id, status, email, premium_expire, coins, last_active) VALUES (9, 'Васян Пупкин', '81dc9bdb52d04dc20036dbd8313ed055', '2020-03-07 10:44:51', 1, '111c01078725a7fb61c952b069e056a7', 'кондитер', 'vasyan@mail.ru', '2020-03-07 10:44:55', 100, null);
INSERT INTO webhub.users (id, login, password_hash, create_time, sex_is_boy, ava_file_id, status, email, premium_expire, coins, last_active) VALUES (10, 'Azino777', '81dc9bdb52d04dc20036dbd8313ed055', '2020-03-07 10:47:11', 0, 'adf1c2514223d46e979043079c67ccb6', 'online кино', 'azino@mail.ru', '2020-03-07 10:47:14', 228, '2020-03-10 20:06:21');
INSERT INTO webhub.users (id, login, password_hash, create_time, sex_is_boy, ava_file_id, status, email, premium_expire, coins, last_active) VALUES (11, 'Длиннокоммент', '81dc9bdb52d04dc20036dbd8313ed055', '2020-03-07 10:47:40', 1, 'eae3c4720647b4ca21c9a4f65913d83d', 'тест-тест', 'test1@mail.ru', '2020-03-07 10:47:46', 1, '2020-03-11 15:50:35');
INSERT INTO webhub.users (id, login, password_hash, create_time, sex_is_boy, ava_file_id, status, email, premium_expire, coins, last_active) VALUES (12, 'Среднекоммент', '81dc9bdb52d04dc20036dbd8313ed055', '2020-03-07 10:47:42', 1, 'eae3c4720647b4ca21c9a4f65913d83d', 'тест-тест', 'test2@mail.ru', '2020-03-07 10:47:45', 1, '2020-03-11 01:08:20');
INSERT INTO webhub.users (id, login, password_hash, create_time, sex_is_boy, ava_file_id, status, email, premium_expire, coins, last_active) VALUES (13, 'Bob cotik', '81dc9bdb52d04dc20036dbd8313ed055', '2020-03-07 10:47:42', 1, '5a2ec8a9ed97d4adb2be9c62d9050bc0', 'продажный', 'bob@mail.ru', '2020-03-07 10:47:45', 111, null);
INSERT INTO webhub.users (id, login, password_hash, create_time, sex_is_boy, ava_file_id, status, email, premium_expire, coins, last_active) VALUES (14, 'ye.sb', '81dc9bdb52d04dc20036dbd8313ed055', '2020-03-07 10:47:43', 0, '4b72ed372cf107476161ca83045d0f52', 'самогоногон', 'ye.sb@mail.ru', '2020-03-07 10:47:44', 1, '2020-03-09 00:30:54');
INSERT INTO webhub.users (id, login, password_hash, create_time, sex_is_boy, ava_file_id, status, email, premium_expire, coins, last_active) VALUES (15, 'Данил', '81dc9bdb52d04dc20036dbd8313ed055', '2020-03-10 17:10:46', 1, 'e9752157de38d306b4301b5b63d7af6e', '¯\\_(ツ)_/¯', 'danil@mail.ru', '2020-03-13 17:10:46', 1337, '2020-03-10 19:43:21');