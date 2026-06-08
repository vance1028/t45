'use strict';

const express = require('express');
const store = require('../data/store');
const { sendError, toPositiveInt, isValidDate, isNonEmptyString } = require('../utils/http');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const VALID_ROSTER_STATUS = ['DRAFT', 'ACTIVE', 'COMPLETED'];
const VALID_CHECKIN_ACTION = ['BOARD', 'ALIGHT'];

router.get('/', wrap(async (req, res) => {
  const { date, routeId, status } = req.query;
  const filters = {};
  if (date !== undefined) {
    if (!isValidDate(date)) return sendError(res, 400, '日期格式必须为 YYYY-MM-DD');
    filters.date = date;
  }
  if (routeId !== undefined) {
    const rid = toPositiveInt(routeId);
    if (rid === null) return sendError(res, 400, '无效的路线 ID');
    filters.routeId = rid;
  }
  if (status !== undefined) {
    if (!VALID_ROSTER_STATUS.includes(status)) return sendError(res, 400, '名单状态只能是 DRAFT / ACTIVE / COMPLETED');
    filters.status = status;
  }
  const list = await store.listRosters(filters);
  res.json({ data: list, total: list.length });
}));

router.get('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的名单 ID');
  const roster = await store.getRosterWithDetails(id);
  if (!roster) return sendError(res, 404, '乘车名单不存在');
  res.json({ data: roster });
}));

router.post('/generate', wrap(async (req, res) => {
  const b = req.body || {};
  if (!isValidDate(b.date)) return sendError(res, 400, '日期格式必须为 YYYY-MM-DD');
  const routeId = toPositiveInt(b.routeId);
  if (routeId === null) return sendError(res, 400, '必须指定有效的路线 ID');
  try {
    const roster = await store.generateRoster(b.date, routeId);
    res.status(201).json({ data: roster });
  } catch (err) {
    if (err.code === 'ROSTER_EXISTS') return sendError(res, 409, err.message);
    if (err.code === 'ROUTE_NOT_FOUND') return sendError(res, 400, err.message);
    if (err.code === 'BUS_NOT_FOUND') return sendError(res, 400, err.message);
    if (err.code === 'OVER_CAPACITY') return sendError(res, 400, err.message);
    throw err;
  }
}));

router.put('/:id/status', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的名单 ID');
  if (!(await store.getRoster(id))) return sendError(res, 404, '乘车名单不存在');
  const b = req.body || {};
  if (!VALID_ROSTER_STATUS.includes(b.status)) return sendError(res, 400, '名单状态只能是 DRAFT / ACTIVE / COMPLETED');
  const updated = await store.updateRosterStatus(id, b.status);
  res.json({ data: updated });
}));

router.get('/:id/seats', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的名单 ID');
  const info = await store.getRosterRemainingSeats(id);
  if (!info) return sendError(res, 404, '乘车名单不存在');
  res.json({ data: info });
}));

router.get('/:id/students', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的名单 ID');
  if (!(await store.getRoster(id))) return sendError(res, 404, '乘车名单不存在');
  const students = await store.getRosterStudents(id);
  res.json({ data: students, total: students.length });
}));

router.post('/:id/checkin', wrap(async (req, res) => {
  const rosterId = toPositiveInt(req.params.id);
  if (rosterId === null) return sendError(res, 400, '无效的名单 ID');
  const b = req.body || {};
  const rosterStudentId = toPositiveInt(b.rosterStudentId);
  if (rosterStudentId === null) return sendError(res, 400, '必须指定有效的名单学生记录 ID');
  const stationId = toPositiveInt(b.stationId);
  if (stationId === null) return sendError(res, 400, '必须指定有效的站点 ID');
  if (!VALID_CHECKIN_ACTION.includes(b.action)) return sendError(res, 400, '核销动作只能是 BOARD / ALIGHT');
  try {
    const result = await store.checkin(rosterStudentId, stationId, b.action, b.checkedBy || '');
    const response = { data: result };
    if (result._stationMatch === false) {
      response.warning = '学生在非约定站点下车，已标记为错站';
    }
    delete result._stationMatch;
    res.status(201).json(response);
  } catch (err) {
    if (err.code === 'RS_NOT_FOUND') return sendError(res, 404, err.message);
    if (err.code === 'DUPLICATE_CHECKIN') return sendError(res, 409, err.message);
    if (err.code === 'INVALID_STATE') return sendError(res, 400, err.message);
    if (err.code === 'STATION_MISMATCH') return sendError(res, 400, err.message);
    if (err.code === 'INVALID_ACTION') return sendError(res, 400, err.message);
    throw err;
  }
}));

router.post('/:id/missed-board', wrap(async (req, res) => {
  const rosterId = toPositiveInt(req.params.id);
  if (rosterId === null) return sendError(res, 400, '无效的名单 ID');
  const b = req.body || {};
  const rosterStudentId = toPositiveInt(b.rosterStudentId);
  if (rosterStudentId === null) return sendError(res, 400, '必须指定有效的名单学生记录 ID');
  try {
    const result = await store.markMissedBoard(rosterStudentId);
    res.json({ data: result });
  } catch (err) {
    if (err.code === 'RS_NOT_FOUND') return sendError(res, 404, err.message);
    if (err.code === 'INVALID_STATE') return sendError(res, 400, err.message);
    throw err;
  }
}));

router.post('/:id/missed-alight', wrap(async (req, res) => {
  const rosterId = toPositiveInt(req.params.id);
  if (rosterId === null) return sendError(res, 400, '无效的名单 ID');
  const b = req.body || {};
  const rosterStudentId = toPositiveInt(b.rosterStudentId);
  if (rosterStudentId === null) return sendError(res, 400, '必须指定有效的名单学生记录 ID');
  try {
    const result = await store.markMissedAlight(rosterStudentId);
    res.json({ data: result });
  } catch (err) {
    if (err.code === 'RS_NOT_FOUND') return sendError(res, 404, err.message);
    if (err.code === 'INVALID_STATE') return sendError(res, 400, err.message);
    throw err;
  }
}));

router.get('/:id/on-bus', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的名单 ID');
  if (!(await store.getRoster(id))) return sendError(res, 404, '乘车名单不存在');
  const students = await store.getOnBusStudents(id);
  res.json({ data: students, total: students.length });
}));

router.get('/:id/alerts', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的名单 ID');
  if (!(await store.getRoster(id))) return sendError(res, 404, '乘车名单不存在');
  const alerts = await store.getMissedAlerts(id);
  res.json({ data: alerts });
}));

router.get('/:id/trail/:studentId', wrap(async (req, res) => {
  const rosterId = toPositiveInt(req.params.id);
  const studentId = toPositiveInt(req.params.studentId);
  if (rosterId === null) return sendError(res, 400, '无效的名单 ID');
  if (studentId === null) return sendError(res, 400, '无效的学生 ID');
  if (!(await store.getRoster(rosterId))) return sendError(res, 404, '乘车名单不存在');
  const trail = await store.getStudentCheckinTrail(rosterId, studentId);
  res.json({ data: trail, total: trail.length });
}));

router.get('/:id/checkins', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的名单 ID');
  if (!(await store.getRoster(id))) return sendError(res, 404, '乘车名单不存在');
  const checkins = await store.getCheckinsByRoster(id);
  res.json({ data: checkins, total: checkins.length });
}));

module.exports = router;
