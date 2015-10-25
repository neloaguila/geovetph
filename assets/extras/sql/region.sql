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
-- Table structure for table `region`
--

CREATE TABLE IF NOT EXISTS `region` (
  `region_id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  `long_name` varchar(50) NOT NULL,
  PRIMARY KEY (`region_id`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=18 ;

--
-- Dumping data for table `region`
--

INSERT INTO `region` (`region_id`, `name`, `long_name`) VALUES
(1, 'NCR', 'Metro Manila'),
(2, 'CAR', 'Cordillera Administrative Region'),
(3, 'Region I', 'Ilocos Region'),
(4, 'Region II', 'Cagayan Valley'),
(5, 'Region III', 'Central Luzon'),
(6, 'Region IV-A', 'Calabarzon'),
(7, 'Region IV-B', 'MIMAROPA'),
(8, 'Region V', 'Bicol'),
(9, 'Region VI', 'Western Visayas'),
(10, 'Region VII', 'Central Visayas'),
(11, 'Region VIII', 'Eastern Visayas'),
(12, 'Region IX', 'Zamboanga Peninsula'),
(13, 'Region X', 'Northern Mindanao'),
(14, 'Region XI', 'Davao Region'),
(15, 'SOCCSKSARGEN', 'Region XII'),
(16, 'Caraga', 'Caraga'),
(17, 'ARMM', 'Autonomous Region in Muslim Mindanao');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
