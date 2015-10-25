-- phpMyAdmin SQL Dump
-- version 4.1.14
-- http://www.phpmyadmin.net
--
-- Host: 127.0.0.1
-- Generation Time: Oct 22, 2015 at 05:37 PM
-- Server version: 5.6.17
-- PHP Version: 5.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `geovetph`
--

-- --------------------------------------------------------

--
-- Table structure for table `province`
--

CREATE TABLE IF NOT EXISTS `province` (
  `province_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `region_id` int(11) NOT NULL,
  PRIMARY KEY (`province_id`),
  KEY `region_id` (`region_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=83 ;

--
-- Dumping data for table `province`
--

INSERT INTO `province` (`province_id`, `name`, `region_id`) VALUES
(1, 'NCR', 1),
(2, 'Abra', 2),
(3, 'Apayao', 2),
(4, 'Benguet', 2),
(5, 'Ifugao', 2),
(6, 'Kalinga', 2),
(7, 'Mountain Province', 2),
(8, 'Ilocos Norte', 3),
(9, 'Ilocos Sur', 3),
(10, 'La Union', 3),
(11, 'Pangasinan', 3),
(12, 'Batanes', 4),
(13, 'Cagayan', 4),
(14, 'Isabella', 4),
(15, 'Nueva Vizcaya', 4),
(16, 'Quirino', 4),
(17, 'Aurora', 5),
(18, 'Bataan', 5),
(19, 'Bulacan', 5),
(20, 'Nueva Ecija', 5),
(21, 'Pampanga', 5),
(22, 'Tarlac', 5),
(23, 'Zambales', 5),
(24, 'Batangas', 6),
(25, 'Cavite', 6),
(26, 'Laguna', 6),
(27, 'Quezon', 6),
(28, 'Rizal', 6),
(29, 'Marinduque', 7),
(30, 'Occidental Mindoro', 7),
(31, 'Oriental Mindoro', 7),
(32, 'Palawan', 7),
(33, 'Romblon', 7),
(34, 'Albay', 8),
(35, 'Camarines Norte', 8),
(36, 'Camarines Sur', 8),
(37, 'Catanduanes', 8),
(38, 'Masbate', 8),
(39, 'Sorsogon', 8),
(40, 'Aklan', 9),
(41, 'Antique', 9),
(42, 'Capiz', 9),
(43, 'Guimaras', 9),
(44, 'Iloilo', 9),
(45, 'Negros Occidental', 9),
(46, 'Bohol', 10),
(47, 'Cebu', 10),
(48, 'Negros Oriental', 10),
(49, 'Siquijor', 10),
(50, 'Biliran', 11),
(51, 'Eastern Samar', 11),
(52, 'Leyte', 11),
(53, 'Northern Samar', 11),
(54, 'Samar', 11),
(55, 'Southern Leyte', 11),
(56, 'Zamboanga del Norte', 12),
(57, 'Zamboanga del Sur', 12),
(58, 'Zamboanga Sibugay', 12),
(59, 'Bukidnon', 13),
(60, 'Camiguin', 13),
(61, 'Lanao del Norte', 13),
(62, 'Misamis Occidental', 13),
(63, 'Misamis Oriental', 13),
(64, 'Compostella Valley', 14),
(65, 'Davao del Norte', 14),
(66, 'Davao del Sur', 14),
(67, 'Davao Oriental', 14),
(68, 'Cotabato', 15),
(69, 'Sarangani', 15),
(70, 'South Cotabato', 15),
(71, 'Sultan Kudarat', 15),
(72, 'Agusan del Norte', 16),
(73, 'Agusan del Sur', 16),
(74, 'Dinagat Islands', 16),
(75, 'Surigao del Norte', 16),
(76, 'Surigao del Sur', 16),
(77, 'Basilan', 17),
(78, 'Lanao del Sur', 17),
(79, 'Maguindanao', 17),
(80, 'Shariff Kabunsuan', 17),
(81, 'Sulu', 17),
(82, 'Tawi-Tawi', 17);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `province`
--
ALTER TABLE `province`
  ADD CONSTRAINT `fk_province_region_id` FOREIGN KEY (`region_id`) REFERENCES `region` (`region_id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
