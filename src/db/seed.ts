/* eslint-disable drizzle/enforce-delete-with-where */
import { faker } from '@faker-js/faker'
import { restaurants, users } from './schema'
import { db } from './connection'
import chalk from 'chalk'

await db.delete(users)
await db.delete(restaurants)

console.log(chalk.greenBright('🏁 Database seeding started'))

console.log(chalk.yellowBright('✓ Deleted all records'))

await db.insert(users).values([
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'customer',
  },
  {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'customer',
  },
])

console.log(chalk.yellowBright('✓ Created customers'))

const [manager] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: 'admin@app.com',
      role: 'manager',
    },
  ])
  .returning({ id: users.id })

console.log(chalk.yellowBright('✓ Created manager'))

await db.insert(restaurants).values([
  {
    name: faker.company.name(),
    description: faker.lorem.paragraph(),
    managerId: manager.id,
  },
])

console.log(chalk.yellowBright('✓ Created restaurants'))

console.log(chalk.greenBright('✅ Database seeded successfully'))

process.exit(0)
