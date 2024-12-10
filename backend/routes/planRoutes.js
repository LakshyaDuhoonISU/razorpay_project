import express from 'express'
import { createPlan, getPlanDetails, getPlansByBusiness } from '../controllers/planController.js'

const router = express.Router()

router.get('/business', getPlansByBusiness)
router.post('/', createPlan)
router.get('/:id', getPlanDetails)

export default router