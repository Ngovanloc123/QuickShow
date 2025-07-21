import express from 'express'
import {addShow, getShow, getShowPlayingMovies, getShows} from "../controllers/showController.js"
import { protectAdmin } from '../middleware/auth.js';

const showRouter = express.Router();

showRouter.get('/now-playing', protectAdmin, getShowPlayingMovies)
showRouter.post('/add', protectAdmin, addShow)
showRouter.get('/all', getShows)
showRouter.get('/:movieId', getShow)

export default showRouter;