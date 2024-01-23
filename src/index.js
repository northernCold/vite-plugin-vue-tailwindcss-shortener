import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import jsMapCompiler from './compiler/map/js-compiler';
import jsMarkCompiler from './compiler/mark/js-compiler';
import htmlMarkCompiler from './compiler/mark/html-compiler';
import cssCompiler from './compiler/map/css-compiler';
import { parse } from 'vue/compiler-sfc';

let cssMap;
let configPath;
let inputPath;
let outputPath;
let tailwindTranformedCode;

function getCssMap(className) {
  if (!cssMap) {
    const result = fs.readFileSync(configPath, 'utf8');
    cssMap = JSON.parse(result);
  }
  return cssMap[className] ?? className;
}

export default function ({ tailwindUrl }) {
  return {
    name: 'vite-plugin-vue-tailwindcss-shortener',
    configResolved: async ({ root }) => {
      configPath = path.resolve(root, './.css-map/cssMap.json');
      inputPath = path.resolve(root, tailwindUrl);
      outputPath = path.resolve(root, './.css-map/output.css');
      const tailwindCodeUint8Array = execSync(`npx tailwindcss -i ${inputPath}`);
      const textDecoder = new TextDecoder('utf-8');
      const tailwindCode = textDecoder.decode(tailwindCodeUint8Array);

      fs.writeFile(outputPath, tailwindCode, 'utf-8', (error) => {
        if (error) {
          console.error(error);
        }
      });

      const [_tailwindTransformCode, _cssMap] = cssCompiler(tailwindCode);
      tailwindTranformedCode = _tailwindTransformCode;
      cssMap = _cssMap;
    },
    load(id) {
      const replacer = (classNames) =>
        classNames
          .split(' ')
          .map((v) => `@{${v}}`)
          .join(' ');
      if (/.vue$/.test(id)) {
        const code = fs.readFileSync(id, { encoding: 'utf-8' });
        const {
          descriptor: { template, script, scriptSetup, styles },
        } = parse(code);

        const stringifyAttrs = (attrs) =>
          Object.keys(attrs)
            .map((key) => {
              if (typeof attrs[key] === 'boolean') {
                return key;
              } else {
                return `${key}=${attrs[key]}`;
              }
            })
            .join(' ');
        let transformedTemplateCode;
        let transformedScriptCode;
        let transformedScriptSetupCode;
        let transformedStylesCode;

        if (template) {
          const code = htmlMarkCompiler(template.content, replacer);
          const attriutesStr = stringifyAttrs(template.attrs);
          transformedTemplateCode = `<template ${attriutesStr}>${code}</template>`;
        }

        if (script) {
          const code = jsMapCompiler(script.content, replacer);
          const attriutesStr = stringifyAttrs(script.attrs);
          transformedScriptCode = `<script ${attriutesStr}>${code}</script>`;
        }

        if (scriptSetup) {
          const code = jsMapCompiler(scriptSetup.content, replacer);
          const attriutesStr = stringifyAttrs(scriptSetup.attrs);
          transformedScriptSetupCode = `<script ${attriutesStr}>${code}</script>`;
        }

        if (styles) {
          transformedStylesCode = styles.map((style) => {
            const attriutesStr = stringifyAttrs(style.attrs);
            return `<style ${attriutesStr}>${style.content}</style>`;
          });
        }

        const transformedCode = [
          transformedTemplateCode,
          transformedScriptCode,
          transformedScriptSetupCode,
          transformedStylesCode,
        ]
          .filter((v) => v)
          .join('\n');

        return transformedCode;
      }
      if (/.jsx$/.test(id)) {
        const code = fs.readFileSync(id, { encoding: 'utf-8' });
        const transformedCode = jsMarkCompiler(code, replacer);
        console.log(transformedCode);
        return transformedCode;
      }
    },
    transform(code, id) {
      if (/tailwind.css/.test(id)) {
        return tailwindTranformedCode;
      }
      if (/.vue$/.test(id) || /.jsx$/.test(id)) {
        const transformed = jsMapCompiler(code, (className) => getCssMap(className) ?? className);
        return transformed;
      }
    },
    transformIndexHtml() {}
  };
}
