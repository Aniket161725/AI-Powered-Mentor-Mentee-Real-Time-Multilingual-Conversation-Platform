import { Router } from 'express';
const router = Router();

import { getMentors , registerUser , loginUser , getUserProfile , updateUserProfile , updateUserDetails } from '../controller/userController.js';

router.route('/login')
    .post(loginUser);

router.route('/register')
    .post(registerUser);

router.route('/profile/update')
    .put(updateUserProfile);

router.route('/profile/:id')
    .get(getUserProfile)

router.route('/details/update')
    .put(updateUserDetails);

router.route('/mentors')
    .get(getMentors);

export default router;
