import { Router } from 'express';
import { signUp } from './signup';

const router = Router();

router.post('/', signUp);

export default router;