'use strict';

const express = require('express');
const store = require('../data/store');
const { sendError, isNonEmptyString, toPositiveInt } = require('../utils/http');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const VALID_STATUS = ['ACTIVE', 'INACTIVE'];

router.get('/', wrap(async (req, res) => {
  const { status } = req.query;
  const filters = {};
  if (status !== undefined) {
    if (!VALID_STATUS.includes(status)) return sendError(res, 400, '状态只能是 ACTIVE / INACTIVE');
    filters.status = status;
  }
  const list = await store.listBuses(filters);
  res.json({ data: list, total: list.length });
}));

router.get('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的校车 ID');
  const b = await store.getBus(id);
  if (!b) return sendError(res, 404, '校车不存在');
  res.json({ data: b });
}));

router.post('/', wrap(async (req, res) => {
  const b = req.body || {};
  if (!isNonEmptyString(b.plateNumber)) return sendError(res, 400, '车牌号不能为空');
  if (b.capacity === undefined || !Number.isInteger(b.capacity) || b.capacity <= 0) {
    return sendError(res, 400, '核载人数必须为正整数');
  }
  if (b.status !== undefined && !VALID_STATUS.includes(b.status)) {
    return sendError(res, 400, '状态只能是 ACTIVE / INACTIVE');
  }
  if (await store.findBusByPlate(b.plateNumber.trim())) {
    return sendError(res, 409, '车牌号已存在');
  }
  const created = await store.createBus({ ...b, plateNumber: b.plateNumber.trim() });
  res.status(201).json({ data: created });
}));

router.put('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的校车 ID');
  if (!(await store.getBus(id))) return sendError(res, 404, '校车不存在');
  const b = req.body || {};
  if (b.plateNumber !== undefined && !isNonEmptyString(b.plateNumber)) {
    return sendError(res, 400, '车牌号不能为空');
  }
  if (b.capacity !== undefined && (!Number.isInteger(b.capacity) || b.capacity <= 0)) {
    return sendError(res, 400, '核载人数必须为正整数');
  }
  if (b.status !== undefined && !VALID_STATUS.includes(b.status)) {
    return sendError(res, 400, '状态只能是 ACTIVE / INACTIVE');
  }
  if (b.plateNumber) {
    const existing = await store.findBusByPlate(b.plateNumber.trim());
    if (existing && existing.id !== id) return sendError(res, 409, '车牌号已存在');
  }
  const updated = await store.updateBus(id, b);
  res.json({ data: updated });
}));

router.delete('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的校车 ID');
  if (!(await store.getBus(id))) return sendError(res, 404, '校车不存在');
  await store.deleteBus(id);
  res.status(204).end();
}));

module.exports = router;
