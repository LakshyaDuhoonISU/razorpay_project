import express from 'express'
import { createTransaction, getTransactionDetail, getTransactionsByBusiness } from '../controllers/transactionController.js'

const router = express.Router()

router.post('/', createTransaction)
router.get('/', getTransactionsByBusiness)
router.get('/:id', getTransactionDetail)

export default router