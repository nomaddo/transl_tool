# transutil

Stupid translation helper for texts based on paragraphs.

## install

`npm run build` and `cp dist/main.js ~/.local/bintransutil`.

TODO: Shold be more convenient

## usage

### Initialize 

At first, Create `.transutil.json` by the following command:

```console
$ transutil init
```

You need configure `.transutil.json` as you like:

```
{"sourceLang":"ja","targetLangs":["en"],"mode":"simple"}
```


### Create .po file

```console
$ transutil update a.txt
$ ls                     
  a.txt a.txt_en.po
```

### Edit a .po file in man-hand

You can edit a .po file and fill `msgstr` fields with any editor!

### Create a translated file

```console
$ transutil po2txt a.txt_en.po
$ ls                     
  a.txt a.txt_en.po en_a.txt
```


If you
`en_a.txt` is what you need.

## How it works?

This tool works based on paragraphs.
It recognizes lines separated by a blank line as a translated unit.

For example: This text has three paragraphs.

```
aaaaa
bbbbb

ccccc


ddddd


```

```
msgid ""
"aaaaa\n"
"bbbbb"
msgstr ""

msgid "ccccc"
msgstr ""

msgid "ddddd"
msgstr ""
```