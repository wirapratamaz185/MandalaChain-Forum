/*
  Warnings:

  - You are about to drop the column `community_type_id` on the `Community` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the `CommunityType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `is_private` to the `Community` table without a default value. This is not possible if the table is not empty.
  - Added the required column `up` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Community" DROP CONSTRAINT "Community_community_type_id_fkey";

-- AlterTable
ALTER TABLE "Community" DROP COLUMN "community_type_id",
ADD COLUMN     "is_private" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "status",
ADD COLUMN     "up" BOOLEAN NOT NULL;

-- DropTable
DROP TABLE "CommunityType";

-- DropEnum
DROP TYPE "PrivacyType";
