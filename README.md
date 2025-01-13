# BrébeufHx Challenges

> Programming challenge platform with support for Python and JavaScript - No backend required!

## How to deploy

Find a static web server somewhere and you're good to go!

## Frameworks and components used

The code editor is a CodeMirror 6 instance, with autosuggestions disabled. Python code runs in WebAssembly thanks to Pyodide.

## Adding your own challenges

Edit the `data/challenges/challenges.json` file. Each object `L1`, `L2`, `L3` represents a difficulty level. Each challenge can have variations. The index of the prompt and the corresponding answer must match in the `prompts` and `answers` objects.

## Improvements to make

- Un-hardcode the difficulty levels
- Translate the UI to English
- Add test case support
