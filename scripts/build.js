const path = require('path')
const chalk = require('chalk')
const fs = require('fs-extra')
const rollup = require('rollup')
const nodeResolve = require('rollup-plugin-node-resolve')
const typescript = require('rollup-plugin-typescript2')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')

const {
  targets: allTargets,
  chalkConsole,
  createExternal,
  DEFAULT_EXTENSIONS
} = require('./utils')
const packagesDir = path.resolve(__dirname, '../packages')

buildAll(allTargets)

async function buildAll(targets) {
  chalkConsole.start(targets.length)
  for (const target of targets) {
    chalkConsole.building(target)
    await build(target)
  }
  chalkConsole.success()
}

async function build(target) {
  const pkgDir = path.join(packagesDir, target)
  const json = require(path.join(pkgDir, 'package.json'))
  const inputOptions = {
    input: path.join(pkgDir, 'src/index.ts'),
    external: createExternal(json),
    plugins: createPlugins(pkgDir)
  }
  const outputOptions = {
    file: path.join(pkgDir, 'dist/index.js'),
    format: 'cjs',
    exports: 'named'
  }
  await fs.remove(path.join(pkgDir, 'dist'))
  const bundle = await rollup.rollup(inputOptions)

  await bundle.generate(outputOptions)
  await bundle.write(outputOptions)

  // 编译ts定义
  if (json.types || json.typings) {
    const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor')
    const extractorConfigPath = path.join(pkgDir, `api-extractor.json`)
    const extractorConfig = ExtractorConfig.loadFileAndPrepare(
      extractorConfigPath
    )
    const result = Extractor.invoke(extractorConfig, {
      localBuild: true,
      showVerboseMessages: true
    })

    if (result.succeeded) {
      console.log(
        chalk.bold(chalk.green(`API Extractor completed successfully.`))
      )
    } else {
      console.error(
        `API Extractor completed with ${extractorResult.errorCount} errors` +
          ` and ${extractorResult.warningCount} warnings`
      )
      process.exitCode = 1
    }
    await fs.remove(path.join(pkgDir, 'dist/src'))
  }
}

function createPlugins(pkgDir) {
  const plugins = [
    commonjs(),
    nodeResolve({
      extensions: DEFAULT_EXTENSIONS
    }),
    typescript({
      clean: true,
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          declarationDir: path.join(pkgDir, 'dist/src')
        },
        include: [path.join(pkgDir, 'src')]
      }
    }),
    babel({
      runtimeHelpers: true,
      extensions: DEFAULT_EXTENSIONS
    })
  ]
  return plugins
}
