import express from 'express';
import logsRouter from './logs-router.js';

const app = new express();

app.use(express.json());
app.use(express.static('public'));
app.use('/logs', logsRouter);

export default app;