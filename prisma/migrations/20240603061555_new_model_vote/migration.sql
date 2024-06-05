-- CreateTable
CREATE TABLE "Vote" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vote_user_id_post_id_key" ON "Vote"("user_id", "post_id");

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
