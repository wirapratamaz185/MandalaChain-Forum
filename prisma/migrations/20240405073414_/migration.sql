-- AlterTable
ALTER TABLE "Bookmark" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "Comment" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "Community" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "CommunityType" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "Post" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "Subscriber" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
