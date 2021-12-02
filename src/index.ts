import { Translate } from "@google-cloud/translate/build/src/v2";
import { command, run, string, positional, subcommands, option } from 'cmd-ts';
import PO from 'pofile';
import fs from 'fs';
import path from 'path';

const CONFIG_NAME = ".transutil.json";
type ParseMode = "simple";

type Env =
    {
        sourceLang: string,
        targetLangs: string[]
        mode: ParseMode
    }

/*
    Load .transl.json in current directory.
*/
function loadEnv() {
    if (fs.existsSync(CONFIG_NAME)) {
        const env = JSON.parse(fs.readFileSync(CONFIG_NAME, "utf-8"));
        return env as Env;
    } else {
        throw new Error(`cannot find ${CONFIG_NAME}: do \`transutil init\` first.`);
    }
}


async function updateBody({ txt }: { txt: string }) {
    let env = loadEnv()
    var poNames = []
    for (const lang of env.targetLangs) {
        // TODO: abstract the way to give a naming rule
        const poName = txt + "_" + lang + ".po";
        poNames.push(poName);
    }

    for (const poName of poNames) {
        const content = fs.readFileSync(txt, { encoding: 'utf-8' });

        let pofile;
        if (fs.existsSync(poName)) {
            pofile = PO.parse(fs.readFileSync(poName, { encoding: "utf-8" }));
        }
        else {
            pofile = new PO();
        }

        let newItems = simpleParseAndReflect(pofile, content);
        pofile.save(poName, (err) => { if (err) console.log(err) });
    }
}

const update = command({
    name: 'load markdown and create po',
    args: {
        txt: positional({
            type: string,
        })
    },
    handler: updateBody
});

function po2txtBody({ po }: { po: string }) {
    const [txtName, lang] = path.parse(po).name.split("_");
    PO.load(po, (err, po) => {
        var content = fs.readFileSync(txtName, { encoding: "utf-8" });
        for (let item of po.items) {
            content = content.replace(item.msgid, concatStrings(item.msgstr));
        }
        let p = path.parse(txtName);
        let outName = p.name + "_" + lang + p.ext;
        fs.writeFileSync(outName, content);
    })
}

const po2txt = command({
    name: 'load a .po and crate a translated txt',
    args: {
        po: positional({
            type: string,
        })
    },
    handler: po2txtBody
});

const init = command({
    name: 'initialize and generate the config file',
    args: {},
    handler: () => {
        if (fs.existsSync(CONFIG_NAME)) {
            // do nothing
        } else {
            // if CONFIG_NAME does not exist, create it here
            const env = { sourceLang: "ja", targetLangs: ["en"], mode: "simple" };
            fs.writeFileSync(CONFIG_NAME, JSON.stringify(env));
            console.log(`${CONFIG_NAME} created`);
        }
    }
});



const app = subcommands(
    {
        name: 'transutil',
        cmds: { update, po2txt, init }
    },
);


run(app, process.argv.slice(2));

function concatStrings(lines: string[]) {
    return lines.join("\n")
}

function makeBlocks(content: string) {
    const lines = content.replace(/\n\n\n+/g, "\n\n").split("\n");
    let linesPool: string[] = [];
    let blocks: string[] = []
    for (let line of lines) {
        if (line == "" && linesPool != []) {
            blocks.push(concatStrings(linesPool));
            linesPool = []
        }
        else {
            linesPool.push(line);
        }
    }

    if (linesPool != []) {
        blocks.push(concatStrings(linesPool));
    }

    return blocks;
}

function simpleParseAndReflect(pofile: PO, content: string) {
    let blocks = makeBlocks(content);
    let newItems = [];

    for (let block of blocks) {
        if (block == "")
            continue;

        let item = pofile.items.find((item, _index, _items) => {
            return item.msgid == block
        })

        // new block
        if (item == null) {
            let item = new PO.Item();
            item.msgid = block;
            newItems.push(item);
        }
        else {
            newItems.push(item);
        }
    }
    pofile.items = newItems;
}

