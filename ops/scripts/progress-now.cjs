#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const p = path.resolve(process.cwd(), 'ops/progress.yaml')
const yaml = fs.readFileSync(p, 'utf-8')

console.log('==== いまの進捗（簡単説明）====')
console.log('① いまやること: 空のフォルダに必要な箱と紙を置いて、画面とサーバーを動かす準備をします。')
console.log('② 終わったらどうなる?: 白黒の画面が開き、/healthz が OK と返します。')
console.log('③ 次にやること: データのノート（DB）や順番待ち箱（キュー）を足して、本番に近づけます。')
console.log('\n--- raw yaml ---')
console.log(yaml)
