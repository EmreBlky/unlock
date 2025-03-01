import express from 'express'
import { authenticatedMiddleware } from '../../utils/middlewares/auth'
import {
  getCheckoutConfig,
  createOrUpdateCheckoutConfig,
  getCheckoutConfigsByUser,
} from '../../controllers/v2/checkoutController'
const router = express.Router({ mergeParams: true })

router.put('/:id?', authenticatedMiddleware, createOrUpdateCheckoutConfig)
router.get('/list', authenticatedMiddleware, getCheckoutConfigsByUser)
router.get('/:id', getCheckoutConfig)

export default router
