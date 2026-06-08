-- 学生小饭桌管理平台 - 表结构（MySQL）

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
