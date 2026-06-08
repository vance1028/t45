'use strict';

const express = require('express');
const store = require('../data/store');
const { sendError, isNonEmptyString, toPositiveInt } = require('../utils/http');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const VALID_DIRECTION = ['PICKUP', 'DROPOFF'];

router.get('/', wrap(async (req, res) => {
  const { direction, activeOnly } = req.query;
  const filters = {};
  if (direction !== undefined) {
    if (!VALID_DIRECTION.includes(direction)) return sendError(res, 400, '方向只能是 PICKUP / DROPOFF');
    filters.direction = direction;
  }
  if (activeOnly === 'true' || activeOnly === '1') filters.activeOnly = true;
  const list = await store.listRoutes(filters);
  res.json({ data: list, total: list.length });
}));

router.get('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的路线 ID');
  const r = await store.getRouteWithStations(id);
  if (!r) return sendError(res, 404, '路线不存在');
  res.json({ data: r });
}));

router.post('/', wrap(async (req, res) => {
  const b = req.body || {};
  if (!isNonEmptyString(b.name)) return sendError(res, 400, '路线名称不能为空');
  if (b.direction !== undefined && !VALID_DIRECTION.includes(b.direction)) {
    return sendError(res, 400, '方向只能是 PICKUP / DROPOFF');
  }
  const busId = toPositiveInt(b.busId);
  if (busId === null) return sendError(res, 400, '必须指定有效的校车 ID');
  if (!(await store.getBus(busId))) return sendError(res, 400, '校车不存在');
  if (!Array.isArray(b.stations) || b.stations.length === 0) {
    return sendError(res, 400, '路线必须包含至少一个站点');
  }
  for (let i = 0; i < b.stations.length; i += 1) {
    const st = b.stations[i];
    if (toPositiveInt(st.stationId) === null) {
      return sendError(res, 400, `第 ${i + 1} 个站点 ID 无效`);
    }
  }
  try {
    const created = await store.createRoute({ ...b, name: b.name.trim(), busId });
    res.status(201).json({ data: created });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return sendError(res, 409, '路线站点重复或顺序冲突');
    throw err;
  }
}));

router.put('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的路线 ID');
  if (!(await store.getRoute(id))) return sendError(res, 404, '路线不存在');
  const b = req.body || {};
  if (b.name !== undefined && !isNonEmptyString(b.name)) return sendError(res, 400, '路线名称不能为空');
  if (b.direction !== undefined && !VALID_DIRECTION.includes(b.direction)) {
    return sendError(res, 400, '方向只能是 PICKUP / DROPOFF');
  }
  if (b.busId !== undefined) {
    const busId = toPositiveInt(b.busId);
    if (busId === null) return sendError(res, 400, '必须指定有效的校车 ID');
    if (!(await store.getBus(busId))) return sendError(res, 400, '校车不存在');
    b.busId = busId;
  }
  if (b.stations !== undefined && (!Array.isArray(b.stations) || b.stations.length === 0)) {
    return sendError(res, 400, '路线必须包含至少一个站点');
  }
  try {
    const updated = await store.updateRoute(id, b);
    res.json({ data: updated });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return sendError(res, 409, '路线站点重复或顺序冲突');
    throw err;
  }
}));

router.delete('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的路线 ID');
  if (!(await store.getRoute(id))) return sendError(res, 404, '路线不存在');
  await store.deleteRoute(id);
  res.status(204).end();
}));

router.post('/:id/bindings', wrap(async (req, res) => {
  const routeId = toPositiveInt(req.params.id);
  if (routeId === null) return sendError(res, 400, '无效的路线 ID');
  if (!(await store.getRoute(routeId))) return sendError(res, 404, '路线不存在');
  const b = req.body || {};
  const studentId = toPositiveInt(b.studentId);
  if (studentId === null) return sendError(res, 400, '必须指定有效的学生 ID');
  if (!(await store.getStudent(studentId))) return sendError(res, 400, '学生不存在');
  const boardStationId = toPositiveInt(b.boardStationId);
  const alightStationId = toPositiveInt(b.alightStationId);
  if (boardStationId === null) return sendError(res, 400, '必须指定有效的上车站点 ID');
  if (alightStationId === null) return sendError(res, 400, '必须指定有效的下车站点 ID');
  if (boardStationId === alightStationId) return sendError(res, 400, '上车站点和下车站点不能相同');
  try {
    const created = await store.createBusBinding({
      studentId, routeId, boardStationId, alightStationId, status: b.status,
    });
    res.status(201).json({ data: created });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return sendError(res, 409, '该学生已绑定此路线');
    throw err;
  }
}));

router.get('/:id/bindings', wrap(async (req, res) => {
  const routeId = toPositiveInt(req.params.id);
  if (routeId === null) return sendError(res, 400, '无效的路线 ID');
  const { status } = req.query;
  const filters = { routeId };
  if (status !== undefined) filters.status = status;
  const list = await store.listBusBindings(filters);
  res.json({ data: list, total: list.length });
}));

module.exports = router;
