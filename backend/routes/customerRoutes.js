import express from 'express'
import { createCustomer, getCustomerProfile, getCustomersByBusiness, getTransactionsByCustomer } from '../controllers/customerController.js'

const router = express.Router()

router.get('/business/:businessId', getCustomersByBusiness)
router.post('/', createCustomer)
router.get('/customer/transactions/:id', getTransactionsByCustomer)
router.get('/:id', getCustomerProfile)

export default router