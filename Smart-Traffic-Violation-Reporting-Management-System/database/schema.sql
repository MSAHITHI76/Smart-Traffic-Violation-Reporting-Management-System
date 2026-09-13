-- Smart Traffic Violation Reporting & Management System
-- Database Schema for MySQL

CREATE DATABASE IF NOT EXISTS `traffic_violation_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `traffic_violation_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) DEFAULT NULL,
    `role` ENUM('citizen', 'admin') NOT NULL DEFAULT 'citizen',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Traffic Violation Reports Table
CREATE TABLE IF NOT EXISTS `traffic_violation_reports` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `violation_type` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `incident_date` DATETIME NOT NULL,
    `status` ENUM('PENDING', 'VERIFIED', 'REJECTED', 'RESOLVED') NOT NULL DEFAULT 'PENDING',
    `admin_notes` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reports_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    INDEX `idx_reports_user_id` (`user_id`),
    INDEX `idx_reports_status` (`status`),
    INDEX `idx_reports_incident_date` (`incident_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Report Evidence Table
CREATE TABLE IF NOT EXISTS `report_evidence` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `report_id` INT NOT NULL,
    `file_path` VARCHAR(255) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `file_type` ENUM('image', 'video') NOT NULL,
    `file_size` INT NOT NULL DEFAULT 0,
    `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_evidence_report` FOREIGN KEY (`report_id`) REFERENCES `traffic_violation_reports` (`id`) ON DELETE CASCADE,
    INDEX `idx_evidence_report_id` (`report_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Default Admin Account: admin@traffic.gov / Admin@123
-- Password hash generated using pbkdf2:sha256
INSERT INTO `users` (`name`, `email`, `password_hash`, `phone`, `role`)
SELECT 'System Administrator', 'admin@traffic.gov', 'scrypt:32768:8:1$1uW3e8rXp9mK$5c3ecfe4cb4831f479d2b27ba9e1c313a027fa11c3ca65d21ba7168df6f6e5e8e3d64094e9fce09ee06322ad170f800e47087fb25ea84d9f678ef40c7ea6e2bd', '+1-800-555-0199', 'admin'
WHERE NOT EXISTS (
    SELECT 1 FROM `users` WHERE `email` = 'admin@traffic.gov'
);
