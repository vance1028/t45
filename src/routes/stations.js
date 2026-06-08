'use strict';

const express = require('express');
const store = require('../data/store');
const { sendError, isNonEmptyString, toPositiveInt } = require('../utils/http');

const router = express.Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const VALID_TYPES = ['SCHOOL', 'RESIDENTIAL', 'CENTER'];

router.get('/', wrap(async (req, res) => {
  const { type } = req.query;
  const filters = {};
  if (type !== undefined) {
    if (!VALID_TYPES.includes(type)) return sendError(res, 400, '类型只能是 SCHOOL / RESIDENTIAL / CENTER');
    filters.type = type;
  }
  const list = await store.listStations(filters);
  res.json({ data: list, total: list.length });
}));

router.get('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的站点 ID');
  const s = await store.getStation(id);
  if (!s) return sendError(res, 404, '站点不存在');
  res.json({ data: s });
}));

router.post('/', wrap(async (req, res) => {
  const s = req.body || {};
  if (!isNonEmptyString(s.name)) return sendError(res, 400, '站点名称不能为空');
  if (s.type !== undefined && !VALID_TYPES.includes(s.type)) {
    return sendError(res, 400, '类型只能是 SCHOOL / RESIDENTIAL / CENTER');
  }
  const created = await store.createStation({ ...s, name: s.name.trim() });
  res.status(201).json({ data: created });
}));

router.put('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的站点 ID');
  if (!(await store.getStation(id))) return sendError(res, 404, '站点不存在');
  const s = req.body || {};
  if (s.name !== undefined && !isNonEmptyString(s.name)) return sendError(res, 400, '站点名称不能为空');
  if (s.type !== undefined && !VALID_TYPES.includes(s.type)) {
    return sendError(res, 400, '类型只能是 SCHOOL / RESIDENTIAL / CENTER');
  }
  const updated = await store.updateStation(id, s);
  res.json({ data: updated });
}));

router.delete('/:id', wrap(async (req, res) => {
  const id = toPositiveInt(req.params.id);
  if (id === null) return sendError(res, 400, '无效的站点 ID');
  if (!(await store.getStation(id))) return sendError(res, 404, '站点不存在');
  await store.deleteStation(id);
  res.status(204).end();
}));

module.exports = router;
