import { Router } from 'express';
const router = Router();

import { getUserProgress , updateUserProgress } from '../controller/progressController.js';

router.route('/progress/:id')
    .get(getUserProgress)
    .put(updateUserProgress);


export default router;
