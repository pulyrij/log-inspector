import { Router } from 'express';
import engine from './engine.js';

const router = Router();

router.post('/log', (req, res) => {
    const { statusCode, body } = engine.receiveLog(req.body);
    res.status(statusCode).json(body);
});
router.post('/table', (req, res) => {
    const { statusCode, body } = engine.receiveTable(req.body);
    res.status(statusCode).json(body);
});
router.post('/snapshot', (req, res) => {
    const { statusCode, body } = engine.receiveSnapshot(req.body);
    res.status(statusCode).json(body);
});

export default router;