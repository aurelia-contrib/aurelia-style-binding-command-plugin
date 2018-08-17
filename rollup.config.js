import typescript from 'rollup-plugin-typescript2';

export default ([
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/es2015/index.js',
      format: 'es'
    },
    plugins: [
      typescript({
        useTsconfigDeclarationDir: true,
        tsconfigOverride: {
          compilerOptions: {
            target: 'es2015',
            declaration: true,
            declarationDir: 'dist/types'
          },
          include: ['src']
        },
        cacheRoot: '.rollupcache'
      })
    ]
  }
].concat(process.env.NODE_ENV !== 'production'
  ? []
  : [{
    input: 'src/index.ts',
    output: [
      { file: 'dist/commonjs/index.js', format: 'cjs' },
      { file: 'dist/amd/index.js', format: 'amd', amd: { id: 'aurelia-style-binding-command-plugin' } },
      { file: 'dist/native-modules/index.js', format: 'es' }
    ],
    plugins: [
      typescript({
        tsconfigOverride: {
          compilerOptions: {
            target: 'es5'
          }
        },
        cacheRoot: '.rollupcache',
      })
    ]
  }]
));

