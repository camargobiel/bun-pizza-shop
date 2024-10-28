import Elysia, { t } from 'elysia'
import { restaurants, users } from '../../db/schema'
import { db } from '../../db/connection'

export const createRestaurant = new Elysia().post(
  '/restaurants',
  async ({ body, set }) => {
    const { restaurant, manager } = body

    const [createdManager] = await db
      .insert(users)
      .values({
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        role: 'manager',
      })
      .returning({
        id: users.id,
      })

    await db.insert(restaurants).values({
      name: restaurant.name,
      managerId: createdManager.id,
    })

    set.status = 204
  },
  {
    body: t.Object({
      restaurant: t.Object({
        name: t.String(),
      }),
      manager: t.Object({
        name: t.String(),
        email: t.String({ format: 'email' }),
        phone: t.String(),
      }),
    }),
  },
)
