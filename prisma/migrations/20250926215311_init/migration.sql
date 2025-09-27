-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `lastLogin` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_progress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `theme` VARCHAR(191) NOT NULL,
    `lessons` LONGTEXT NULL DEFAULT '[]',
    `startedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    INDEX `user_progress_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bible_versions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `language` VARCHAR(191) NOT NULL DEFAULT 'fr',
    `year` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `orderIndex` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bible_versions_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bible_books` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `testament` ENUM('OLD', 'NEW') NOT NULL,
    `orderIndex` INTEGER NOT NULL,
    `chapterCount` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `bible_books_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bible_verses` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `chapter` INTEGER NOT NULL,
    `verse` INTEGER NOT NULL,
    `text` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `versionId` INTEGER NOT NULL,
    `bookId` INTEGER NOT NULL,

    INDEX `bible_verses_bookId_chapter_verse_idx`(`bookId`, `chapter`, `verse`),
    UNIQUE INDEX `bible_verses_versionId_bookId_chapter_verse_key`(`versionId`, `bookId`, `chapter`, `verse`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bible_bookmarks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL DEFAULT 'blue',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,
    `bookId` INTEGER NOT NULL,
    `verseId` INTEGER NOT NULL,

    INDEX `bible_bookmarks_bookId_fkey`(`bookId`),
    INDEX `bible_bookmarks_verseId_fkey`(`verseId`),
    UNIQUE INDEX `bible_bookmarks_userId_verseId_key`(`userId`, `verseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bible_notes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NULL,
    `content` TEXT NOT NULL,
    `isPrivate` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,
    `bookId` INTEGER NOT NULL,
    `verseId` INTEGER NOT NULL,

    INDEX `bible_notes_bookId_fkey`(`bookId`),
    INDEX `bible_notes_userId_fkey`(`userId`),
    INDEX `bible_notes_verseId_fkey`(`verseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_preferences` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `defaultVersionId` INTEGER NULL,
    `notesPerVersion` BOOLEAN NOT NULL DEFAULT false,
    `bookmarksPerVersion` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `user_preferences_userId_key`(`userId`),
    INDEX `user_preferences_defaultVersionId_fkey`(`defaultVersionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reading_sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NULL,
    `duration` INTEGER NULL,
    `chaptersRead` LONGTEXT NULL DEFAULT '[]',
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `deviceType` VARCHAR(191) NULL DEFAULT 'web',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `versionId` INTEGER NOT NULL,

    INDEX `reading_sessions_userId_fkey`(`userId`),
    INDEX `reading_sessions_versionId_fkey`(`versionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_progress` ADD CONSTRAINT `user_progress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bible_verses` ADD CONSTRAINT `bible_verses_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `bible_books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bible_verses` ADD CONSTRAINT `bible_verses_versionId_fkey` FOREIGN KEY (`versionId`) REFERENCES `bible_versions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bible_bookmarks` ADD CONSTRAINT `bible_bookmarks_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `bible_books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bible_bookmarks` ADD CONSTRAINT `bible_bookmarks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bible_bookmarks` ADD CONSTRAINT `bible_bookmarks_verseId_fkey` FOREIGN KEY (`verseId`) REFERENCES `bible_verses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bible_notes` ADD CONSTRAINT `bible_notes_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `bible_books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bible_notes` ADD CONSTRAINT `bible_notes_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bible_notes` ADD CONSTRAINT `bible_notes_verseId_fkey` FOREIGN KEY (`verseId`) REFERENCES `bible_verses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_preferences` ADD CONSTRAINT `user_preferences_defaultVersionId_fkey` FOREIGN KEY (`defaultVersionId`) REFERENCES `bible_versions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_preferences` ADD CONSTRAINT `user_preferences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reading_sessions` ADD CONSTRAINT `reading_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reading_sessions` ADD CONSTRAINT `reading_sessions_versionId_fkey` FOREIGN KEY (`versionId`) REFERENCES `bible_versions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
