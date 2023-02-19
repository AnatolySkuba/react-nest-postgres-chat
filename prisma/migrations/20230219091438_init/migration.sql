-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "homePage" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "file" TEXT,
    "image" TEXT,
    "userId" UUID NOT NULL,
    "userName" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "homePage" TEXT NOT NULL,
    "previous" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_userName_avatar_homePage_key" ON "users"("id", "userName", "avatar", "homePage");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_userId_userName_avatar_homePage_fkey" FOREIGN KEY ("userId", "userName", "avatar", "homePage") REFERENCES "users"("id", "userName", "avatar", "homePage") ON DELETE RESTRICT ON UPDATE CASCADE;
