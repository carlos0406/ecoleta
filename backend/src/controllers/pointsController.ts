import knex from '../database/connection';
import { Request, Response } from 'express'
class PointsController {
    async index(request: Request, response: Response) {
        const { city, uf, items } = request.query;

        const parsedItems = String(items).split(",").map((item) => Number(item.trim()));

        const points = await knex("points")
            .join("point_items", "points.id", "=", "point_items.point_id")
            .whereIn("point_items.items_id", parsedItems)
            .where("city", String(city))
            .where("uf", String(uf))
            .distinct()
            .select("points.*");


        return response.json(points);
    }

    async show(req: Request, res: Response) {
        const { id } = req.params;
        const point = await knex('points').where('id', id).first();

        const items = await knex('items').join('point_items', 'items.id', '=', 'point_items.items_id').
            where('point_items.point_id', id).select('items.title')


        if (!point) {
            return res.status(400).json({ message: "Erro ponto não encontrado" });
        }

        return res.json({ point, items });

    }

    async create(req: Request, res: Response) {
        const {
            name,
            email,
            whatssap,
            latitude,
            longitude,
            city,
            uf,
            items,
        } = req.body;

        const trx = await knex.transaction();

        const point = {
            image: "https://picsum.photos/200",
            name,
            email,
            whatssap,
            latitude,
            longitude,
            city,
            uf,
        };

        const insertedIds = await trx("points").insert(point);

        const point_id = insertedIds[0];

        const pointItems = items.map((items_id: number) => {
            return {
                items_id,
                point_id,
            };
        });

        await trx("point_items").insert(pointItems);

        await trx.commit();

        return res.json({
            id: point_id,
            ...point,
        });
    }


}

export default PointsController