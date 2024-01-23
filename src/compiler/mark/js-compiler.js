import * as babelParser from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';
import jsx from '@vue/babel-plugin-jsx';

function transform(ast, replacer) {
  function replaceStrings(node) {
    if (t.isStringLiteral(node)) {
      return t.stringLiteral(replacer(node.value));
    } else if (t.isConditionalExpression(node)) {
      return t.conditionalExpression(
        replaceStrings(node.test),
        replaceStrings(node.consequent),
        replaceStrings(node.alternate),
      );
    } else if (t.isLogicalExpression(node)) {
      return t.logicalExpression(
        node.operator,
        replaceStrings(node.left),
        replaceStrings(node.right),
      );
    }
    return node;
  }
  traverse(ast, {
    JSXAttribute(path) {
      if (
        path.get('name').isJSXIdentifier({ name: 'class' }) ||
        path.get('name').isJSXIdentifier({ name: 'className' })
      ) {
        const valuePath = path.get('value');
        if (valuePath.node.value) {
          console.log(replacer(valuePath.node.value));
          valuePath.replaceWith(t.stringLiteral(replacer(valuePath.node.value)));
        }
      }
    },
    CallExpression(path) {
      const callee = path.get('callee');

      if (callee.isIdentifier() && callee.node.name === 'cx') {
        const args = path.get('arguments');
        args.forEach((arg) => {
          const replacedStr = replaceStrings(arg.node);

          if (replacedStr) {
            arg.replaceWith(replacedStr);
          }
        });
      }

      if (callee.isIdentifier() && callee.node.name === 'cva') {
        const args = path.get('arguments');
        args.forEach((arg) => {
          if (arg.isStringLiteral()) {
            arg.replaceWith(t.stringLiteral(replacer(arg.node.value)));
          }
          if (arg.isArrayExpression()) {
            arg.get('elements').forEach((element) => {
              if (element.isStringLiteral()) {
                element.replaceWith(t.stringLiteral(replacer(arg.node.value)));
              }
            });
          }
          if (arg.isObjectExpression()) {
            arg.get('properties').forEach((property) => {
              if (property.isObjectProperty()) {
                if (property.node.key.name === 'variants') {
                  const variantsObject = property.get('value');
                  variantsObject.get('properties').forEach((variantProperty) => {
                    const variantValue = variantProperty.get('value');
                    if (variantValue.isObjectExpression()) {
                      variantValue.get('properties').forEach((innerProperty) => {
                        const innerValue = innerProperty.get('value');
                        if (innerValue.isStringLiteral()) {
                          innerValue.replaceWith(t.stringLiteral(replacer(innerValue.node.value)));
                        } else if (innerValue.isArrayExpression()) {
                          innerValue.get('elements').forEach((element) => {
                            if (element.isStringLiteral()) {
                              element.replaceWith(t.stringLiteral(replacer(element.node.value)));
                            }
                          });
                        }
                      });
                    } else if (variantValue.isArrayExpression()) {
                      variantValue.get('elements').forEach((element) => {
                        if (element.isStringLiteral()) {
                          element.replaceWith(t.stringLiteral(replacer(element.node.value)));
                        }
                      });
                    }
                  });
                }
                if (property.node.key.name === 'compoundVariants') {
                  const compoundVariantsObject = property.get('value');
                  compoundVariantsObject.get('elements').forEach((compoundVariantsProp) => {
                    compoundVariantsProp.get('properties').forEach((prop) => {
                      if (prop.node.key.name === 'class') {
                        const classValue = prop.get('value');
                        if (classValue.isStringLiteral()) {
                          classValue.replaceWith(t.stringLiteral(replacer(classValue.node.value)));
                        }
                      }
                    });
                  });
                }
              }
            });
          }
        });
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
