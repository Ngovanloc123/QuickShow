import express from 'express'
import { getFavorites, getUserBookings, updateFavorite } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.get('/booking', getUserBookings)
userRouter.post('/update-favorite', updateFavorite)
userRouter.get('/favorites', getFavorites)

export default userRouter