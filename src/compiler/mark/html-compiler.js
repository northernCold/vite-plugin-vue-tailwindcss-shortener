import * as parser from 'htmlparser2';
import generate from 'htmlparser-to-html';
import jsCompiler from '../mark/js-compiler.js';

// generate.configure({ disableAttribEscape: true });

// function transform(ast, replacer) {
//   function traverse(root) {
//     const attrs = root.attribs;
//     if (attrs) {
//       const staticClassName = attrs.class;
//       const dynamicClassName = attrs[':class'];
//       if (staticClassName) {
//         root.attribs['class'] = replacer(staticClassName);
//       }
//       if (dynamicClassName) {
//         root.attribs[':class'] = jsCompiler(dynamicClassName, replacer).replace(/"/g, "'");
//       }
//     }
//     root?.children?.forEach((child) => {
//       traverse(child);
//     });
//   }
//   traverse(ast);
// }

// export default function htmlCompiler(code, replacer) {
//   const ast = parser.parseDocument(code);
//   console.log('-------------------');
//   transform(ast, replacer);

//   const transformedCode = generate(ast.children);
//   console.log(transformedCode);

//   return transformedCode;
// }

const staticClassNameRegExp = /(?<!:)class\s*=\s*"([^"]*)"(?![^<]*{{[^}]*}})/gm;
const dynamicClassNameRegExp = /(?<=:)class\s*=\s*"([^"]*)"(?![^<]*{{[^}]*}})/gm;

export default function htmlCompiler(code, replacer) {
  let transformedCode = code.replace(staticClassNameRegExp, function (matched, $1) {
    return `class="${replacer($1)}"`;
  });

  transformedCode = transformedCode.replace(dynamicClassNameRegExp, function (matched, $1) {
    return `class="${jsCompiler($1, replacer).replace(/"/g, "'").replace(/;/, '')}"`;
  });
  return transformedCode;
}
