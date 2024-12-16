import express from 'express'
import { createSubscription, getSubscriptionDetail, getSubscriptionsByBusiness, getSubscriptionsByCustomer } from '../controllers/subscriptionController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/', createSubscription)
router.get('/:id', getSubscriptionsByCustomer)
router.get('/subscription/:id', getSubscriptionDetail)
router.get('/', authMiddleware, getSubscriptionsByBusiness)

export default router