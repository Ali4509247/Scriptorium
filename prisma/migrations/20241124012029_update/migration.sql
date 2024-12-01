/*
  Warnings:

  - A unique constraint covering the columns `[password]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Blog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "netRatings" INTEGER NOT NULL DEFAULT 0,
    "abuseReports" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "userId" INTEGER NOT NULL,
    "comments" TEXT NOT NULL,
    "codeTemplates" TEXT NOT NULL,
    "tags" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "netRatings" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "blogId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Template" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "forked" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_password_key" ON "User"("password");
