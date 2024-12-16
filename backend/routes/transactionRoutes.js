import express from 'express'
import { createTransaction, getTransactionDetail, getTransactionsByBusiness } from '../controllers/transactionController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/', createTransaction)
router.get('/', authMiddleware, getTransactionsByBusiness)
router.get('/:id', getTransactionDetail)

export default router