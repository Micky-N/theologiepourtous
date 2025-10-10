import type { InferCreationAttributes, QueryInterface, Sequelize, WhereOptions } from 'sequelize';
import type { BibleVerse, BibleBook, BibleVersion } from '../models';
import fs from 'fs';

export default {
    async up(queryInterface: QueryInterface, _sequelize: typeof Sequelize): Promise<void> {
        // Versions bibliques à ajouter
        const bibleVersions = [
            { code: 'LSG', name: 'Louis Segond 1910', language: 'fr', year: 1910, isActive: true, orderIndex: 1 },
            { code: 'S21', name: 'Segond 21', language: 'fr', year: 2007, isActive: true, orderIndex: 2 },
            { code: 'BDS', name: 'Bible du Semeur', language: 'fr', year: 1999, isActive: true, orderIndex: 3 },
            { code: 'MAB', name: 'Martin 1744', language: 'fr', year: 1744, isActive: true, orderIndex: 4 },
            { code: 'DBY', name: 'Darby Bible', language: 'fr', year: 1885, isActive: true, orderIndex: 5 },
            { code: 'OST', name: 'Ostervald 1996', language: 'fr', year: 1996, isActive: true, orderIndex: 6 },
            { code: 'KJV', name: 'King James Version', language: 'en', year: 1611, isActive: true, orderIndex: 7 }
        ];

        // Livres bibliques à ajouter
        const bibleBooks = [
            { code: 'GEN', name: 'Genèse', testament: 'OLD', orderIndex: 1, chapterCount: 50 },
            { code: 'EXO', name: 'Exode', testament: 'OLD', orderIndex: 2, chapterCount: 40 },
            { code: 'LEV', name: 'Lévitique', testament: 'OLD', orderIndex: 3, chapterCount: 27 },
            { code: 'NUM', name: 'Nombres', testament: 'OLD', orderIndex: 4, chapterCount: 36 },
            { code: 'DEU', name: 'Deutéronome', testament: 'OLD', orderIndex: 5, chapterCount: 34 },
            { code: 'JOS', name: 'Josué', testament: 'OLD', orderIndex: 6, chapterCount: 24 },
            { code: 'JDG', name: 'Juges', testament: 'OLD', orderIndex: 7, chapterCount: 21 },
            { code: 'RUT', name: 'Ruth', testament: 'OLD', orderIndex: 8, chapterCount: 4 },
            { code: '1SA', name: '1 Samuel', testament: 'OLD', orderIndex: 9, chapterCount: 31 },
            { code: '2SA', name: '2 Samuel', testament: 'OLD', orderIndex: 10, chapterCount: 24 },
            { code: '1KI', name: '1 Rois', testament: 'OLD', orderIndex: 11, chapterCount: 22 },
            { code: '2KI', name: '2 Rois', testament: 'OLD', orderIndex: 12, chapterCount: 25 },
            { code: '1CH', name: '1 Chroniques', testament: 'OLD', orderIndex: 13, chapterCount: 29 },
            { code: '2CH', name: '2 Chroniques', testament: 'OLD', orderIndex: 14, chapterCount: 36 },
            { code: 'EZR', name: 'Esdras', testament: 'OLD', orderIndex: 15, chapterCount: 10 },
            { code: 'NEH', name: 'Néhémie', testament: 'OLD', orderIndex: 16, chapterCount: 13 },
            { code: 'EST', name: 'Esther', testament: 'OLD', orderIndex: 17, chapterCount: 10 },
            { code: 'JOB', name: 'Job', testament: 'OLD', orderIndex: 18, chapterCount: 42 },
            { code: 'PSA', name: 'Psaumes', testament: 'OLD', orderIndex: 19, chapterCount: 150 },
            { code: 'PRO', name: 'Proverbes', testament: 'OLD', orderIndex: 20, chapterCount: 31 },
            { code: 'ECC', name: 'Ecclésiaste', testament: 'OLD', orderIndex: 21, chapterCount: 12 },
            { code: 'SNG', name: 'Cantique des cantiques', testament: 'OLD', orderIndex: 22, chapterCount: 8 },
            { code: 'ISA', name: 'Ésaïe', testament: 'OLD', orderIndex: 23, chapterCount: 66 },
            { code: 'JER', name: 'Jérémie', testament: 'OLD', orderIndex: 24, chapterCount: 52 },
            { code: 'LAM', name: 'Lamentations', testament: 'OLD', orderIndex: 25, chapterCount: 5 },
            { code: 'EZK', name: 'Ézéchiel', testament: 'OLD', orderIndex: 26, chapterCount: 48 },
            { code: 'DAN', name: 'Daniel', testament: 'OLD', orderIndex: 27, chapterCount: 12 },
            { code: 'HOS', name: 'Osée', testament: 'OLD', orderIndex: 28, chapterCount: 14 },
            { code: 'JOE', name: 'Joël', testament: 'OLD', orderIndex: 29, chapterCount: 3 },
            { code: 'AMO', name: 'Amos', testament: 'OLD', orderIndex: 30, chapterCount: 9 },
            { code: 'OBA', name: 'Abdias', testament: 'OLD', orderIndex: 31, chapterCount: 1 },
            { code: 'JON', name: 'Jonas', testament: 'OLD', orderIndex: 32, chapterCount: 4 },
            { code: 'MIC', name: 'Michée', testament: 'OLD', orderIndex: 33, chapterCount: 7 },
            { code: 'NAH', name: 'Nahum', testament: 'OLD', orderIndex: 34, chapterCount: 3 },
            { code: 'HAB', name: 'Habacuc', testament: 'OLD', orderIndex: 35, chapterCount: 3 },
            { code: 'ZEP', name: 'Sophonie', testament: 'OLD', orderIndex: 36, chapterCount: 3 },
            { code: 'HAG', name: 'Aggée', testament: 'OLD', orderIndex: 37, chapterCount: 2 },
            { code: 'ZEC', name: 'Zacharie', testament: 'OLD', orderIndex: 38, chapterCount: 14 },
            { code: 'MAL', name: 'Malachie', testament: 'OLD', orderIndex: 39, chapterCount: 4 },
            { code: 'MAT', name: 'Matthieu', testament: 'NEW', orderIndex: 40, chapterCount: 28 },
            { code: 'MRK', name: 'Marc', testament: 'NEW', orderIndex: 41, chapterCount: 16 },
            { code: 'LUK', name: 'Luc', testament: 'NEW', orderIndex: 42, chapterCount: 24 },
            { code: 'JHN', name: 'Jean', testament: 'NEW', orderIndex: 43, chapterCount: 21 },
            { code: 'ACT', name: 'Actes', testament: 'NEW', orderIndex: 44, chapterCount: 28 },
            { code: 'ROM', name: 'Romains', testament: 'NEW', orderIndex: 45, chapterCount: 16 },
            { code: '1CO', name: '1 Corinthiens', testament: 'NEW', orderIndex: 46, chapterCount: 16 },
            { code: '2CO', name: '2 Corinthiens', testament: 'NEW', orderIndex: 47, chapterCount: 13 },
            { code: 'GAL', name: 'Galates', testament: 'NEW', orderIndex: 48, chapterCount: 6 },
            { code: 'EPH', name: 'Éphésiens', testament: 'NEW', orderIndex: 49, chapterCount: 6 },
            { code: 'PHP', name: 'Philippiens', testament: 'NEW', orderIndex: 50, chapterCount: 4 },
            { code: 'COL', name: 'Colossiens', testament: 'NEW', orderIndex: 51, chapterCount: 4 },
            { code: '1TH', name: '1 Thessaloniciens', testament: 'NEW', orderIndex: 52, chapterCount: 5 },
            { code: '2TH', name: '2 Thessaloniciens', testament: 'NEW', orderIndex: 53, chapterCount: 3 },
            { code: '1TI', name: '1 Timothée', testament: 'NEW', orderIndex: 54, chapterCount: 6 },
            { code: '2TI', name: '2 Timothée', testament: 'NEW', orderIndex: 55, chapterCount: 4 },
            { code: 'TIT', name: 'Tite', testament: 'NEW', orderIndex: 56, chapterCount: 3 },
            { code: 'PHM', name: 'Philémon', testament: 'NEW', orderIndex: 57, chapterCount: 1 },
            { code: 'HEB', name: 'Hébreux', testament: 'NEW', orderIndex: 58, chapterCount: 13 },
            { code: 'JAS', name: 'Jacques', testament: 'NEW', orderIndex: 59, chapterCount: 5 },
            { code: '1PE', name: '1 Pierre', testament: 'NEW', orderIndex: 60, chapterCount: 5 },
            { code: '2PE', name: '2 Pierre', testament: 'NEW', orderIndex: 61, chapterCount: 3 },
            { code: '1JN', name: '1 Jean', testament: 'NEW', orderIndex: 62, chapterCount: 5 },
            { code: '2JN', name: '2 Jean', testament: 'NEW', orderIndex: 63, chapterCount: 1 },
            { code: '3JN', name: '3 Jean', testament: 'NEW', orderIndex: 64, chapterCount: 1 },
            { code: 'JUD', name: 'Jude', testament: 'NEW', orderIndex: 65, chapterCount: 1 },
            { code: 'REV', name: 'Apocalypse', testament: 'NEW', orderIndex: 66, chapterCount: 22 }
        ];

        console.log('🌱 Starting Bible seeding...');

        // 1. Insérer les versions bibliques
        console.log('📖 Creating Bible versions...');
        await queryInterface.bulkInsert('bible_versions', bibleVersions.map(version => ({ ...version, createdAt: new Date() })), {});

        // 2. Insérer les livres bibliques
        console.log('📚 Creating Bible books...');
        await queryInterface.bulkInsert('bible_books', bibleBooks.map(book => ({ ...book, createdAt: new Date() })), {});

        // 3. Insérer les versets
        const bibles = JSON.parse(fs.readFileSync('src/docs/bibles.json', 'utf-8'));
        const verses = bibles as Array<{
            bookCode: string;
            chapter: number;
            verse: number;
            texts: { [key: string]: string; };
        }>;

        // Pour chaque verset, on insère une ligne par version biblique disponible
        console.log('📑 Preparing verses for insertion...');
        const bibleVerseRows: Array<InferCreationAttributes<Omit<BibleVerse, 'id'>>> = [];
        for (const verse of verses) {
            const bookId = await queryInterface.rawSelect('bible_books', { where: { code: verse.bookCode } }, ['id']) as unknown as BibleBook['id'] | null;
            if (!bookId) continue;
            for (const version of bibleVersions) {
                const versionId = await queryInterface.rawSelect('bible_versions', { where: { code: version.code } }, ['id']) as unknown as BibleVersion['id'] | null;
                if (!versionId) continue;
                const text = verse.texts[version.code];
                if (!text) continue;
                bibleVerseRows.push({
                    versionId: versionId,
                    bookId: bookId,
                    chapter: verse.chapter,
                    verse: verse.verse,
                    text: text,
                    createdAt: new Date()
                });
            }
        }
        // Pour éviter les problèmes de taille, on insère par batch de 1000
        console.log('📝 Creating verses...');
        const batchSize = 1000;
        for (let i = 0; i < bibleVerseRows.length; i += batchSize) {
            console.log(`📜 Creating verses ${i + 1} to ${i + batchSize}...`);
            await queryInterface.bulkInsert('bible_verses', bibleVerseRows.slice(i, i + batchSize), {});
        }

        console.log('\n✅ Bible seeding completed!');
        console.log(`   📖 ${bibleVersions.length} versions created`);
        console.log(`   📚 ${bibleBooks.length} books created`);
        console.log(`   📝 ${verses.length * bibleVersions.length} verses created`);
    },

    async down(queryInterface: QueryInterface, _sequelize: typeof Sequelize): Promise<void> {
    // Suppression des données insérées
        await queryInterface.bulkDelete('bible_verses', null as unknown as WhereOptions<any>, {});
        await queryInterface.bulkDelete('bible_versions', null as unknown as WhereOptions<any>, {});
        await queryInterface.bulkDelete('bible_books', null as unknown as WhereOptions<any>, {});
    }
};
