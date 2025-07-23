// src/app/api/(posts)/get-posts/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// Define default and max limits
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
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
        orderBy: { createdAt: 'desc' }, // Ensure consistent ordering
        take: limit,
        skip: skip,
      }),
      prisma.post.count(), // Get total count for hasNextPage calculation
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
