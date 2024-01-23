import htmlCompiler from '../html-compiler.js';

const code = `
<template>
  <div class="h-full">
    <div :class="cx('w-20', empty && 'hidden')"></div>
    <div :class="button"></div>
  </div>
</template>
<script>
const baseButton = cva({})
const button = baseButton({ margin, padding });

</script>
`;

// console.log(htmlCompiler(code, () => '__XX__'));

console.log(
  htmlCompiler(code, (classNames) =>
    classNames
      .split(' ')
      .map((v) => `@{${v}}`)
      .join(' '),
  ),
);
