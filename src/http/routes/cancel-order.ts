import Elysia, { t } from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { eq } from 'drizzle-orm'

export const cancelOrder = new Elysia().use(auth).patch(
  '/orders/:id/cancel',
  async ({ params, getCurrentUser, set }) => {
    const { id: orderId } = params
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const order = await db.query.orders.findFirst({
      where: (fields, { eq }) => eq(fields.id, orderId),
    })

    if (!order) {
      set.status = 400

      return { message: 'Order not found' }
    }

    if (!['pending', 'processing'].includes(order.status)) {
      set.status = 400

      return { message: 'You cannot orders after dispatch' }
    }

    await db
      .update(orders)
      .set({
        status: 'canceled',
      })
      .where(eq(orders.id, orderId))
  },
  {
    params: t.Object({
      id: t.String(),
    }),
  },
)