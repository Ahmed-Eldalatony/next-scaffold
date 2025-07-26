import { prisma } from '@/lib/prisma';
import { config } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next"


const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 100;

export async function GET(req: Request, res: NextResponse) {
  const session = await getServerSession(config)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url);
  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');

  const page = parseInt(pageParam ?? '1', 10);
  const limit = Math.min(parseInt(limitParam ?? DEFAULT_LIMIT.toString(), 10), MAX_LIMIT); // Clamp limit

  if (isNaN(page) || page < 1) {
    return NextResponse.json({ error: 'Invalid page parameter' }, { status: 400 });
  }

  if (isNaN(limit) || limit < 1) {
    return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 });
  }

  const skip = (page - 1) * limit;

  try {
    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip,
      }),
      prisma.post.count(),
    ]);

    const hasNextPage = skip + posts.length < totalCount;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNextPage,
        hasPreviousPage,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: hasPreviousPage ? page - 1 : null,
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
