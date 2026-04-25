import { Router } from 'express';
import engine from './engine.js';

const router = Router();

router.post('/', (req, res) => {
    engine.receive(req.body);
    res.sendStatus(204);
});

export default router;