import fs from 'fs';
import path from 'path';

// ROM folder structure mapping
const ROM_FOLDERS = [
    'Nes ROMs Complete 1 Of 4',
    'Nes ROMs Complete 2 Of 4',
    'Nes ROMs Complete 3 Of 4',
    'Nes ROMs Complete 4 Of 4',
];

const LIBRARY_PATH = path.join(process.cwd(), 'LibraryNes');

/**
 * Find a ROM file in the local LibraryNes folders
 * @param fileName - The ROM filename to search for (e.g., "Contra (U).zip")
 * @returns The relative path from LibraryNes folder, or null if not found
 */
export function findLocalRom(fileName: string): string | null {
    for (const folder of ROM_FOLDERS) {
        const fullPath = path.join(LIBRARY_PATH, folder, fileName);
        if (fs.existsSync(fullPath)) {
            return `${folder}/${fileName}`;
        }
    }
    return null;
}

/**
 * Check if a specific ROM exists locally
 */
export function romExistsLocally(fileName: string): boolean {
    return findLocalRom(fileName) !== null;
}

/**
 * Get the full file path for a local ROM
 */
export function getLocalRomPath(fileName: string): string | null {
    const relativePath = findLocalRom(fileName);
    if (relativePath) {
        return path.join(LIBRARY_PATH, relativePath);
    }
    return null;
}
