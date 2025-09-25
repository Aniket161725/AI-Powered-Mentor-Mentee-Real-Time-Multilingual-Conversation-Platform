import { Router } from 'express';
const router = Router();

import {
  sendRequest,
  getAcceptedRequests,
  getRequestsForUser,
  updateRequestStatus
} from '../controller/requestController.js';
import { get } from 'mongoose';


router.route('/send')
  .post(sendRequest);

router.route('/received/:userId')
  .get(getRequestsForUser);

router.route('/status/:requestId')
  .put(updateRequestStatus);

router.route('/accepted/:userId')
  .get(getAcceptedRequests);

export default router;

