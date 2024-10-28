import { Elysia } from 'elysia'
import { env } from '../env'
import chalk from 'chalk'
import { sendAuthLink } from './routes/send-auth-link'
import { authenticateFromLink } from './routes/authenticate-from-link'
import { signOut } from './routes/sign-out'
import { getProfile } from './routes/get-profile'
import { getManagedProfile } from './routes/get-managed-restaurant'
import { createRestaurant } from './routes/create-restaurant'

const PORT = env.PORT || '3333'

const app = new Elysia()
  .use(createRestaurant)
  .use(sendAuthLink)
  .use(authenticateFromLink)
  .use(signOut)
  .use(getProfile)
  .use(getManagedProfile)
  .onError(({ code, error, set }) => {
    switch (code) {
      case 'VALIDATION':
        set.status = error.status
        return error.toResponse()
      default:
        set.status = 500
        console.error(chalk.redBright(error))

        return new Response(null, { status: 500 })
    }
  })

app.listen(PORT, () => {
  console.log(chalk.magentaBright(`🔥 Server is running on port ${PORT}`))
})
