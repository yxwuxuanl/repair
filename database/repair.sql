/*
 Navicat Premium Data Transfer

 Source Server         : Local
 Source Server Type    : MySQL
 Source Server Version : 50715
 Source Host           : localhost
 Source Database       : repair

 Target Server Type    : MySQL
 Target Server Version : 50715
 File Encoding         : utf-8

 Date: 12/29/2016 20:49:29 PM
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
--  Table structure for `account`
-- ----------------------------
DROP TABLE IF EXISTS `account`;
CREATE TABLE `account` (
  `account_id` char(10) NOT NULL,
  `account_name` varchar(12) DEFAULT NULL,
  `password` char(42) DEFAULT NULL,
  `account_group` varchar(55) DEFAULT NULL,
  PRIMARY KEY (`account_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `account`
-- ----------------------------
BEGIN;
INSERT INTO `account` VALUES ('u_8jda9dj2', 'admin', '*B4ED1AF59F2B5BC3EC8402AD9501B1D540758A67', ''), ('u_sd92jd9', 'groupmanager', '*B4ED1AF59F2B5BC3EC8402AD9501B1D540758A67', 'g_d9jakd92');
COMMIT;

-- ----------------------------
--  Table structure for `event`
-- ----------------------------
DROP TABLE IF EXISTS `event`;
CREATE TABLE `event` (
  `event_id` char(10) NOT NULL,
  `event_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`event_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `event`
-- ----------------------------
BEGIN;
INSERT INTO `event` VALUES ('e_989e2889', 'EVENT_0'), ('e_989e2927', 'EVENT_1'), ('e_989e294b', 'EVENT_2'), ('e_989e2967', 'EVENT_3'), ('e_989e2aa4', 'EVENT_4'), ('e_989e2ac4', 'EVENT_5'), ('e_989e2ada', 'EVENT_6'), ('e_989e2b3d', 'EVENT_7'), ('e_989e2b56', 'EVENT_8'), ('e_989e2b6b', 'EVENT_9'), ('e_989e2b7f', 'EVENT_10'), ('e_989e2ba3', 'EVENT_11'), ('e_989e2bba', 'EVENT_12'), ('e_989e2bcd', 'EVENT_13'), ('e_989e2be0', 'EVENT_14'), ('e_989e2bf3', 'EVENT_15'), ('e_989e2c11', 'EVENT_16'), ('e_989e2c2c', 'EVENT_17'), ('e_989e2c3f', 'EVENT_18'), ('e_989e2c54', 'EVENT_19'), ('e_989e2c6b', 'EVENT_20'), ('e_989e2c80', 'EVENT_21'), ('e_989e2c93', 'EVENT_22'), ('e_989e2ca6', 'EVENT_23'), ('e_989e2cb9', 'EVENT_24'), ('e_989e2cd0', 'EVENT_25'), ('e_989e2ceb', 'EVENT_26'), ('e_989e2d03', 'EVENT_27'), ('e_989e2d1b', 'EVENT_28'), ('e_989e2d30', 'EVENT_29'), ('e_989e2d4c', 'EVENT_30'), ('e_989e2d65', 'EVENT_31'), ('e_989e2d7f', 'EVENT_32'), ('e_989e2d97', 'EVENT_33'), ('e_989e2db0', 'EVENT_34'), ('e_989e2dce', 'EVENT_35'), ('e_989e2dea', 'EVENT_36'), ('e_989e2dfa', 'EVENT_37'), ('e_989e2e0c', 'EVENT_38'), ('e_989e2e27', 'EVENT_39'), ('e_989e2e3a', 'EVENT_40'), ('e_989e2e4f', 'EVENT_41'), ('e_989e2e63', 'EVENT_42'), ('e_989e2e7b', 'EVENT_43'), ('e_989e2e94', 'EVENT_44'), ('e_989e2eab', 'EVENT_45'), ('e_989e2ec5', 'EVENT_46'), ('e_989e2ee5', 'EVENT_47'), ('e_989e2f06', 'EVENT_48'), ('e_989e2f23', 'EVENT_49'), ('e_989e2f3d', 'EVENT_50'), ('e_989e2f5a', 'EVENT_51'), ('e_989e2f74', 'EVENT_52'), ('e_989e2f8e', 'EVENT_53'), ('e_989e2fa7', 'EVENT_54'), ('e_989e2fc1', 'EVENT_55'), ('e_989e2fdb', 'EVENT_56'), ('e_989e2ff3', 'EVENT_57'), ('e_989e300d', 'EVENT_58'), ('e_989e3029', 'EVENT_59'), ('e_989e3040', 'EVENT_60'), ('e_989e305c', 'EVENT_61'), ('e_989e3079', 'EVENT_62'), ('e_989e3094', 'EVENT_63'), ('e_989e30ae', 'EVENT_64'), ('e_989e30c7', 'EVENT_65'), ('e_989e30e1', 'EVENT_66'), ('e_989e30fa', 'EVENT_67'), ('e_989e3114', 'EVENT_68'), ('e_989e312b', 'EVENT_69'), ('e_989e3142', 'EVENT_70'), ('e_989e315a', 'EVENT_71'), ('e_989e3176', 'EVENT_72'), ('e_989e3192', 'EVENT_73'), ('e_989e31ae', 'EVENT_74'), ('e_989e31ce', 'EVENT_75'), ('e_989e31e7', 'EVENT_76'), ('e_989e3200', 'EVENT_77'), ('e_989e321c', 'EVENT_78'), ('e_989e3236', 'EVENT_79'), ('e_989e3251', 'EVENT_80'), ('e_989e3269', 'EVENT_81'), ('e_989e3283', 'EVENT_82'), ('e_989e329c', 'EVENT_83'), ('e_989e32b4', 'EVENT_84'), ('e_989e32d0', 'EVENT_85'), ('e_989e32e9', 'EVENT_86'), ('e_989e3303', 'EVENT_87'), ('e_989e331d', 'EVENT_88'), ('e_989e3337', 'EVENT_89'), ('e_989e3352', 'EVENT_90'), ('e_989e3369', 'EVENT_91'), ('e_989e3381', 'EVENT_92'), ('e_989e339b', 'EVENT_93'), ('e_989e33b3', 'EVENT_94'), ('e_989e33cc', 'EVENT_95'), ('e_989e33e4', 'EVENT_96'), ('e_989e3400', 'EVENT_97'), ('e_989e3419', 'EVENT_98'), ('e_989e3432', 'EVENT_99'), ('e_989e3447', 'EVENT_100'), ('e_989e345d', 'EVENT_101'), ('e_989e3475', 'EVENT_102'), ('e_989e348f', 'EVENT_103'), ('e_989e34a8', 'EVENT_104'), ('e_989e34c2', 'EVENT_105'), ('e_989e34db', 'EVENT_106'), ('e_989e34f5', 'EVENT_107'), ('e_989e350f', 'EVENT_108'), ('e_989e3528', 'EVENT_109'), ('e_989e3540', 'EVENT_110'), ('e_989e3559', 'EVENT_111'), ('e_989e3571', 'EVENT_112'), ('e_989e3588', 'EVENT_113'), ('e_989e359d', 'EVENT_114'), ('e_989e35ac', 'EVENT_115'), ('e_989e35bd', 'EVENT_116'), ('e_989e35d3', 'EVENT_117'), ('e_989e35e5', 'EVENT_118'), ('e_989e35f8', 'EVENT_119'), ('e_989e360c', 'EVENT_120'), ('e_989e361f', 'EVENT_121'), ('e_989e3632', 'EVENT_122'), ('e_989e3645', 'EVENT_123'), ('e_989e3657', 'EVENT_124'), ('e_989e366a', 'EVENT_125'), ('e_989e367d', 'EVENT_126'), ('e_989e368f', 'EVENT_127'), ('e_989e36a3', 'EVENT_128'), ('e_989e36b5', 'EVENT_129'), ('e_989e36c7', 'EVENT_130'), ('e_989e36db', 'EVENT_131'), ('e_989e36ec', 'EVENT_132'), ('e_989e36fe', 'EVENT_133'), ('e_989e3712', 'EVENT_134'), ('e_989e3726', 'EVENT_135'), ('e_989e3739', 'EVENT_136'), ('e_989e374b', 'EVENT_137'), ('e_989e375c', 'EVENT_138'), ('e_989e376e', 'EVENT_139'), ('e_989e377e', 'EVENT_140'), ('e_989e3791', 'EVENT_141'), ('e_989e37a4', 'EVENT_142'), ('e_989e37b7', 'EVENT_143'), ('e_989e37cb', 'EVENT_144'), ('e_989e37dd', 'EVENT_145'), ('e_989e37f0', 'EVENT_146'), ('e_989e3804', 'EVENT_147'), ('e_989e3817', 'EVENT_148'), ('e_989e382a', 'EVENT_149'), ('e_989e383e', 'EVENT_150'), ('e_989e3850', 'EVENT_151'), ('e_989e3862', 'EVENT_152'), ('e_989e3874', 'EVENT_153'), ('e_989e3886', 'EVENT_154'), ('e_989e3898', 'EVENT_155'), ('e_989e38ad', 'EVENT_156'), ('e_989e38c1', 'EVENT_157'), ('e_989e38d3', 'EVENT_158'), ('e_989e38e5', 'EVENT_159'), ('e_989e38f9', 'EVENT_160'), ('e_989e390b', 'EVENT_161'), ('e_989e391e', 'EVENT_162'), ('e_989e3931', 'EVENT_163'), ('e_989e3945', 'EVENT_164'), ('e_989e395a', 'EVENT_165'), ('e_989e396d', 'EVENT_166'), ('e_989e3980', 'EVENT_167'), ('e_989e39a1', 'EVENT_168'), ('e_989e39b5', 'EVENT_169'), ('e_989e39c7', 'EVENT_170'), ('e_989e39da', 'EVENT_171'), ('e_989e39ed', 'EVENT_172'), ('e_989e39ff', 'EVENT_173'), ('e_989e3a11', 'EVENT_174'), ('e_989e3a24', 'EVENT_175'), ('e_989e3a3a', 'EVENT_176'), ('e_989e3a81', 'EVENT_177'), ('e_989e3a9b', 'EVENT_178'), ('e_989e3ab0', 'EVENT_179'), ('e_989e3ac1', 'EVENT_180'), ('e_989e3ad2', 'EVENT_181'), ('e_989e3ae7', 'EVENT_182'), ('e_989e3afc', 'EVENT_183'), ('e_989e3b0f', 'EVENT_184'), ('e_989e3b24', 'EVENT_185'), ('e_989e3b3c', 'EVENT_186'), ('e_989e3b54', 'EVENT_187'), ('e_989e3b6f', 'EVENT_188'), ('e_989e3b86', 'EVENT_189'), ('e_989e3ba5', 'EVENT_190'), ('e_989e3bc6', 'EVENT_191'), ('e_989e3be1', 'EVENT_192'), ('e_989e3bff', 'EVENT_193'), ('e_989e3c1a', 'EVENT_194'), ('e_989e3c3d', 'EVENT_195'), ('e_989e3c5f', 'EVENT_196'), ('e_989e3c81', 'EVENT_197'), ('e_989e3ca0', 'EVENT_198'), ('e_989e3cc2', 'EVENT_199'), ('e_989e3ce6', 'EVENT_200');
COMMIT;

-- ----------------------------
--  Table structure for `group`
-- ----------------------------
DROP TABLE IF EXISTS `group`;
CREATE TABLE `group` (
  `group_id` char(10) NOT NULL,
  `group_name` varchar(50) DEFAULT NULL,
  `group_manager` char(10) DEFAULT NULL,
  PRIMARY KEY (`group_id`),
  KEY `group_manager` (`group_manager`),
  CONSTRAINT `gm` FOREIGN KEY (`group_manager`) REFERENCES `account` (`account_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `group`
-- ----------------------------
BEGIN;
INSERT INTO `group` VALUES ('g_d9jakd92', '信息中心', 'u_sd92jd9');
COMMIT;

-- ----------------------------
--  Table structure for `group_event_map`
-- ----------------------------
DROP TABLE IF EXISTS `group_event_map`;
CREATE TABLE `group_event_map` (
  `group_id` char(10) NOT NULL,
  `event_id` char(10) NOT NULL,
  PRIMARY KEY (`group_id`,`event_id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `group_event_id` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`) ON DELETE CASCADE,
  CONSTRAINT `group_id` FOREIGN KEY (`group_id`) REFERENCES `group` (`group_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `privilege`
-- ----------------------------
DROP TABLE IF EXISTS `privilege`;
CREATE TABLE `privilege` (
  `account_id` char(10) NOT NULL,
  `account` int(2) DEFAULT NULL,
  `mission` int(2) DEFAULT NULL,
  `group` int(2) DEFAULT NULL,
  `system` int(2) DEFAULT NULL,
  PRIMARY KEY (`account_id`),
  CONSTRAINT `account_id` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `privilege`
-- ----------------------------
BEGIN;
INSERT INTO `privilege` VALUES ('u_8jda9dj2', '5', '7', '8', '3'), ('u_sd92jd9', '2', '1', '1', null);
COMMIT;

-- ----------------------------
--  Table structure for `record`
-- ----------------------------
DROP TABLE IF EXISTS `record`;
CREATE TABLE `record` (
  `record_id` char(6) NOT NULL,
  `post_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `reporter_name` varchar(12) DEFAULT NULL,
  `reporter_id` char(8) DEFAULT NULL,
  `reporter_tel` char(11) DEFAULT NULL,
  `status` int(1) DEFAULT NULL,
  `zone_id` char(6) DEFAULT NULL,
  `event_id` char(6) DEFAULT NULL,
  `detalis` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`record_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Table structure for `zone`
-- ----------------------------
DROP TABLE IF EXISTS `zone`;
CREATE TABLE `zone` (
  `zone_id` int(4) NOT NULL,
  `zone_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`zone_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
--  Records of `zone`
-- ----------------------------
BEGIN;
INSERT INTO `zone` VALUES ('1000', '宿舍区'), ('1002', '1212'), ('1003', '明德楼'), ('1004', 'T-ZONE-B'), ('1005', 'T-ZONE-C'), ('1006', 'T-ZONE-D'), ('1007', 'T-ZONE-D'), ('1008', 'T-ZONE-D'), ('1100', '教室区'), ('1102', '朝晖楼'), ('1103', 'TEST-ZONE'), ('1104', 'TEST-ZONE'), ('1105', 'TEST-ZONE'), ('1106', 'TEST-ZONE'), ('1107', 'TEST-ZONE'), ('2000', 'Test-Zone'), ('2002', 'TEST-ZONE'), ('2003', 'TEST-ZONE-A'), ('2100', 'Subs-Zone'), ('2200', 'Subs-Zone'), ('2400', 'Subs-Zone'), ('2500', 'TEST-ZONE'), ('2600', 'TEST-ZONE'), ('2700', 'TEST-ZONE'), ('2800', 'TEST-ZONE'), ('2900', 'TEST-ZONE'), ('3000', 'TEST-ZONE-A');
COMMIT;

-- ----------------------------
--  Table structure for `zone_event_map`
-- ----------------------------
DROP TABLE IF EXISTS `zone_event_map`;
CREATE TABLE `zone_event_map` (
  `zone_id` int(4) NOT NULL,
  `event_id` char(10) NOT NULL,
  PRIMARY KEY (`event_id`,`zone_id`),
  KEY `event_id` (`event_id`),
  KEY `zone_id` (`zone_id`),
  CONSTRAINT `event_id` FOREIGN KEY (`event_id`) REFERENCES `event` (`event_id`) ON DELETE CASCADE,
  CONSTRAINT `zone_id` FOREIGN KEY (`zone_id`) REFERENCES `zone` (`zone_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET FOREIGN_KEY_CHECKS = 1;
