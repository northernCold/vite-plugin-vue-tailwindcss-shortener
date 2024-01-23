import { CssShortener } from 'css-shortener';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

export default function cssCompiler(code) {
  const root = postcss.parse(code);
  const cssShortener = new CssShortener();
  const selectorProcessor = selectorParser((selectors) => {
    selectors.walkClasses((node) => {
      node.value = cssShortener.shortenClassName(node.value);
    });
  });

  root.walkRules((ruleNode) => {
    ruleNode.selector = selectorProcessor.processSync(ruleNode);
  });

  const transformedCode = root.toString();
  const cssMap = cssShortener.map;

  return [transformedCode, cssMap];
}
