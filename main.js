// To pack: run
// `npx esbuild --minify --bundle main.js --outfile=editor.js`

import { basicSetup, EditorView } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { EditorState } from "@codemirror/state";
import { EditorView as View } from "@codemirror/view"; // Import from @codemirror/view

// Hide the existing textarea
const textarea = document.querySelector("textarea");
textarea.style.display = "none";

// Create a CodeMirror editor with the textarea's contents
const view = new EditorView({
  state: EditorState.create({
    doc: textarea.value,
    extensions: [
      View.lineWrapping, // Correct way to enable line wrapping
      basicSetup, // Basic setup for the editor (theme, keymap, etc.)
      javascript({}), // JavaScript syntax highlighting
    ],
  }),
  parent: document.body, // Attach editor view to body (or another container)
});

// Insert the editor into the document
const codeMirrorWrapper = document.createElement("div");
codeMirrorWrapper.id = "codemirror-wrapper";
codeMirrorWrapper.appendChild(view.dom);
textarea.insertAdjacentElement("afterend", codeMirrorWrapper);

// When submitting the form, update the textarea with the editor's contents
textarea.onchange = function () {
  textarea.value = view.state.doc.toString(); // Use .toString() to get text content
};
