import express from 'express'
import { createCustomer, getCustomerProfile, getCustomersByBusiness, getTransactionsByCustomer } from '../controllers/customerController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/', authMiddleware, getCustomersByBusiness)
router.post('/', authMiddleware, createCustomer)
router.get('/transactions/:id', getTransactionsByCustomer)
router.get('/profile/:email', getCustomerProfile)

export default router