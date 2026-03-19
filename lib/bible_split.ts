import fs from 'fs';
import path from 'path';

const raw = JSON.parse(fs.readFileSync('./docs/bibles.json', 'utf8'));

const outputDir = './server/bible';

for (const entry of raw) {
    const { bookCode, chapter, verse, texts } = entry;

    const bookDir = path.join(outputDir, bookCode);
    const chapterFile = path.join(bookDir, `${chapter}.json`);

    // Crée le dossier du livre si nécessaire
    if (!fs.existsSync(bookDir)) {
        fs.mkdirSync(bookDir, { recursive: true });
    }

    // Si le fichier du chapitre n'existe pas encore, initialise-le
    if (!fs.existsSync(chapterFile)) {
        fs.writeFileSync(
            chapterFile,
            JSON.stringify(
                {
                    bookCode,
                    chapter,
                    verses: []
                },
                null,
                2
            )
        );
    }

    // Charge le chapitre existant
    const chapterData = JSON.parse(fs.readFileSync(chapterFile, 'utf8'));

    // Ajoute le verset
    chapterData.verses.push({ verse, texts });

    // Réécrit le fichier
    fs.writeFileSync(chapterFile, JSON.stringify(chapterData, null, 2));
}

console.log('Découpage terminé !');
