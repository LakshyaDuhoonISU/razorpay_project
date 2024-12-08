import express from 'express'
import { getBusinessProfile, loginBusiness, registerBusiness } from '../controllers/businessController.js'
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/register', registerBusiness)
router.post('/login', loginBusiness)
router.get('/profile', authMiddleware, getBusinessProfile)

export default router