/**
 * @typedef {Object} Verse
 * @property {string} book_name - Nom du livre (ex: 'Genèse')
 * @property {number} bookId - Identifiant du livre (ex: 0)
 * @property {number} chapterId - Identifiant du chapitre (ex: 0)
 * @property {number} verseId - Identifiant du verset (ex: 0)
 * @property {string} text - Texte du verset
 */
/**
 * @typedef {Object} Book
 * @property {string} code - Code du livre (ex: 'GEN')
 * @property {string} name - Nom du livre
 * @property {string} testament - 'OLD' ou 'NEW'
 * @property {number} orderIndex
 * @property {number} chapterCount
 */

/**
 * @typedef {Object} VerseRef
 * @property {string} bookCode - Code du livre biblique (ex: 'JHN')
 * @property {number} chapter - Numéro du chapitre
 * @property {number} verse - Numéro du verset
 * @property {string} text - Texte du verset
 */

const fs = require('fs')
const path = require('path')

/**
 * @type {Book[]}
 */
const books = JSON.parse(fs.readFileSync('./data/books.json', 'utf8'))

/**
 * @type {Object.<string, string>}
 */
const bookNameToCode = {}
books.forEach((b) => {
    bookNameToCode[b.orderIndex - 1] = b.code
})

// Dossiers
const inputDir = './json_c'
const outputDir = './json'

// Création du dossier de sortie si besoin
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir)

/**
 * Transforme un fichier bible en tableau de références de versets.
 * @param {string} file - Nom du fichier à traiter
 * @returns {void}
 */
function transformBibleFile(file) {
    const content = fs.readFileSync(path.join(inputDir, file), 'utf8')
    /**
     * @type {Verse[]}
     */
    let data
    try {
        data = JSON.parse(content)
    } catch (e) {
        console.log(e)
        console.error('Erreur JSON dans', file)
        return
    }
    /**
     * @type {VerseRef[]}
     */
    const result = []
    // Parcours de la structure : data est un tableau de Verse
    data.forEach((verse) => {
        // Recherche du code du livre à partir du nom
        let bookCode = bookNameToCode[verse.bookId]
        if (!bookCode) bookCode = 'UNK'
        result.push({
            bookCode: bookCode,
            chapter: verse.chapterId + 1,
            verse: verse.verseId + 1,
            text: verse.text.trim()
        })
    })
    // Écriture du résultat
    fs.writeFileSync(
        path.join(outputDir, file),
        JSON.stringify(result, null, 2),
        'utf8'
    )
    console.log('Fichier traité :', file)
}

// Parcours de tous les fichiers JSON
fs.readdirSync(inputDir).forEach((file) => {
    if (file.endsWith('.json')) {
        transformBibleFile(file)
    }
})
