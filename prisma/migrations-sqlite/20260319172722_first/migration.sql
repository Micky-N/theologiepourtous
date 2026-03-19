-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "theme" TEXT NOT NULL,
    "lessons" TEXT DEFAULT '[]',
    "startedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bible_bookmarks" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "color" TEXT DEFAULT 'blue',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookOrderIndex" INTEGER NOT NULL,
    "versionOrderIndex" INTEGER NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    CONSTRAINT "bible_bookmarks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bible_notes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    "bookOrderIndex" INTEGER NOT NULL,
    "versionOrderIndex" INTEGER NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    CONSTRAINT "bible_notes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "defaultVersionOrderIndex" INTEGER,
    "notesPerVersion" BOOLEAN NOT NULL DEFAULT false,
    "bookmarksPerVersion" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "user_progress_userId_fkey" ON "user_progress"("userId");

-- CreateIndex
CREATE INDEX "bible_bookmarks_bookOrderIndex_idx" ON "bible_bookmarks"("bookOrderIndex");

-- CreateIndex
CREATE INDEX "bible_bookmarks_versionOrderIndex_idx" ON "bible_bookmarks"("versionOrderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "bible_bookmarks_userId_versionOrderIndex_bookOrderIndex_chapter_verse_key" ON "bible_bookmarks"("userId", "versionOrderIndex", "bookOrderIndex", "chapter", "verse");

-- CreateIndex
CREATE INDEX "bible_notes_bookOrderIndex_idx" ON "bible_notes"("bookOrderIndex");

-- CreateIndex
CREATE INDEX "bible_notes_userId_fkey" ON "bible_notes"("userId");

-- CreateIndex
CREATE INDEX "bible_notes_versionOrderIndex_idx" ON "bible_notes"("versionOrderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE INDEX "user_preferences_defaultVersionOrderIndex_idx" ON "user_preferences"("defaultVersionOrderIndex");
