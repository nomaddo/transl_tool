import { Translate } from "@google-cloud/translate/build/src/v2";

// Creates a client
const translate = new Translate();

const text = ['日本は明るいです。'];
const target = 'en';

async function translateText() {
    // Translates the text into the target language. "text" can be a string for
    // translating a single piece of text, or an array of strings for translating
    // multiple texts.
    let [translations] = await translate.translate(text, target);
    console.log('Translations:');
    translations.forEach((translation: any, i: number) => {
        console.log(`${text[i]} => (${target}) ${translation}`);
    });
}

translateText();