import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import jsx from '@vue/babel-plugin-jsx';

function transform(ast, replacer) {
  traverse(ast, {
    StringLiteral(path) {
      const markRegexp = /@{([^}]*)}/g;
      if (markRegexp.test(path.node.value)) {
        path.node.value = path.node.value.replace(markRegexp, (marched, $1) => replacer($1));
      }
    },
  });
}

export default function jsCompiler(code, replacer) {
  const ast = babelParser.parse(code, {
    babelrc: false,
    ast: true,
    sourceType: 'module',
    configFile: false,
    plugins: [['jsx', jsx]],
  });

  transform(ast, replacer);

  const { code: transformedCode } = generate(ast);

  return transformedCode;
}
