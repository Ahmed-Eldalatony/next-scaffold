import { prisma } from "@/lib/prisma"

export const getPosts = async function() {
  const posts = await prisma.post.findMany()
  return posts
}
