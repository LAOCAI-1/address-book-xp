-- CreateTable
CREATE TABLE `Contact` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isBookmarked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMethod` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contactId` INTEGER NOT NULL,
    `type` ENUM('phone', 'email', 'social', 'address') NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NULL,

    INDEX `ContactMethod_contactId_idx`(`contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ContactMethod` ADD CONSTRAINT `ContactMethod_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
