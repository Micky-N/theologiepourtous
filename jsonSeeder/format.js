const fs = require('fs')
const path = require('path')

// Dossier contenant les versions
const versionsDir = './json'
const outputFile = './final.json'

/**
 * @typedef {Object} VerseFinal
 * @property {string} bookCode
 * @property {number} chapter
 * @property {number} verse
 * @property {Object.<string, string>} texts
 */

/**
 * @typedef {Object} VerseRef
 * @property {string} bookCode - Code du livre biblique (ex: 'JHN')
 * @property {number} chapter - Numéro du chapitre
 * @property {number} verse - Numéro du verset
 * @property {string} text - Texte du verset
 */

/** @type {Object.<string, VerseFinal>} */
const merged = {}

// Récupère la liste des fichiers de version
const versionFiles = fs.readdirSync(versionsDir).filter(f => f.endsWith('.json'))

// Lecture de chaque version
versionFiles.forEach((file) => {
    const version = path.basename(file, '.json') // ex: LSG, S21, BDS
    /**
     * @type {VerseRef[]}
     */
    const verses = JSON.parse(fs.readFileSync(path.join(versionsDir, file), 'utf8'))
    verses.forEach((v) => {
        // Clé unique pour chaque verset
        const key = `${v.bookCode}_${v.chapter}_${v.verse}`
        if (!merged[key]) {
            merged[key] = {
                bookCode: v.bookCode,
                chapter: v.chapter,
                verse: v.verse,
                texts: {}
            }
        }
        // Ajoute le texte du verset pour la version
        merged[key].texts[version] = v.text
    })
})

// Transforme l'objet en tableau
const finalArray = Object.values(merged)

// Tri par bookCode, chapter, verse
finalArray.sort((a, b) => {
    if (a.bookCode !== b.bookCode) {
        return a.bookCode.localeCompare(b.bookCode)
    }
    if (a.chapter !== b.chapter) {
        return a.chapter - b.chapter
    }
    return a.verse - b.verse
})

// Écrit le résultat
fs.writeFileSync(outputFile, JSON.stringify(finalArray, null, 2), 'utf8')
console.log('Fusion terminée ! Fichier généré :', outputFile)
