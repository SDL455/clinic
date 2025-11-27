-- CreateTable
CREATE TABLE `settings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clinic_name` VARCHAR(191) NOT NULL DEFAULT 'ຄລີນິກ ສຸຂະພາບດີ',
    `clinic_icon` VARCHAR(191) NOT NULL DEFAULT 'lucide:heart-pulse',
    `subtitle` VARCHAR(191) NULL DEFAULT 'ຜູ້ບໍລິການ',
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
