const fs = require('fs')
const chalk = require('chalk')

exports.chalkConsole = {
  success: () => {
    console.log(chalk.green(`=========================================`))
    console.log(chalk.green(`========打包成功(build success)!=========`))
    console.log(chalk.green(`=========================================`))
  },
  building: name => {
    console.log(chalk.blue(`正在打包${name}...`))
  },
  start: nums => {
    console.log(chalk.green(`共有${nums}个文件待打包...`))
  }
}

exports.targets = fs.readdirSync('packages').filter(f => {
  if (!fs.statSync(`packages/${f}`).isDirectory()) {
    return false
  }

  if (!fs.existsSync(`packages/${f}/src/index.ts`)) {
    return false
  }
  return true
})

exports.createExternal = packageJson => {
  let external = ['@babel']
  const dependenciesMap = [
    'dependencies',
    'devDependencies',
    'peerDependencies'
  ]
  dependenciesMap.forEach(key => {
    if (packageJson[key]) {
      external = external.concat(Object.keys(packageJson[key]))
    }
  })

  return id => external.some(item => String(id).indexOf(item) === 0)
}

exports.DEFAULT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json']
