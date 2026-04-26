import { Router } from 'express';
import engine from './engine.js';

const router = Router();

router.post('/', (req, res) => {
    const { statusCode, body } = engine.receive(req.body);
    res.status(statusCode).json(body);
});

export default router;