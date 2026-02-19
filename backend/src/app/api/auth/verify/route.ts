import { Router } from 'express';
import { verifyEmail } from './verify';

const router = Router();

router.get('/', verifyEmail);

export default router;