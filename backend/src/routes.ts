import express, { response } from 'express'
import knex from './database/connection'
const routes = express.Router();
import PointsController from '../src/controllers/pointsController'
import ItemsController from '../src/controllers/itemsController'

const pointsController = new PointsController();
const itemsController = new ItemsController();
routes.get('/items', itemsController.index);
routes.post('/points', pointsController.create);
routes.get('/points/:id', pointsController.show);
routes.get('/points', pointsController.index);

export default routes;