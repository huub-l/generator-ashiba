// ===========================
// Source Files/Folders Config
// ===========================
const style = require('./copySrc/style.js')
const script = require('./copySrc/script.js')

const copyAction = (data, context) => {
  if (data.simplecopy) {
    context.fs.copy(context.templatePath(data.src), context.destinationPath(data.dest))
  } else {
    context.fs.copyTpl(
      context.templatePath(data.src),
      context.destinationPath(data.dest),
      context.props
    )
  }
}

const checkCondition = (data, context) => {
  let error = false

  if (data.conditions) {
    for (const cond in data.conditions) {
      if (data.conditions[cond] !== context.props[cond]) {
        error = true
      }
    }
  }

  if (data.orConditions) {
    error = true
    for (const cond of data.orConditions) {
      for (const con in cond) {
        if (cond[con] === context.props[con]) {
          error = false
        }
      }
    }
  }

  if (data.notConditions) {
    for (const cond in data.notConditions) {
      if (data.notConditions[cond] === context.props[cond]) {
        error = true
      }
    }
  }

  if (!error) {
    copyAction(data, context)
  }
}

const processConfig = (cfg, context) => {
  // Copy all sources
  for (const file of cfg.files) {
    checkCondition(file, context)
  }
  for (const folder of cfg.folders) {
    checkCondition(folder, context)
  }
}

const copySources = () => {
  return {
    writing: context => {
      return new Promise((resolve) => {
        // Style
        const styleConfig = style(context)
        processConfig(styleConfig, context)

        // Script
        const scriptConfig = script(context)
        processConfig(scriptConfig, context)

        resolve()
      })
    }
  }
}

module.exports = copySources
