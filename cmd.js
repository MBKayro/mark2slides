#!/usr/bin/env node

const fs = require('fs')
const minimist = require('minimist')
const { clean, build } = require('./msg')

// because it would be a child process
const argv = minimist(process.argv.slice(4))

const help = () => console.log(`
[m2s]Hello, I'm a markdown-to-slides generator.

Usage: m2s <command> [options]

Options:
  -i, --input       input directory or markdown file, "." by default
  -o, --output      output directory, "dist" by default
  -b, --base        base path of the generated code, "/" by default
  -t, --theme       path of a a CSS file applied to all slides
  -c, --config      config file, ".mdrc" by default

Commands:
  build [options]   generate all markdown into slides
  clean             clean all temp files manually
  help

Config File:
  A JSON file which supports all options except "--config".
  And additionally it has two optional fields: "ignore" and "static".
  Both of them are array of string, which would be used to match all
  first-level sub directories in the target directory.
  But please notice the priority of command arguments are higher than
  this config file. That means you can use command arguments to
  overwrite this config file after the file is written down.
  For example:
  {
    "input": ".",
    "output": "dist",
    "base": "/",
    "theme": "theme.css",
    "ignore": ["dist", "theme.css"],
    "static": ["assets", "images"]
  }

`.trim())

if (process.argv, argv._.length > 1) {
  if (argv.h || argv.help) {
    help()
    return
  }
  console.error(`[m2s]Sorry, you couldn't run more than one commands at the same time.`)
  return
}

const cmd = argv._[0]

switch (cmd) {
  case 'clean':
    if (argv.h || argv.help) {
      help()
      return
    }
    clean()
    console.log('[m2s]Cleaned...')
    return
  case undefined:
  case 'help':
    help()
    return
  case 'build':
    if (argv.h || argv.help) {
      help()
      return
    }
    const argInput = argv.i || argv.input
    const argOutput = argv.o || argv.output
    const argBaseUrl = argv.b || argv.base
    const argTheme = argv.t || argv.theme
    const rcUrl = argv.c || argv.rc || '.mdrc'
    let config = {}
    try {
      if (fs.existsSync(rcUrl)) {
        config = JSON.parse(fs.readFileSync(rcUrl, { encoding: 'utf8' }))
      }
    } catch (error) {
      console.error(error)
    }
    const { ignore, static, output, input, base, theme } = config
    console.log('[m2s][start]Building...')
    build(argInput || input || '.', {
      output: argOutput || output || 'dist',
      baseUrl: argBaseUrl || base || '/',
      theme: argTheme || theme || '',
      ignore, static
    })
    return
  default:
    if (argv.h || argv.help) {
      help()
      return
    }
    if (fs.existsSync(cmd) && fs.lstatSync(cmd).isFile()) {
      const output = argv.o || argv.output || 'dist'
      const baseUrl = argv.b || argv.base || '/'
      console.log('[m2s][start]Building...')
      build(cmd, { output, baseUrl })
      return
    }
    console.error(`[m2s]Sorry, command "${cmd}" not supported.`)
}
