-- CreateTable
CREATE TABLE "AbuseReports" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "content" TEXT NOT NULL,
    "blogId" INTEGER NOT NULL
);
