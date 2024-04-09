import { PrismaClient, PrivacyType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    const password = await bcrypt.hash('admin1234', 10)

    const user = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'testadmin@gmail.com',
        password: password,
        imageUrl: '',
      },
    })
    console.log('User created')

    const community_Type = await prisma.communityType.create({
      data: {
        type: PrivacyType.PUBLIC,
      },
    })
    console.log('Community type created')

    const community = await prisma.community.create({
      data: {
        name: 'Public Community',
        community_type_id: community_Type.id,
        owner_id: user.id
      },
    })
    console.log('Community created')

    const post = await prisma.post.create({
      data: {
        title: 'First Post',
        body: 'This is the first post',
        vote: 0,
        community_id: community.id,
        user_id: user.id
      },
    })
    console.log('Post created')

    const comment = await prisma.comment.create({
      data: {
        text: 'This is the first comment',
        post_id: post.id,
        user_id: user.id
      },
    })
    console.log('Comment created')

    const subscriber = await prisma.subscriber.create({
      data: {
        user_id: user.id,
        community_id: community.id
      },
    })
    console.log('Subscriber created')

    const bookmark = await prisma.bookmark.create({
      data: {
        user_id: user.id,
        post_id: post.id
      },
    })
    console.log('Bookmark created')

    console.log({ user, community, post, comment, subscriber, bookmark })
  } catch (error) {
    console.error('Error seeding data: ', error)
  }
}

main()
  .catch(e => {
    throw e
  })
  .finally(async () => {
    await prisma.$disconnect()
  })