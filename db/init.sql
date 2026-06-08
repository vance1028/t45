-- 容器首次初始化脚本（docker-entrypoint-initdb.d）= schema + seed 合并

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS students (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    student_no    VARCHAR(32)  NOT NULL,
    name          VARCHAR(64)  NOT NULL,
    grade         VARCHAR(32)  NOT NULL DEFAULT '',
    school        VARCHAR(128) NOT NULL DEFAULT '',
    guardian_name VARCHAR(64)  NOT NULL DEFAULT '',
    guardian_phone VARCHAR(20) NOT NULL DEFAULT '',
    allergies     VARCHAR(255) NOT NULL DEFAULT '',
    status        VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE',
    created_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_students_no (student_no),
    KEY idx_students_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS meal_plans (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    name         VARCHAR(64)  NOT NULL,
    meals        VARCHAR(64)  NOT NULL DEFAULT 'LUNCH',
    price_cents  INT          NOT NULL DEFAULT 0,
    period       VARCHAR(16)  NOT NULL DEFAULT 'MONTHLY',
    description  VARCHAR(500) NOT NULL DEFAULT '',
    active       TINYINT(1)   NOT NULL DEFAULT 1,
    created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS enrollments (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    student_id   BIGINT       NOT NULL,
    plan_id      BIGINT       NOT NULL,
    start_date   DATE         NOT NULL,
    end_date     DATE         NOT NULL,
    amount_cents INT          NOT NULL DEFAULT 0,
    paid         TINYINT(1)   NOT NULL DEFAULT 0,
    status       VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE',
    created_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    KEY idx_enroll_student (student_id),
    KEY idx_enroll_plan (plan_id),
    CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    CONSTRAINT fk_enroll_plan FOREIGN KEY (plan_id) REFERENCES meal_plans (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS daily_menus (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    menu_date   DATE         NOT NULL,
    meal        VARCHAR(16)  NOT NULL DEFAULT 'LUNCH',
    dishes      VARCHAR(1000) NOT NULL DEFAULT '',
    created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_menu_date_meal (menu_date, meal)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendances (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    student_id   BIGINT       NOT NULL,
    attend_date  DATE         NOT NULL,
    meal         VARCHAR(16)  NOT NULL DEFAULT 'LUNCH',
    status       VARCHAR(16)  NOT NULL DEFAULT 'PRESENT',
    picked_up_by VARCHAR(64)  NOT NULL DEFAULT '',
    checked_at   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    remark       VARCHAR(255) NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    UNIQUE KEY uk_attend (student_id, attend_date, meal),
    KEY idx_attend_date (attend_date),
    CONSTRAINT fk_attend_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO students (id, student_no, name, grade, school, guardian_name, guardian_phone, allergies, status) VALUES
  (1, 'XS2026001', '小明', '三年级', '实验小学', '王女士', '13800001111', '花生', 'ACTIVE'),
  (2, 'XS2026002', '小红', '四年级', '实验小学', '李先生', '13800002222', '', 'ACTIVE'),
  (3, 'XS2026003', '小刚', '二年级', '中心小学', '张女士', '13800003333', '海鲜', 'ACTIVE'),
  (4, 'XS2026004', '小丽', '五年级', '中心小学', '赵先生', '13800004444', '', 'INACTIVE');

INSERT IGNORE INTO meal_plans (id, name, meals, price_cents, period, description, active) VALUES
  (1, '工作日午餐月套餐', 'LUNCH', 60000, 'MONTHLY', '周一至周五午餐', 1),
  (2, '午晚两餐月套餐', 'LUNCH,DINNER', 99000, 'MONTHLY', '周一至周五午餐+晚餐含作业辅导', 1),
  (3, '单日午餐', 'LUNCH', 3000, 'DAILY', '临时单日午餐', 1);

INSERT IGNORE INTO enrollments (id, student_id, plan_id, start_date, end_date, amount_cents, paid, status) VALUES
  (1, 1, 1, '2026-06-01', '2026-06-30', 60000, 1, 'ACTIVE'),
  (2, 2, 2, '2026-06-01', '2026-06-30', 99000, 1, 'ACTIVE'),
  (3, 3, 1, '2026-06-01', '2026-06-30', 60000, 0, 'ACTIVE');

INSERT IGNORE INTO daily_menus (id, menu_date, meal, dishes) VALUES
  (1, '2026-06-05', 'LUNCH', '红烧鸡腿、清炒时蔬、紫菜蛋汤、米饭'),
  (2, '2026-06-05', 'DINNER', '番茄牛腩、蒜蓉西兰花、米饭'),
  (3, '2026-06-06', 'LUNCH', '糖醋里脊、麻婆豆腐、冬瓜汤、米饭');

INSERT IGNORE INTO attendances (id, student_id, attend_date, meal, status, picked_up_by, remark) VALUES
  (1, 1, '2026-06-05', 'LUNCH', 'PRESENT', '', '正常用餐'),
  (2, 2, '2026-06-05', 'LUNCH', 'PRESENT', '', '正常用餐'),
  (3, 3, '2026-06-05', 'LUNCH', 'ABSENT', '', '家长请假');

-- ====================== 校车调度模块 ======================

CREATE TABLE IF NOT EXISTS buses (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    plate_number  VARCHAR(20)  NOT NULL,
    capacity      INT          NOT NULL DEFAULT 0,
    status        VARCHAR(16)  NOT NULL DEFAULT 'ACTIVE',
    created_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_buses_plate (plate_number),
    KEY idx_buses_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS stations (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    name       VARCHAR(64)  NOT NULL,
    type       VARCHAR(16)  NOT NULL DEFAULT 'SCHOOL',
    address    VARCHAR(255) NOT NULL DEFAULT '',
    created_at DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    KEY idx_stations_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS routes (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(64)  NOT NULL,
    direction   VARCHAR(16)  NOT NULL DEFAULT 'PICKUP',
    bus_id      BIGINT       NOT NULL,
    active      TINYINT(1)   NOT NULL DEFAULT 1,
    description VARCHAR(500) NOT NULL DEFAULT '',
    created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    KEY idx_routes_direction (direction),
    KEY idx_routes_bus (bus_id),
    CONSTRAINT fk_route_bus FOREIGN KEY (bus_id) REFERENCES buses (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS route_stations (
    id            BIGINT      NOT NULL AUTO_INCREMENT,
    route_id      BIGINT      NOT NULL,
    station_id    BIGINT      NOT NULL,
    stop_order    INT         NOT NULL,
    estimated_arr VARCHAR(8)  NOT NULL DEFAULT '',
    PRIMARY KEY (id),
    UNIQUE KEY uk_rs_route_station (route_id, station_id),
    UNIQUE KEY uk_rs_route_order (route_id, stop_order),
    CONSTRAINT fk_rs_route FOREIGN KEY (route_id) REFERENCES routes (id) ON DELETE CASCADE,
    CONSTRAINT fk_rs_station FOREIGN KEY (station_id) REFERENCES stations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_bus_bindings (
    id               BIGINT      NOT NULL AUTO_INCREMENT,
    student_id       BIGINT      NOT NULL,
    route_id         BIGINT      NOT NULL,
    board_station_id BIGINT      NOT NULL,
    alight_station_id BIGINT     NOT NULL,
    status           VARCHAR(16) NOT NULL DEFAULT 'ACTIVE',
    created_at       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_sbb_student_route (student_id, route_id),
    KEY idx_sbb_route (route_id),
    CONSTRAINT fk_sbb_student FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
    CONSTRAINT fk_sbb_route FOREIGN KEY (route_id) REFERENCES routes (id) ON DELETE CASCADE,
    CONSTRAINT fk_sbb_board FOREIGN KEY (board_station_id) REFERENCES stations (id),
    CONSTRAINT fk_sbb_alight FOREIGN KEY (alight_station_id) REFERENCES stations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS daily_rosters (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    roster_date DATE         NOT NULL,
    route_id    BIGINT       NOT NULL,
    bus_id      BIGINT       NOT NULL,
    status      VARCHAR(16)  NOT NULL DEFAULT 'DRAFT',
    created_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_roster_date_route (roster_date, route_id),
    KEY idx_roster_date (roster_date),
    CONSTRAINT fk_roster_route FOREIGN KEY (route_id) REFERENCES routes (id),
    CONSTRAINT fk_roster_bus FOREIGN KEY (bus_id) REFERENCES buses (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roster_students (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    roster_id        BIGINT       NOT NULL,
    student_id       BIGINT       NOT NULL,
    seat_no          INT          NOT NULL,
    board_station_id BIGINT       NOT NULL,
    alight_station_id BIGINT      NOT NULL,
    status           VARCHAR(16)  NOT NULL DEFAULT 'EXPECTED',
    created_at       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_rs_roster_student (roster_id, student_id),
    UNIQUE KEY uk_rs_roster_seat (roster_id, seat_no),
    KEY idx_rstudent_status (status),
    CONSTRAINT fk_rstudent_roster FOREIGN KEY (roster_id) REFERENCES daily_rosters (id) ON DELETE CASCADE,
    CONSTRAINT fk_rstudent_student FOREIGN KEY (student_id) REFERENCES students (id),
    CONSTRAINT fk_rstudent_board FOREIGN KEY (board_station_id) REFERENCES stations (id),
    CONSTRAINT fk_rstudent_alight FOREIGN KEY (alight_station_id) REFERENCES stations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS checkins (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    roster_student_id BIGINT       NOT NULL,
    station_id        BIGINT       NOT NULL,
    action            VARCHAR(16)  NOT NULL,
    checked_by        VARCHAR(64)  NOT NULL DEFAULT '',
    remark            VARCHAR(255) NOT NULL DEFAULT '',
    created_at        DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (id),
    UNIQUE KEY uk_checkin_student_action (roster_student_id, action),
    KEY idx_checkin_station (station_id),
    CONSTRAINT fk_checkin_rstudent FOREIGN KEY (roster_student_id) REFERENCES roster_students (id) ON DELETE CASCADE,
    CONSTRAINT fk_checkin_station FOREIGN KEY (station_id) REFERENCES stations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 校车种子数据
INSERT IGNORE INTO buses (id, plate_number, capacity, status) VALUES
  (1, '京A·12345', 19, 'ACTIVE'),
  (2, '京B·67890', 45, 'ACTIVE');

INSERT IGNORE INTO stations (id, name, type, address) VALUES
  (1, '实验小学', 'SCHOOL', '实验小学南门'),
  (2, '中心小学', 'SCHOOL', '中心小学东门'),
  (3, '小饭桌中心', 'CENTER', '幸福路88号'),
  (4, '阳光花园站', 'RESIDENTIAL', '阳光花园小区北门'),
  (5, '翠湖名苑站', 'RESIDENTIAL', '翠湖名苑西门'),
  (6, '康乐小区站', 'RESIDENTIAL', '康乐小区东门');

INSERT IGNORE INTO routes (id, name, direction, bus_id, active, description) VALUES
  (1, '接程1号线-实验小学', 'PICKUP', 1, 1, '放学接实验小学学生回小饭桌'),
  (2, '接程2号线-中心小学', 'PICKUP', 2, 1, '放学接中心小学学生回小饭桌'),
  (3, '送程1号线', 'DROPOFF', 1, 1, '晚饭后送学生回各小区');

INSERT IGNORE INTO route_stations (id, route_id, station_id, stop_order, estimated_arr) VALUES
  (1,  1, 1, 1, '15:30'),
  (2,  1, 3, 2, '16:00'),
  (3,  2, 2, 1, '15:40'),
  (4,  2, 3, 2, '16:10'),
  (5,  3, 3, 1, '18:30'),
  (6,  3, 4, 2, '18:45'),
  (7,  3, 5, 3, '19:00'),
  (8,  3, 6, 4, '19:15');

INSERT IGNORE INTO student_bus_bindings (id, student_id, route_id, board_station_id, alight_station_id, status) VALUES
  (1, 1, 1, 1, 3, 'ACTIVE'),
  (2, 2, 1, 1, 3, 'ACTIVE'),
  (3, 3, 2, 2, 3, 'ACTIVE'),
  (4, 1, 3, 3, 4, 'ACTIVE'),
  (5, 2, 3, 3, 5, 'ACTIVE'),
  (6, 3, 3, 3, 6, 'ACTIVE');
