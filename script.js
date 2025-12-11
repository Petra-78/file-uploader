import { prisma } from './lib/prisma.js'

async function main() {
  const user = await prisma.users.create({
    data: {
      username: 'Alice',
      email: 'alice@prisma.io',
      password:"Alice78"
    },
  })
  console.log('Created user:', user)

  const allUsers = await prisma.users.findMany({
  })
  console.log('All users:', JSON.stringify(allUsers, null, 2))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })