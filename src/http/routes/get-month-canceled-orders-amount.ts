import Elysia from 'elysia'
import { auth } from '../auth'
import { UnauthorizedError } from '../errors/unauthorized-error'
import dayjs from 'dayjs'
import { db } from '../../db/connection'
import { orders } from '../../db/schema'
import { and, count, eq, gte, sql } from 'drizzle-orm'

export const getMonthCanceledOrdersAmount = new Elysia()
  .use(auth)
  .get('/metrics/month-canceled-orders-amount', async ({ getCurrentUser }) => {
    const { restaurantId } = await getCurrentUser()

    if (!restaurantId) {
      throw new UnauthorizedError()
    }

    const today = dayjs()
    const startOfLastMonth = today.subtract(1, 'month').startOf('month')

    const ordersPerMonth = await db
      .select({
        monthWithYear: sql<string>`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`,
        amount: count(),
      })
      .from(orders)
      .where(
        and(
          eq(orders.restaurantId, restaurantId),
          gte(orders.createdAt, startOfLastMonth.toDate()),
          eq(orders.status, 'canceled'),
        ),
      )
      .groupBy(sql`TO_CHAR(${orders.createdAt}, 'YYYY-MM')`)

    const currentMonthWithYear = today.format('YYYY-MM')
    const lastMonthWithYear = startOfLastMonth.format('YYYY-MM')

    const currentMonthOrders = ordersPerMonth.find(
      (receipt) => receipt.monthWithYear === currentMonthWithYear,
    )

    const lastMonthOrders = ordersPerMonth.find(
      (receipt) => receipt.monthWithYear === lastMonthWithYear,
    )

    const diffFromLastMonth =
      currentMonthOrders && lastMonthOrders
        ? (currentMonthOrders.amount * 100) / lastMonthOrders.amount
        : 0

    return {
      amount: currentMonthOrders?.amount || 0,
      diffFromLastMonth: Number((diffFromLastMonth - 100).toFixed(2)),
    }
  })
