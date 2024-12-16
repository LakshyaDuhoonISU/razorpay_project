import express from 'express'
import { createPlan, getPlanDetails, getPlansByBusiness } from '../controllers/planController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.get('/business', authMiddleware, getPlansByBusiness)
router.post('/', authMiddleware, createPlan)
router.get('/:id', getPlanDetails)

export default router