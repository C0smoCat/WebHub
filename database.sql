-- MariaDB dump 10.17  Distrib 10.5.0-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: webhub
-- ------------------------------------------------------
-- Server version	10.5.0-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT = @@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS = @@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION = @@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE = @@TIME_ZONE */;
/*!40103 SET TIME_ZONE = '+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS = 0 */;
/*!40101 SET @OLD_SQL_MODE = @@SQL_MODE, SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES = @@SQL_NOTES, SQL_NOTES = 0 */;

--
-- Table structure for table `files`
--

DROP TABLE IF EXISTS `files`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `files`
(
    `id`        char(32)     NOT NULL,
    `file_size` int(11)      NOT NULL,
    `file_type` varchar(100) NOT NULL,
    `file_data` longblob     NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `files`
--

LOCK TABLES `files` WRITE;
/*!40000 ALTER TABLE `files`
    DISABLE KEYS */;
/*!40000 ALTER TABLE `files`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_messages`
--

DROP TABLE IF EXISTS `forum_messages`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `forum_messages`
(
    `id`             int(11)       NOT NULL AUTO_INCREMENT,
    `forum_theme_id` int(11)       NOT NULL,
    `created_by`     int(11) DEFAULT NULL,
    `create_time`    datetime      NOT NULL,
    `text`           varchar(2048) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `forum_messages_forum_theme_id_fk` (`forum_theme_id`),
    KEY `forum_messages_users_id_fk` (`created_by`),
    CONSTRAINT `forum_messages_forum_theme_id_fk` FOREIGN KEY (`forum_theme_id`) REFERENCES `forum_themes` (`id`),
    CONSTRAINT `forum_messages_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_messages`
--

LOCK TABLES `forum_messages` WRITE;
/*!40000 ALTER TABLE `forum_messages`
    DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_messages`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `forum_themes`
--

DROP TABLE IF EXISTS `forum_themes`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `forum_themes`
(
    `id`          int(11)       NOT NULL AUTO_INCREMENT,
    `title`       varchar(255)  NOT NULL,
    `create_date` datetime      NOT NULL,
    `avatar`      char(32) DEFAULT NULL,
    `created_by`  int(11)       NOT NULL,
    `description` varchar(2048) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `forum_theme_files_id_fk` (`avatar`),
    KEY `forum_theme_users_id_fk` (`created_by`),
    CONSTRAINT `forum_theme_files_id_fk` FOREIGN KEY (`avatar`) REFERENCES `files` (`id`),
    CONSTRAINT `forum_theme_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `forum_themes`
--

LOCK TABLES `forum_themes` WRITE;
/*!40000 ALTER TABLE `forum_themes`
    DISABLE KEYS */;
/*!40000 ALTER TABLE `forum_themes`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `langs`
--

DROP TABLE IF EXISTS `langs`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `langs`
(
    `id`         varchar(10)  NOT NULL,
    `title`      varchar(50)  NOT NULL,
    `background` varchar(255) NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `langs`
--

LOCK TABLES `langs` WRITE;
/*!40000 ALTER TABLE `langs`
    DISABLE KEYS */;
/*!40000 ALTER TABLE `langs`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons`
--

DROP TABLE IF EXISTS `lessons`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lessons`
(
    `id`              int(11)      NOT NULL AUTO_INCREMENT,
    `lesson_theme_id` int(11)      NOT NULL,
    `title`           varchar(100) NOT NULL,
    `avatar`          char(32) DEFAULT NULL,
    `markdown`        text         NOT NULL,
    PRIMARY KEY (`id`),
    KEY `lesson_files_id_fk` (`avatar`),
    KEY `lesson_lessons_theme_id_fk` (`lesson_theme_id`),
    CONSTRAINT `lesson_files_id_fk` FOREIGN KEY (`avatar`) REFERENCES `files` (`id`),
    CONSTRAINT `lesson_lessons_theme_id_fk` FOREIGN KEY (`lesson_theme_id`) REFERENCES `lessons_themes` (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons`
--

LOCK TABLES `lessons` WRITE;
/*!40000 ALTER TABLE `lessons`
    DISABLE KEYS */;
/*!40000 ALTER TABLE `lessons`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lessons_themes`
--

DROP TABLE IF EXISTS `lessons_themes`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lessons_themes`
(
    `id`     int(11)      NOT NULL AUTO_INCREMENT,
    `lang`   varchar(10)  NOT NULL,
    `title`  varchar(100) NOT NULL,
    `avatar` char(32) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `lessons_theme_files_id_fk` (`avatar`),
    KEY `lessons_theme_langs_id_fk` (`lang`),
    CONSTRAINT `lessons_theme_files_id_fk` FOREIGN KEY (`avatar`) REFERENCES `files` (`id`),
    CONSTRAINT `lessons_theme_langs_id_fk` FOREIGN KEY (`lang`) REFERENCES `langs` (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lessons_themes`
--

LOCK TABLES `lessons_themes` WRITE;
/*!40000 ALTER TABLE `lessons_themes`
    DISABLE KEYS */;
/*!40000 ALTER TABLE `lessons_themes`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_certificates`
--

DROP TABLE IF EXISTS `user_certificates`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_certificates`
(
    `id`          int(11)  NOT NULL AUTO_INCREMENT,
    `user_id`     int(11)  NOT NULL,
    `create_date` datetime NOT NULL,
    `image_id`    char(32) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `user_certificates_files_id_fk` (`image_id`),
    KEY `user_certificates_users_id_fk` (`user_id`),
    CONSTRAINT `user_certificates_files_id_fk` FOREIGN KEY (`image_id`) REFERENCES `files` (`id`),
    CONSTRAINT `user_certificates_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_certificates`
--

LOCK TABLES `user_certificates` WRITE;
/*!40000 ALTER TABLE `user_certificates`
    DISABLE KEYS */;
/*!40000 ALTER TABLE `user_certificates`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_lesson_progress`
--

DROP TABLE IF EXISTS `user_lesson_progress`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_lesson_progress`
(
    `id`        int(11) NOT NULL AUTO_INCREMENT,
    `user_id`   int(11) NOT NULL,
    `lesson_id` int(11) NOT NULL,
    `progress`  float   NOT NULL,
    PRIMARY KEY (`id`),
    KEY `user_lesson_progress_lesson_id_fk` (`lesson_id`),
    KEY `user_lesson_progress_users_id_fk` (`user_id`),
    CONSTRAINT `user_lesson_progress_lesson_id_fk` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
    CONSTRAINT `user_lesson_progress_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_lesson_progress`
--

LOCK TABLES `user_lesson_progress` WRITE;
/*!40000 ALTER TABLE `user_lesson_progress`
    DISABLE KEYS */;
/*!40000 ALTER TABLE `user_lesson_progress`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_lessons_comments`
--

DROP TABLE IF EXISTS `user_lessons_comments`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_lessons_comments`
(
    `id`          int(11)       NOT NULL AUTO_INCREMENT,
    `create_time` datetime      NOT NULL,
    `user_id`     int(11)       NOT NULL,
    `lesson_id`   int(11)       NOT NULL,
    `text`        varchar(1024) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `user_lessons_comments_lesson_id_fk` (`lesson_id`),
    KEY `user_lessons_comments_users_id_fk` (`user_id`),
    CONSTRAINT `user_lessons_comments_lesson_id_fk` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
    CONSTRAINT `user_lessons_comments_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_lessons_comments`
--

LOCK TABLES `user_lessons_comments` WRITE;
/*!40000 ALTER TABLE `user_lessons_comments`
    DISABLE KEYS */;
/*!40000 ALTER TABLE `user_lessons_comments`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_theme_progress`
--

DROP TABLE IF EXISTS `user_theme_progress`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_theme_progress`
(
    `id`               int(11)    NOT NULL AUTO_INCREMENT,
    `user_id`          int(11)    NOT NULL,
    `lessons_theme_id` int(11)    NOT NULL,
    `is_available`     tinyint(1) NOT NULL,
    `is_exam_complete` tinyint(1) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `user_theme_progress_lessons_theme_id_fk_2` (`lessons_theme_id`),
    KEY `user_theme_progress_users_id_fk` (`user_id`),
    CONSTRAINT `user_theme_progress_lessons_theme_id_fk_2` FOREIGN KEY (`lessons_theme_id`) REFERENCES `lessons_themes` (`id`),
    CONSTRAINT `user_theme_progress_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_theme_progress`
--

LOCK TABLES `user_theme_progress` WRITE;
/*!40000 ALTER TABLE `user_theme_progress`
    DISABLE KEYS */;
/*!40000 ALTER TABLE `user_theme_progress`
    ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users`
(
    `id`             int(11)      NOT NULL AUTO_INCREMENT,
    `login`          varchar(100) NOT NULL,
    `password_hash`  char(32)     NOT NULL,
    `create_time`    datetime     NOT NULL,
    `sex_is_boy`     tinyint(1)   NOT NULL,
    `ava_file_id`    char(32)     DEFAULT NULL,
    `status`         varchar(100) DEFAULT NULL,
    `email`          varchar(100) DEFAULT NULL,
    `premium_expire` datetime     DEFAULT NULL,
    `coins`          int(11)      NOT NULL,
    PRIMARY KEY (`id`),
    KEY `users_files_id_fk` (`ava_file_id`),
    CONSTRAINT `users_files_id_fk` FOREIGN KEY (`ava_file_id`) REFERENCES `files` (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users`
    DISABLE KEYS */;
/*!40000 ALTER TABLE `users`
    ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE = @OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE = @OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT = @OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS = @OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION = @OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES = @OLD_SQL_NOTES */;

-- Dump completed on 2020-03-06 17:37:28
