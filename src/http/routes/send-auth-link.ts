import Elysia, { t } from 'elysia'
import { db } from '../../db/connection'
import { createId } from '@paralleldrive/cuid2'
import { authLinks } from '../../db/schema'
import { env } from '../../env'
import { mail } from '../../lib/mail'
import nodemailer from 'nodemailer'
import chalk from 'chalk'

export const sendAuthLink = new Elysia().post(
  '/authenticate',
  async ({ body }) => {
    const { email } = body

    const user = await db.query.users.findFirst({
      where(fields, { eq }) {
        return eq(fields.email, email)
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const authLinkCode = createId()

    await db.insert(authLinks).values({
      userId: user.id,
      code: authLinkCode,
    })

    const authLink = new URL('/auth-links/authenticate', env.API_BASE_URL)
    authLink.searchParams.set('code', authLinkCode)
    authLink.searchParams.set('redirect', env.AUTH_REDIRECT_URL)

    const info = await mail.sendMail({
      from: {
        name: 'Pizza shop',
        address: 'hi@pizzashop.com',
      },
      to: email,
      subject: 'Authenticate your account',
      text: `Click the link to authenticate your account: ${authLink.toString()}`,
    })

    console.log(chalk.blueBright(nodemailer.getTestMessageUrl(info)))
  },
  {
    body: t.Object({
      email: t.String({ format: 'email' }),
    }),
  },
)
