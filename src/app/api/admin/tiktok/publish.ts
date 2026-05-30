import { prisma } from "@/lib/prisma";

import { TikTokPostStatus } from "@/generated/prisma";

import { deletePublicVideo } from "@/lib/storage/publicVideos";

export async function publishTikTokPost(postId: string) {
  const post = await prisma.tikTokPost.findUnique({
    where: {
      id: postId,
    },

    include: {
      tiktokAuthor: true,
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  if (!post.tiktokAuthor) {
    throw new Error("TikTok author not connected");
  }

  await prisma.tikTokPost.update({
    where: {
      id: post.id,
    },

    data: {
      status: TikTokPostStatus.PUBLISHING,
    },
  });

  try {
    /*
      TODO:
      TikTok API upload/publish
    */

    const fakeVideoId = crypto.randomUUID();

    await prisma.tikTokPost.update({
      where: {
        id: post.id,
      },

      data: {
        status: TikTokPostStatus.PUBLISHED,

        publishedAt: new Date(),

        tiktokVideoId: fakeVideoId,

        errorMessage: null,
      },
    });

    if (post.video && !post.videoDeletedAt) {
      const deleted = await deletePublicVideo(post.video);

      if (deleted) {
        await prisma.tikTokPost.update({
          where: {
            id: post.id,
          },

          data: {
            videoDeletedAt: new Date(),
          },
        });
      }
    }

    return true;
  } catch (error) {
    console.error("TIKTOK PUBLISH ERROR:", error);

    await prisma.tikTokPost.update({
      where: {
        id: post.id,
      },

      data: {
        status: TikTokPostStatus.FAILED,

        retryCount: {
          increment: 1,
        },

        errorMessage: error instanceof Error ? error.message : "Publish failed",
      },
    });

    return false;
  }
}
