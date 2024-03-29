import knex from '../database/connection';
import { Request, Response } from 'express'

class ItemsController {
    async index(req: Request, res: Response) {
        const items = await knex('items').select('*');

        const serializeditems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image: `http://localhost:3333/uploads/${item.image}`
            }

        })

        return res.json(serializeditems);

    }

}

export default ItemsController;