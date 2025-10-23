#!/usr/bin/env node
// Read Lighthouse JSON from stdin and print accessibility score. Exit 1 if below threshold.

const THRESHOLD = Number(process.env.A11Y_THRESHOLD || 95)

async function readStdin() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

;(async () => {
  try {
    const text = await readStdin()
    const report = JSON.parse(text)
    const cat = report.categories && report.categories.accessibility
    const score = Math.round(((cat && cat.score) || 0) * 100)
    const url = report.requestedUrl || 'unknown'
    const out = { url, score, threshold: THRESHOLD }
    console.log(JSON.stringify(out))
    if (score < THRESHOLD) process.exit(1)
  } catch (e) {
    console.error('Failed to parse Lighthouse JSON:', e && e.message)
    process.exit(2)
  }
})()
