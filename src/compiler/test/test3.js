import jsCompiler from '../js-compiler.js';

const code = `
import { cx, cva } from 'class-variance-authority';

const button = cva('flex', ["font-semibold", "border", "rounded"], {
  variants: {
    intent: {
      primary: [
        "bg-blue-500",
        "text-white",
        "border-transparent",
        "hover:bg-blue-600",
      ],
      // **or**
      // primary: "bg-blue-500 text-white border-transparent hover:bg-blue-600",
      secondary: [
        "bg-white",
        "text-gray-800",
        "border-gray-400",
        "hover:bg-gray-100",
      ],
    },
    size: {
      small: ["text-sm", "py-1", "px-2"],
      medium: ["text-base", "py-2", "px-4"],
    },
  },
  compoundVariants: [
    {
      intent: "primary",
      size: "medium",
      class: "uppercase",
    },
  ],
  defaultVariants: {
    intent: "primary",
    size: "medium",
  },
});

const box = cva(["box", "box-border"], {
  variants: {
    margin: { 0: "m-0", 2: "m-2", 4: "m-4", 8: "m-8" },
    padding: { 0: "p-0", 2: "p-2", 4: "p-4", 8: "p-8" },
  },
  defaultVariants: {
    margin: 0,
    padding: 0,
  },
});

const card = ({ margin, padding, shadow } = {}) => cx('flex', box({ margin, padding }), cva({ shadow }));
`;

console.log(
  jsCompiler(code, () => {
    return '__X__';
  }),
);
