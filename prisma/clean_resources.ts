import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const count = await prisma.learningResource.deleteMany()
  console.log(`Cleaned up ${count.count} old resource records (PDFs, practice articles).`)

  // Add 1 verified, topic-based masterclass lecture video
  const topic = await prisma.topic.findFirst({
    where: { title: { contains: 'Dijkstra' } },
  })

  if (topic) {
    const video = await prisma.learningResource.create({
      data: {
        topicId: topic.id,
        title: 'Masterclass: Dijkstra Shortest Path Algorithm & Priority Queues',
        type: 'VIDEO',
        url: 'https://www.youtube.com/watch?v=bZkzH5x0Ikk',
        content: 'Comprehensive lecture walkthrough covering single-source shortest paths, adjacency lists, and priority queue relaxation.',
        durationMinutes: 45,
        author: 'Dr. Arvind Sharma (CSE HOD)',
      }
    })
    console.log('Created clean topic learning video:', video.title)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
