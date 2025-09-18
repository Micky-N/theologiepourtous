import { PrismaClient } from '../app/generated/prisma'

const prisma = new PrismaClient()

// Versions bibliques à ajouter
const bibleVersions = [
    {
        code: 'LSG',
        name: 'Louis Segond 1910',
        language: 'fr',
        description: 'Version classique française, traduction de référence',
        year: 1910,
        isActive: true,
        orderIndex: 1
    },
    {
        code: 'S21',
        name: 'Segond 21',
        language: 'fr',
        description: 'Traduction moderne dans un français accessible',
        year: 2007,
        isActive: true,
        orderIndex: 2
    },
    {
        code: 'BDS',
        name: 'Bible du Semeur',
        language: 'fr',
        description: 'Traduction dynamique privilégiant le sens',
        year: 1999,
        isActive: true,
        orderIndex: 3
    },
    {
        code: 'NEG79',
        name: 'Nouvelle Édition de Genève 1979',
        language: 'fr',
        description: 'Révision moderne de la LSG',
        year: 1979,
        isActive: true,
        orderIndex: 4
    }
]

// 66 livres de la Bible avec métadonnées
const bibleBooks = [
    // Ancien Testament (39 livres)
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

    // Nouveau Testament (27 livres)
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
] as const

// Quelques versets d'exemple pour commencer
const sampleVerses = [
    {
        bookCode: 'JHN',
        chapter: 3,
        verse: 16,
        texts: {
            LSG: 'Car Dieu a tant aimé le monde qu\'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu\'il ait la vie éternelle.',
            S21: 'En effet, Dieu a tant aimé le monde qu\'il a donné son Fils unique afin que quiconque croit en lui ne périsse pas mais ait la vie éternelle.',
            BDS: 'Oui, Dieu a tant aimé le monde qu\'il a donné son Fils, son unique, pour que tous ceux qui placent leur confiance en lui échappent à la perdition et qu\'ils aient la vie éternelle.'
        }
    },
    {
        bookCode: 'PSA',
        chapter: 23,
        verse: 1,
        texts: {
            LSG: 'L\'Éternel est mon berger : je ne manquerai de rien.',
            S21: 'L\'Éternel est mon berger : je ne manque de rien.',
            BDS: 'L\'Éternel est mon berger, je ne manque de rien.'
        }
    },
    {
        bookCode: 'PSA',
        chapter: 139,
        verse: 1,
        texts: {
            LSG: 'Au chef des chantres. De David. Psaume. Éternel ! tu me sondes et tu me connais,',
            S21: 'Au chef de chœur. Psaume de David. Éternel, tu me sondes et tu me connais.',
            BDS: 'Du répertoire du chef de chorale. Psaume de David. Ô Éternel, tu me sondes et me connais.'
        }
    },
    {
        bookCode: 'ISA',
        chapter: 46,
        verse: 10,
        texts: {
            LSG: 'j\'annonce dès le commencement ce qui doit arriver, Et longtemps d\'avance ce qui n\'est pas encore accompli ; Je dis : Mes arrêts subsisteront, Et j\'exécuterai toute ma volonté.',
            S21: 'J\'annonce dès le commencement ce qui doit arriver et longtemps à l\'avance ce qui n\'est pas encore accompli. Je dis : ‹ Mes plans se réaliseront et je mettrai en pratique tout ce qui me plaît. ›',
            BDS: 'Dès le commencement, j\'annonce ce qui doit arriver, et, bien à l\'avance, ce qui n\'existe pas encore. Je dis : ‹ Mes projets se réaliseront, et j\'accomplirai tout ce que je veux. ›'
        }
    },
    {
        bookCode: 'HEB',
        chapter: 4,
        verse: 13,
        texts: {
            LSG: 'Nulle créature n\'est cachée devant lui, mais tout est nu et à découvert aux yeux de celui à qui nous devons rendre compte.',
            S21: 'Il n\'y a rien de caché devant celui à qui nous devons rendre compte : tout est nu et découvert à ses yeux.',
            BDS: 'Rien de ce qui existe n\'échappe au regard de Dieu : tout est nu et découvert aux yeux de celui à qui nous devons rendre compte.'
        }
    }
]

async function main() {
    console.log('🌱 Starting Bible seeding...')

    // 1. Créer les versions bibliques
    console.log('📖 Creating Bible versions...')
    for (const version of bibleVersions) {
        await prisma.bibleVersion.upsert({
            where: { code: version.code },
            update: {},
            create: version
        })
        console.log(`  ✓ ${version.name} (${version.code})`)
    }

    // 2. Créer les livres bibliques
    console.log('📚 Creating Bible books...')
    for (const book of bibleBooks) {
        await prisma.bibleBook.upsert({
            where: { code: book.code },
            update: {},
            create: book
        })
        console.log(`  ✓ ${book.name} (${book.code}) - ${book.chapterCount} chapitres`)
    }

    // 3. Ajouter quelques versets d'exemple
    console.log('📝 Creating sample verses...')
    const versions = await prisma.bibleVersion.findMany()
    const books = await prisma.bibleBook.findMany()

    for (const sampleVerse of sampleVerses) {
        const book = books.find(b => b.code === sampleVerse.bookCode)
        if (!book) continue

        for (const version of versions) {
            const text = sampleVerse.texts[version.code as keyof typeof sampleVerse.texts]
            if (!text) continue

            await prisma.bibleVerse.upsert({
                where: {
                    versionId_bookId_chapter_verse: {
                        versionId: version.id,
                        bookId: book.id,
                        chapter: sampleVerse.chapter,
                        verse: sampleVerse.verse
                    }
                },
                update: {},
                create: {
                    versionId: version.id,
                    bookId: book.id,
                    chapter: sampleVerse.chapter,
                    verse: sampleVerse.verse,
                    text: text
                }
            })
        }

        console.log(`  ✓ ${sampleVerse.bookCode} ${sampleVerse.chapter}:${sampleVerse.verse}`)
    }

    console.log('\n✅ Bible seeding completed!')
    console.log(`   📖 ${bibleVersions.length} versions created`)
    console.log(`   📚 ${bibleBooks.length} books created`)
    console.log(`   📝 ${sampleVerses.length * versions.length} sample verses created`)
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
