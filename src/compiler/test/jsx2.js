import jsCompiler from '../js-compiler.js';

const code = `
export default defineComponent({
  name: 'BasicTable',
  props: basicProps,
  setup() {
    return () => {
      return (
        <div ref={wrapRef} class={getWrapperClass.value}>
          {slots.search && (
            <div class="bg-white px-4 pt-6">
              <QueryFilter table-action={tableAction} onSearch={handleSearch} onReset={handleReset}>
                {{ default: () => slots.search?.() || [] }}
              </QueryFilter>
            </div>
          )}
          <div class={empty && cx('hidden m-2')}></div>
        </div>
      );
    };
  },
});
`;

console.log(
  jsCompiler(code, () => {
    return '__X__';
  }),
);
