import express from 'express'
import { createSubscription, getSubscriptionDetail, getSubscriptionsByBusiness, getSubscriptionsByCustomer } from '../controllers/subscriptionController.js'

const router = express.Router()

router.post('/', createSubscription)
router.get('/:customerId', getSubscriptionsByCustomer)
router.get('/subscription/:id', getSubscriptionDetail)
router.get('/', getSubscriptionsByBusiness)

export default router