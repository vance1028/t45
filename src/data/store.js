'use strict';

/**
 * 数据仓储层 - 基于 MySQL（mysql2/promise）。
 * 所有方法 async，返回 camelCase 字段对象。
 */

const { pool } = require('../db');

/* ----------------------------- 映射 ----------------------------- */

function mapStudent(r) {
  if (!r) return null;
  return {
    id: r.id,
    studentNo: r.student_no,
    name: r.name,
    grade: r.grade,
    school: r.school,
    guardianName: r.guardian_name,
    guardianPhone: r.guardian_phone,
    allergies: r.allergies,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapPlan(r) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    meals: r.meals,
    priceCents: r.price_cents,
    period: r.period,
    description: r.description,
    active: !!r.active,
    createdAt: r.created_at,
  };
}

function mapEnrollment(r) {
  if (!r) return null;
  return {
    id: r.id,
    studentId: r.student_id,
    planId: r.plan_id,
    startDate: r.start_date,
    endDate: r.end_date,
    amountCents: r.amount_cents,
    paid: !!r.paid,
    status: r.status,
    createdAt: r.created_at,
  };
}

function mapMenu(r) {
  if (!r) return null;
  return {
    id: r.id,
    menuDate: r.menu_date,
    meal: r.meal,
    dishes: r.dishes,
    createdAt: r.created_at,
  };
}

function mapAttendance(r) {
  if (!r) return null;
  return {
    id: r.id,
    studentId: r.student_id,
    attendDate: r.attend_date,
    meal: r.meal,
    status: r.status,
    pickedUpBy: r.picked_up_by,
    checkedAt: r.checked_at,
    remark: r.remark,
  };
}

function mapBus(r) {
  if (!r) return null;
  return {
    id: r.id,
    plateNumber: r.plate_number,
    capacity: r.capacity,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapStation(r) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    address: r.address,
    createdAt: r.created_at,
  };
}

function mapRoute(r) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    direction: r.direction,
    busId: r.bus_id,
    active: !!r.active,
    description: r.description,
    createdAt: r.created_at,
  };
}

function mapRouteStation(r) {
  if (!r) return null;
  return {
    id: r.id,
    routeId: r.route_id,
    stationId: r.station_id,
    stopOrder: r.stop_order,
    estimatedArr: r.estimated_arr,
  };
}

function mapBusBinding(r) {
  if (!r) return null;
  return {
    id: r.id,
    studentId: r.student_id,
    routeId: r.route_id,
    boardStationId: r.board_station_id,
    alightStationId: r.alight_station_id,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function mapRoster(r) {
  if (!r) return null;
  return {
    id: r.id,
    rosterDate: r.roster_date,
    routeId: r.route_id,
    busId: r.bus_id,
    status: r.status,
    createdAt: r.created_at,
  };
}

function mapRosterStudent(r) {
  if (!r) return null;
  return {
    id: r.id,
    rosterId: r.roster_id,
    studentId: r.student_id,
    seatNo: r.seat_no,
    boardStationId: r.board_station_id,
    alightStationId: r.alight_station_id,
    status: r.status,
    createdAt: r.created_at,
  };
}

function mapCheckin(r) {
  if (!r) return null;
  return {
    id: r.id,
    rosterStudentId: r.roster_student_id,
    stationId: r.station_id,
    action: r.action,
    checkedBy: r.checked_by,
    remark: r.remark,
    createdAt: r.created_at,
  };
}

/* --------------------------- 初始化/重置 --------------------------- */

async function seed() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const t of [
      'checkins', 'roster_students', 'daily_rosters',
      'student_bus_bindings', 'route_stations', 'routes',
      'stations', 'buses',
      'attendances', 'enrollments', 'daily_menus', 'meal_plans', 'students',
    ]) {
      await conn.query(`TRUNCATE TABLE ${t}`);
    }
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    await conn.query(
      `INSERT INTO students (id, student_no, name, grade, school, guardian_name, guardian_phone, allergies, status) VALUES
        (1,'XS2026001','小明','三年级','实验小学','王女士','13800001111','花生','ACTIVE'),
        (2,'XS2026002','小红','四年级','实验小学','李先生','13800002222','','ACTIVE'),
        (3,'XS2026003','小刚','二年级','中心小学','张女士','13800003333','海鲜','ACTIVE'),
        (4,'XS2026004','小丽','五年级','中心小学','赵先生','13800004444','','INACTIVE')`,
    );
    await conn.query(
      `INSERT INTO meal_plans (id, name, meals, price_cents, period, description, active) VALUES
        (1,'工作日午餐月套餐','LUNCH',60000,'MONTHLY','周一至周五午餐',1),
        (2,'午晚两餐月套餐','LUNCH,DINNER',99000,'MONTHLY','周一至周五午餐+晚餐含作业辅导',1),
        (3,'单日午餐','LUNCH',3000,'DAILY','临时单日午餐',1)`,
    );
    await conn.query(
      `INSERT INTO enrollments (id, student_id, plan_id, start_date, end_date, amount_cents, paid, status) VALUES
        (1,1,1,'2026-06-01','2026-06-30',60000,1,'ACTIVE'),
        (2,2,2,'2026-06-01','2026-06-30',99000,1,'ACTIVE'),
        (3,3,1,'2026-06-01','2026-06-30',60000,0,'ACTIVE')`,
    );
    await conn.query(
      `INSERT INTO daily_menus (id, menu_date, meal, dishes) VALUES
        (1,'2026-06-05','LUNCH','红烧鸡腿、清炒时蔬、紫菜蛋汤、米饭'),
        (2,'2026-06-05','DINNER','番茄牛腩、蒜蓉西兰花、米饭'),
        (3,'2026-06-06','LUNCH','糖醋里脊、麻婆豆腐、冬瓜汤、米饭')`,
    );
    await conn.query(
      `INSERT INTO attendances (id, student_id, attend_date, meal, status, picked_up_by, remark) VALUES
        (1,1,'2026-06-05','LUNCH','PRESENT','','正常用餐'),
        (2,2,'2026-06-05','LUNCH','PRESENT','','正常用餐'),
        (3,3,'2026-06-05','LUNCH','ABSENT','','家长请假')`,
    );
    await conn.query(
      `INSERT INTO buses (id, plate_number, capacity, status) VALUES
        (1,'京A·12345',19,'ACTIVE'),
        (2,'京B·67890',45,'ACTIVE')`,
    );
    await conn.query(
      `INSERT INTO stations (id, name, type, address) VALUES
        (1,'实验小学','SCHOOL','实验小学南门'),
        (2,'中心小学','SCHOOL','中心小学东门'),
        (3,'小饭桌中心','CENTER','幸福路88号'),
        (4,'阳光花园站','RESIDENTIAL','阳光花园小区北门'),
        (5,'翠湖名苑站','RESIDENTIAL','翠湖名苑西门'),
        (6,'康乐小区站','RESIDENTIAL','康乐小区东门')`,
    );
    await conn.query(
      `INSERT INTO routes (id, name, direction, bus_id, active, description) VALUES
        (1,'接程1号线-实验小学','PICKUP',1,1,'放学接实验小学学生回小饭桌'),
        (2,'接程2号线-中心小学','PICKUP',2,1,'放学接中心小学学生回小饭桌'),
        (3,'送程1号线','DROPOFF',1,1,'晚饭后送学生回各小区')`,
    );
    await conn.query(
      `INSERT INTO route_stations (id, route_id, station_id, stop_order, estimated_arr) VALUES
        (1,1,1,1,'15:30'),
        (2,1,3,2,'16:00'),
        (3,2,2,1,'15:40'),
        (4,2,3,2,'16:10'),
        (5,3,3,1,'18:30'),
        (6,3,4,2,'18:45'),
        (7,3,5,3,'19:00'),
        (8,3,6,4,'19:15')`,
    );
    await conn.query(
      `INSERT INTO student_bus_bindings (id, student_id, route_id, board_station_id, alight_station_id, status) VALUES
        (1,1,1,1,3,'ACTIVE'),
        (2,2,1,1,3,'ACTIVE'),
        (3,3,2,2,3,'ACTIVE'),
        (4,1,3,3,4,'ACTIVE'),
        (5,2,3,3,5,'ACTIVE'),
        (6,3,3,3,6,'ACTIVE')`,
    );
  } finally {
    conn.release();
  }
}

/* ----------------------------- 学生 ----------------------------- */

async function listStudents({ status, school } = {}) {
  const where = [];
  const params = [];
  if (status !== undefined) { where.push('status = ?'); params.push(status); }
  if (school !== undefined) { where.push('school = ?'); params.push(school); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(`SELECT * FROM students ${clause} ORDER BY id`, params);
  return rows.map(mapStudent);
}

async function getStudent(id) {
  const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
  return mapStudent(rows[0]);
}

async function findStudentByNo(studentNo) {
  const [rows] = await pool.query('SELECT * FROM students WHERE student_no = ?', [studentNo]);
  return mapStudent(rows[0]);
}

async function createStudent(s) {
  const [r] = await pool.query(
    `INSERT INTO students (student_no, name, grade, school, guardian_name, guardian_phone, allergies, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [s.studentNo, s.name, s.grade || '', s.school || '', s.guardianName || '',
     s.guardianPhone || '', s.allergies || '', s.status || 'ACTIVE'],
  );
  return getStudent(r.insertId);
}

async function updateStudent(id, patch) {
  const map = {
    name: 'name', grade: 'grade', school: 'school',
    guardianName: 'guardian_name', guardianPhone: 'guardian_phone',
    allergies: 'allergies', status: 'status',
  };
  const sets = [];
  const params = [];
  for (const [k, col] of Object.entries(map)) {
    if (patch[k] !== undefined) { sets.push(`${col} = ?`); params.push(patch[k]); }
  }
  if (sets.length) {
    sets.push('updated_at = CURRENT_TIMESTAMP(3)');
    params.push(id);
    await pool.query(`UPDATE students SET ${sets.join(', ')} WHERE id = ?`, params);
  }
  return getStudent(id);
}

async function deleteStudent(id) {
  const [r] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

/* ----------------------------- 套餐 ----------------------------- */

async function listPlans({ activeOnly } = {}) {
  const clause = activeOnly ? 'WHERE active = 1' : '';
  const [rows] = await pool.query(`SELECT * FROM meal_plans ${clause} ORDER BY id`);
  return rows.map(mapPlan);
}

async function getPlan(id) {
  const [rows] = await pool.query('SELECT * FROM meal_plans WHERE id = ?', [id]);
  return mapPlan(rows[0]);
}

async function createPlan(p) {
  const [r] = await pool.query(
    `INSERT INTO meal_plans (name, meals, price_cents, period, description, active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [p.name, p.meals || 'LUNCH', p.priceCents || 0, p.period || 'MONTHLY',
     p.description || '', p.active === false ? 0 : 1],
  );
  return getPlan(r.insertId);
}

/* ----------------------------- 报名/订餐 ----------------------------- */

async function listEnrollments({ studentId } = {}) {
  if (studentId !== undefined) {
    const [rows] = await pool.query(
      'SELECT * FROM enrollments WHERE student_id = ? ORDER BY id', [studentId]);
    return rows.map(mapEnrollment);
  }
  const [rows] = await pool.query('SELECT * FROM enrollments ORDER BY id');
  return rows.map(mapEnrollment);
}

async function getEnrollment(id) {
  const [rows] = await pool.query('SELECT * FROM enrollments WHERE id = ?', [id]);
  return mapEnrollment(rows[0]);
}

async function createEnrollment(e) {
  const [r] = await pool.query(
    `INSERT INTO enrollments (student_id, plan_id, start_date, end_date, amount_cents, paid, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [e.studentId, e.planId, e.startDate, e.endDate, e.amountCents, e.paid ? 1 : 0, e.status || 'ACTIVE'],
  );
  return getEnrollment(r.insertId);
}

async function markEnrollmentPaid(id) {
  await pool.query('UPDATE enrollments SET paid = 1 WHERE id = ?', [id]);
  return getEnrollment(id);
}

/* ----------------------------- 菜单 ----------------------------- */

async function listMenus({ date } = {}) {
  if (date !== undefined) {
    const [rows] = await pool.query(
      'SELECT * FROM daily_menus WHERE menu_date = ? ORDER BY meal', [date]);
    return rows.map(mapMenu);
  }
  const [rows] = await pool.query('SELECT * FROM daily_menus ORDER BY menu_date DESC, meal');
  return rows.map(mapMenu);
}

async function findMenu(date, meal) {
  const [rows] = await pool.query(
    'SELECT * FROM daily_menus WHERE menu_date = ? AND meal = ?', [date, meal]);
  return mapMenu(rows[0]);
}

async function upsertMenu(m) {
  await pool.query(
    `INSERT INTO daily_menus (menu_date, meal, dishes) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE dishes = VALUES(dishes)`,
    [m.menuDate, m.meal, m.dishes || ''],
  );
  return findMenu(m.menuDate, m.meal);
}

/* ----------------------------- 出勤/签到 ----------------------------- */

async function listAttendances({ date, studentId } = {}) {
  const where = [];
  const params = [];
  if (date !== undefined) { where.push('attend_date = ?'); params.push(date); }
  if (studentId !== undefined) { where.push('student_id = ?'); params.push(studentId); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT * FROM attendances ${clause} ORDER BY attend_date DESC, id`, params);
  return rows.map(mapAttendance);
}

async function findAttendance(studentId, date, meal) {
  const [rows] = await pool.query(
    'SELECT * FROM attendances WHERE student_id = ? AND attend_date = ? AND meal = ?',
    [studentId, date, meal]);
  return mapAttendance(rows[0]);
}

async function createAttendance(a) {
  const [r] = await pool.query(
    `INSERT INTO attendances (student_id, attend_date, meal, status, picked_up_by, remark)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [a.studentId, a.attendDate, a.meal, a.status || 'PRESENT', a.pickedUpBy || '', a.remark || ''],
  );
  const [rows] = await pool.query('SELECT * FROM attendances WHERE id = ?', [r.insertId]);
  return mapAttendance(rows[0]);
}

/* ----------------------------- 校车 ----------------------------- */

async function listBuses({ status } = {}) {
  const where = [];
  const params = [];
  if (status !== undefined) { where.push('status = ?'); params.push(status); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(`SELECT * FROM buses ${clause} ORDER BY id`, params);
  return rows.map(mapBus);
}

async function getBus(id) {
  const [rows] = await pool.query('SELECT * FROM buses WHERE id = ?', [id]);
  return mapBus(rows[0]);
}

async function findBusByPlate(plateNumber) {
  const [rows] = await pool.query('SELECT * FROM buses WHERE plate_number = ?', [plateNumber]);
  return mapBus(rows[0]);
}

async function createBus(b) {
  const [r] = await pool.query(
    `INSERT INTO buses (plate_number, capacity, status) VALUES (?, ?, ?)`,
    [b.plateNumber, b.capacity || 0, b.status || 'ACTIVE'],
  );
  return getBus(r.insertId);
}

async function updateBus(id, patch) {
  const map = { plateNumber: 'plate_number', capacity: 'capacity', status: 'status' };
  const sets = [];
  const params = [];
  for (const [k, col] of Object.entries(map)) {
    if (patch[k] !== undefined) { sets.push(`${col} = ?`); params.push(patch[k]); }
  }
  if (sets.length) {
    sets.push('updated_at = CURRENT_TIMESTAMP(3)');
    params.push(id);
    await pool.query(`UPDATE buses SET ${sets.join(', ')} WHERE id = ?`, params);
  }
  return getBus(id);
}

async function deleteBus(id) {
  const [r] = await pool.query('DELETE FROM buses WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

/* ----------------------------- 站点 ----------------------------- */

async function listStations({ type } = {}) {
  const where = [];
  const params = [];
  if (type !== undefined) { where.push('type = ?'); params.push(type); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(`SELECT * FROM stations ${clause} ORDER BY id`, params);
  return rows.map(mapStation);
}

async function getStation(id) {
  const [rows] = await pool.query('SELECT * FROM stations WHERE id = ?', [id]);
  return mapStation(rows[0]);
}

async function createStation(s) {
  const [r] = await pool.query(
    `INSERT INTO stations (name, type, address) VALUES (?, ?, ?)`,
    [s.name, s.type || 'SCHOOL', s.address || ''],
  );
  return getStation(r.insertId);
}

async function updateStation(id, patch) {
  const map = { name: 'name', type: 'type', address: 'address' };
  const sets = [];
  const params = [];
  for (const [k, col] of Object.entries(map)) {
    if (patch[k] !== undefined) { sets.push(`${col} = ?`); params.push(patch[k]); }
  }
  if (sets.length) {
    params.push(id);
    await pool.query(`UPDATE stations SET ${sets.join(', ')} WHERE id = ?`, params);
  }
  return getStation(id);
}

async function deleteStation(id) {
  const [r] = await pool.query('DELETE FROM stations WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

/* ----------------------------- 路线 ----------------------------- */

async function listRoutes({ direction, activeOnly } = {}) {
  const where = [];
  const params = [];
  if (direction !== undefined) { where.push('direction = ?'); params.push(direction); }
  if (activeOnly) { where.push('active = 1'); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(`SELECT * FROM routes ${clause} ORDER BY id`, params);
  return rows.map(mapRoute);
}

async function getRoute(id) {
  const [rows] = await pool.query('SELECT * FROM routes WHERE id = ?', [id]);
  return mapRoute(rows[0]);
}

async function getRouteWithStations(id) {
  const route = await getRoute(id);
  if (!route) return null;
  const [rows] = await pool.query(
    `SELECT rs.*, s.name AS station_name, s.type AS station_type, s.address AS station_address
     FROM route_stations rs
     JOIN stations s ON s.id = rs.station_id
     WHERE rs.route_id = ? ORDER BY rs.stop_order`, [id]);
  route.stations = rows.map((r) => ({
    ...mapRouteStation(r),
    stationName: r.station_name,
    stationType: r.station_type,
    stationAddress: r.station_address,
  }));
  return route;
}

async function createRoute(r) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [res] = await conn.query(
      `INSERT INTO routes (name, direction, bus_id, active, description) VALUES (?, ?, ?, ?, ?)`,
      [r.name, r.direction || 'PICKUP', r.busId, r.active === false ? 0 : 1, r.description || ''],
    );
    const routeId = res.insertId;
    if (Array.isArray(r.stations) && r.stations.length) {
      for (let i = 0; i < r.stations.length; i += 1) {
        const st = r.stations[i];
        await conn.query(
          `INSERT INTO route_stations (route_id, station_id, stop_order, estimated_arr) VALUES (?, ?, ?, ?)`,
          [routeId, st.stationId, i + 1, st.estimatedArr || ''],
        );
      }
    }
    await conn.commit();
    return getRouteWithStations(routeId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function updateRoute(id, patch) {
  const map = { name: 'name', direction: 'direction', busId: 'bus_id', active: 'active', description: 'description' };
  const sets = [];
  const params = [];
  for (const [k, col] of Object.entries(map)) {
    if (patch[k] !== undefined) {
      const val = k === 'active' ? (patch[k] ? 1 : 0) : patch[k];
      sets.push(`${col} = ?`);
      params.push(val);
    }
  }
  if (sets.length) {
    params.push(id);
    await pool.query(`UPDATE routes SET ${sets.join(', ')} WHERE id = ?`, params);
  }
  if (Array.isArray(patch.stations)) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('DELETE FROM route_stations WHERE route_id = ?', [id]);
      for (let i = 0; i < patch.stations.length; i += 1) {
        const st = patch.stations[i];
        await conn.query(
          `INSERT INTO route_stations (route_id, station_id, stop_order, estimated_arr) VALUES (?, ?, ?, ?)`,
          [id, st.stationId, i + 1, st.estimatedArr || ''],
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
  return getRouteWithStations(id);
}

async function deleteRoute(id) {
  const [r] = await pool.query('DELETE FROM routes WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

/* ------------------------- 学生乘车绑定 ------------------------- */

async function listBusBindings({ studentId, routeId, status } = {}) {
  const where = [];
  const params = [];
  if (studentId !== undefined) { where.push('sbb.student_id = ?'); params.push(studentId); }
  if (routeId !== undefined) { where.push('sbb.route_id = ?'); params.push(routeId); }
  if (status !== undefined) { where.push('sbb.status = ?'); params.push(status); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT sbb.* FROM student_bus_bindings sbb ${clause} ORDER BY sbb.id`, params);
  return rows.map(mapBusBinding);
}

async function getBusBinding(id) {
  const [rows] = await pool.query('SELECT * FROM student_bus_bindings WHERE id = ?', [id]);
  return mapBusBinding(rows[0]);
}

async function createBusBinding(b) {
  const [r] = await pool.query(
    `INSERT INTO student_bus_bindings (student_id, route_id, board_station_id, alight_station_id, status)
     VALUES (?, ?, ?, ?, ?)`,
    [b.studentId, b.routeId, b.boardStationId, b.alightStationId, b.status || 'ACTIVE'],
  );
  return getBusBinding(r.insertId);
}

async function updateBusBinding(id, patch) {
  const map = {
    boardStationId: 'board_station_id',
    alightStationId: 'alight_station_id',
    status: 'status',
  };
  const sets = [];
  const params = [];
  for (const [k, col] of Object.entries(map)) {
    if (patch[k] !== undefined) { sets.push(`${col} = ?`); params.push(patch[k]); }
  }
  if (sets.length) {
    sets.push('updated_at = CURRENT_TIMESTAMP(3)');
    params.push(id);
    await pool.query(`UPDATE student_bus_bindings SET ${sets.join(', ')} WHERE id = ?`, params);
  }
  return getBusBinding(id);
}

async function deleteBusBinding(id) {
  const [r] = await pool.query('DELETE FROM student_bus_bindings WHERE id = ?', [id]);
  return r.affectedRows > 0;
}

/* ------------------------- 每日乘车名单 ------------------------- */

async function getRoster(id) {
  const [rows] = await pool.query('SELECT * FROM daily_rosters WHERE id = ?', [id]);
  return mapRoster(rows[0]);
}

async function findRoster(date, routeId) {
  const [rows] = await pool.query(
    'SELECT * FROM daily_rosters WHERE roster_date = ? AND route_id = ?', [date, routeId]);
  return mapRoster(rows[0]);
}

async function listRosters({ date, routeId, status } = {}) {
  const where = [];
  const params = [];
  if (date !== undefined) { where.push('roster_date = ?'); params.push(date); }
  if (routeId !== undefined) { where.push('route_id = ?'); params.push(routeId); }
  if (status !== undefined) { where.push('status = ?'); params.push(status); }
  const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [rows] = await pool.query(
    `SELECT * FROM daily_rosters ${clause} ORDER BY roster_date DESC, id`, params);
  return rows.map(mapRoster);
}

async function getRosterStudents(rosterId) {
  const [rows] = await pool.query(
    `SELECT rs.*, s.name AS student_name, s.student_no,
            bs.name AS board_station_name, als.name AS alight_station_name
     FROM roster_students rs
     JOIN students s ON s.id = rs.student_id
     JOIN stations bs ON bs.id = rs.board_station_id
     JOIN stations als ON als.id = rs.alight_station_id
     WHERE rs.roster_id = ? ORDER BY rs.seat_no`, [rosterId]);
  return rows.map((r) => ({
    ...mapRosterStudent(r),
    studentName: r.student_name,
    studentNo: r.student_no,
    boardStationName: r.board_station_name,
    alightStationName: r.alight_station_name,
  }));
}

async function generateRoster(date, routeId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [existing] = await conn.query(
      'SELECT id FROM daily_rosters WHERE roster_date = ? AND route_id = ? FOR UPDATE', [date, routeId]);
    if (existing.length) {
      await conn.rollback();
      const err = new Error('该日期该路线的乘车名单已存在');
      err.code = 'ROSTER_EXISTS';
      throw err;
    }

    const [routeRows] = await conn.query('SELECT * FROM routes WHERE id = ? AND active = 1', [routeId]);
    if (!routeRows.length) {
      await conn.rollback();
      const err = new Error('路线不存在或未启用');
      err.code = 'ROUTE_NOT_FOUND';
      throw err;
    }
    const route = routeRows[0];

    const [busRows] = await conn.query('SELECT * FROM buses WHERE id = ? AND status = \'ACTIVE\'', [route.bus_id]);
    if (!busRows.length) {
      await conn.rollback();
      const err = new Error('校车不存在或不可用');
      err.code = 'BUS_NOT_FOUND';
      throw err;
    }
    const bus = busRows[0];

    const [eligible] = await conn.query(
      `SELECT sbb.student_id, sbb.board_station_id, sbb.alight_station_id
       FROM student_bus_bindings sbb
       JOIN students s ON s.id = sbb.student_id AND s.status = 'ACTIVE'
       JOIN attendances a ON a.student_id = sbb.student_id AND a.attend_date = ? AND a.status = 'PRESENT'
       WHERE sbb.route_id = ? AND sbb.status = 'ACTIVE'
       ORDER BY sbb.id`, [date, routeId]);

    if (eligible.length > bus.capacity) {
      await conn.rollback();
      const err = new Error(`需乘车 ${eligible.length} 人，超出核载 ${bus.capacity} 人`);
      err.code = 'OVER_CAPACITY';
      throw err;
    }

    const [rosterRes] = await conn.query(
      `INSERT INTO daily_rosters (roster_date, route_id, bus_id, status) VALUES (?, ?, ?, 'ACTIVE')`,
      [date, routeId, bus.id]);
    const rosterId = rosterRes.insertId;

    for (let i = 0; i < eligible.length; i += 1) {
      const st = eligible[i];
      await conn.query(
        `INSERT INTO roster_students (roster_id, student_id, seat_no, board_station_id, alight_station_id, status)
         VALUES (?, ?, ?, ?, ?, 'EXPECTED')`,
        [rosterId, st.student_id, i + 1, st.board_station_id, st.alight_station_id],
      );
    }

    await conn.commit();
    return getRosterWithDetails(rosterId);
  } catch (err) {
    if (err.code) throw err;
    try { await conn.rollback(); } catch (_) { /* ignore */ }
    throw err;
  } finally {
    conn.release();
  }
}

async function getRosterWithDetails(id) {
  const roster = await getRoster(id);
  if (!roster) return null;
  roster.students = await getRosterStudents(id);
  return roster;
}

async function updateRosterStatus(id, status) {
  await pool.query('UPDATE daily_rosters SET status = ? WHERE id = ?', [status, id]);
  return getRoster(id);
}

async function getRosterRemainingSeats(rosterId) {
  const roster = await getRoster(rosterId);
  if (!roster) return null;
  const bus = await getBus(roster.busId);
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS cnt FROM roster_students WHERE roster_id = ?', [rosterId]);
  const used = rows[0].cnt;
  return { rosterId, capacity: bus.capacity, used, remaining: bus.capacity - used };
}

/* ------------------------- 点名核销 ------------------------- */

async function checkin(rosterId, rosterStudentId, stationId, action, checkedBy) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rsRows] = await conn.query(
      'SELECT * FROM roster_students WHERE id = ? FOR UPDATE', [rosterStudentId]);
    if (!rsRows.length) {
      await conn.rollback();
      const err = new Error('乘车名单记录不存在');
      err.code = 'RS_NOT_FOUND';
      throw err;
    }
    const rs = rsRows[0];

    if (rs.roster_id !== rosterId) {
      await conn.rollback();
      const err = new Error('该学生记录不属于当前乘车名单');
      err.code = 'RS_ROSTER_MISMATCH';
      throw err;
    }

    const [stRows] = await conn.query(
      'SELECT id FROM stations WHERE id = ? FOR UPDATE', [stationId]);
    if (!stRows.length) {
      await conn.rollback();
      const err = new Error('站点不存在');
      err.code = 'STATION_NOT_FOUND';
      throw err;
    }

    const [ckRows] = await conn.query(
      'SELECT id FROM checkins WHERE roster_student_id = ? AND action = ? FOR UPDATE',
      [rosterStudentId, action]);
    if (ckRows.length) {
      await conn.rollback();
      const err = new Error('该学生此动作已核销，不能重复核销');
      err.code = 'DUPLICATE_CHECKIN';
      throw err;
    }

    if (action === 'BOARD') {
      if (rs.status !== 'EXPECTED') {
        await conn.rollback();
        const err = new Error(`当前状态 ${rs.status} 不可上车核销，需为 EXPECTED`);
        err.code = 'INVALID_STATE';
        throw err;
      }
      if (stationId !== rs.board_station_id) {
        await conn.rollback();
        const err = new Error('上车核销站点与约定上车站点不一致');
        err.code = 'STATION_MISMATCH';
        throw err;
      }
    } else if (action === 'ALIGHT') {
      if (rs.status !== 'BOARDED') {
        await conn.rollback();
        const err = new Error(`当前状态 ${rs.status} 不可下车核销，需为 BOARDED`);
        err.code = 'INVALID_STATE';
        throw err;
      }
    } else {
      await conn.rollback();
      const err = new Error('核销动作只能是 BOARD 或 ALIGHT');
      err.code = 'INVALID_ACTION';
      throw err;
    }

    await conn.query(
      `INSERT INTO checkins (roster_student_id, station_id, action, checked_by) VALUES (?, ?, ?, ?)`,
      [rosterStudentId, stationId, action, checkedBy || ''],
    );

    let newStatus;
    if (action === 'BOARD') {
      newStatus = 'BOARDED';
    } else {
      newStatus = (stationId === rs.alight_station_id) ? 'ALIGHTED' : 'WRONG_STATION';
    }

    await conn.query(
      'UPDATE roster_students SET status = ? WHERE id = ?', [newStatus, rosterStudentId]);

    await conn.commit();

    const updated = await getRosterStudentById(rosterStudentId);
    updated._stationMatch = (action === 'ALIGHT') ? (stationId === rs.alight_station_id) : true;
    return updated;
  } catch (err) {
    if (err.code) throw err;
    try { await conn.rollback(); } catch (_) { /* ignore */ }
    throw err;
  } finally {
    conn.release();
  }
}

async function getRosterStudentById(id) {
  const [rows] = await pool.query('SELECT * FROM roster_students WHERE id = ?', [id]);
  return mapRosterStudent(rows[0]);
}

async function markMissedBoard(rosterId, rosterStudentId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rsRows] = await conn.query(
      'SELECT * FROM roster_students WHERE id = ? FOR UPDATE', [rosterStudentId]);
    if (!rsRows.length) {
      await conn.rollback();
      const err = new Error('乘车名单记录不存在');
      err.code = 'RS_NOT_FOUND';
      throw err;
    }
    if (rsRows[0].roster_id !== rosterId) {
      await conn.rollback();
      const err = new Error('该学生记录不属于当前乘车名单');
      err.code = 'RS_ROSTER_MISMATCH';
      throw err;
    }
    if (rsRows[0].status !== 'EXPECTED') {
      await conn.rollback();
      const err = new Error(`当前状态 ${rsRows[0].status} 不可标记漏接，需为 EXPECTED`);
      err.code = 'INVALID_STATE';
      throw err;
    }
    await conn.query(
      "UPDATE roster_students SET status = 'MISSED_BOARD' WHERE id = ?", [rosterStudentId]);
    await conn.commit();
    return getRosterStudentById(rosterStudentId);
  } catch (err) {
    if (err.code) throw err;
    try { await conn.rollback(); } catch (_) { /* ignore */ }
    throw err;
  } finally {
    conn.release();
  }
}

async function markMissedAlight(rosterId, rosterStudentId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [rsRows] = await conn.query(
      'SELECT * FROM roster_students WHERE id = ? FOR UPDATE', [rosterStudentId]);
    if (!rsRows.length) {
      await conn.rollback();
      const err = new Error('乘车名单记录不存在');
      err.code = 'RS_NOT_FOUND';
      throw err;
    }
    if (rsRows[0].roster_id !== rosterId) {
      await conn.rollback();
      const err = new Error('该学生记录不属于当前乘车名单');
      err.code = 'RS_ROSTER_MISMATCH';
      throw err;
    }
    if (rsRows[0].status !== 'BOARDED') {
      await conn.rollback();
      const err = new Error(`当前状态 ${rsRows[0].status} 不可标记漏站，需为 BOARDED`);
      err.code = 'INVALID_STATE';
      throw err;
    }
    await conn.query(
      "UPDATE roster_students SET status = 'MISSED_ALIGHT' WHERE id = ?", [rosterStudentId]);
    await conn.commit();
    return getRosterStudentById(rosterStudentId);
  } catch (err) {
    if (err.code) throw err;
    try { await conn.rollback(); } catch (_) { /* ignore */ }
    throw err;
  } finally {
    conn.release();
  }
}

async function getOnBusStudents(rosterId) {
  const [rows] = await pool.query(
    `SELECT rs.*, s.name AS student_name, s.student_no
     FROM roster_students rs
     JOIN students s ON s.id = rs.student_id
     WHERE rs.roster_id = ? AND rs.status = 'BOARDED' ORDER BY rs.seat_no`, [rosterId]);
  return rows.map((r) => ({
    ...mapRosterStudent(r),
    studentName: r.student_name,
    studentNo: r.student_no,
  }));
}

async function getMissedAlerts(rosterId) {
  const [missedBoard] = await pool.query(
    `SELECT rs.*, s.name AS student_name, s.student_no
     FROM roster_students rs
     JOIN students s ON s.id = rs.student_id
     WHERE rs.roster_id = ? AND rs.status IN ('MISSED_BOARD') ORDER BY rs.seat_no`, [rosterId]);
  const [missedAlight] = await pool.query(
    `SELECT rs.*, s.name AS student_name, s.student_no
     FROM roster_students rs
     JOIN students s ON s.id = rs.student_id
     WHERE rs.roster_id = ? AND rs.status IN ('MISSED_ALIGHT', 'BOARDED') ORDER BY rs.seat_no`, [rosterId]);
  const [wrongStation] = await pool.query(
    `SELECT rs.*, s.name AS student_name, s.student_no
     FROM roster_students rs
     JOIN students s ON s.id = rs.student_id
     WHERE rs.roster_id = ? AND rs.status = 'WRONG_STATION' ORDER BY rs.seat_no`, [rosterId]);
  return {
    missedBoard: missedBoard.map((r) => ({ ...mapRosterStudent(r), studentName: r.student_name, studentNo: r.student_no })),
    missedAlight: missedAlight.map((r) => ({ ...mapRosterStudent(r), studentName: r.student_name, studentNo: r.student_no })),
    wrongStation: wrongStation.map((r) => ({ ...mapRosterStudent(r), studentName: r.student_name, studentNo: r.student_no })),
  };
}

async function getStudentCheckinTrail(rosterId, studentId) {
  const [rsRows] = await pool.query(
    'SELECT id FROM roster_students WHERE roster_id = ? AND student_id = ?', [rosterId, studentId]);
  if (!rsRows.length) return [];
  const [rows] = await pool.query(
    `SELECT c.*, s.name AS station_name
     FROM checkins c
     JOIN stations s ON s.id = c.station_id
     WHERE c.roster_student_id = ? ORDER BY c.created_at`, [rsRows[0].id]);
  return rows.map((r) => ({
    ...mapCheckin(r),
    stationName: r.station_name,
  }));
}

async function getCheckinsByRoster(rosterId) {
  const [rows] = await pool.query(
    `SELECT c.*, s.name AS station_name, rs.student_id,
            st.name AS student_name, st.student_no
     FROM checkins c
     JOIN roster_students rs ON rs.id = c.roster_student_id
     JOIN stations s ON s.id = c.station_id
     JOIN students st ON st.id = rs.student_id
     WHERE rs.roster_id = ? ORDER BY c.created_at`, [rosterId]);
  return rows.map((r) => ({
    ...mapCheckin(r),
    stationName: r.station_name,
    studentId: r.student_id,
    studentName: r.student_name,
    studentNo: r.student_no,
  }));
}

module.exports = {
  seed,
  listStudents, getStudent, findStudentByNo, createStudent, updateStudent, deleteStudent,
  listPlans, getPlan, createPlan,
  listEnrollments, getEnrollment, createEnrollment, markEnrollmentPaid,
  listMenus, findMenu, upsertMenu,
  listAttendances, findAttendance, createAttendance,
  listBuses, getBus, findBusByPlate, createBus, updateBus, deleteBus,
  listStations, getStation, createStation, updateStation, deleteStation,
  listRoutes, getRoute, getRouteWithStations, createRoute, updateRoute, deleteRoute,
  listBusBindings, getBusBinding, createBusBinding, updateBusBinding, deleteBusBinding,
  getRoster, findRoster, listRosters, getRosterStudents, generateRoster,
  getRosterWithDetails, updateRosterStatus, getRosterRemainingSeats,
  checkin, getRosterStudentById, markMissedBoard, markMissedAlight,
  getOnBusStudents, getMissedAlerts, getStudentCheckinTrail, getCheckinsByRoster,
};
