import { Router } from 'express';
import { signIn } from './signin';

const router = Router();

router.post('/', signIn);

export default router;