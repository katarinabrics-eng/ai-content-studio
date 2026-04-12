import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const BASE = 'public/placeholders/stock-vizualni knihovna'
const folders = ['K01','K02','K03','K04','K05','K07','K08','K09','K10']

async function getDominantColors(imgPath) {
  try {
    const { data, info } = await sharp(imgPath)
      .resize(50, 50, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true })

    const pixels = []
    for (let i = 0; i < data.length; i += 3) {
      pixels.push([data[i], data[i+1], data[i+2]])
    }
    // Priemer každého kanálu
    const avg = pixels.reduce((acc, p) => [acc[0]+p[0], acc[1]+p[1], acc[2]+p[2]], [0,0,0])
      .map(v => Math.round(v / pixels.length))
    return `#${avg.map(v => v.toString(16).padStart(2,'0')).join('')}`
  } catch { return null }
}

for (const folder of folders) {
  const dir = path.join(BASE, folder)
  if (!fs.existsSync(dir)) continue

  const files = fs.readdirSync(dir)
    .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
    .slice(0, 8) // prvých 8 fotiek

  const colors = []
  for (const file of files) {
    const c = await getDominantColors(path.join(dir, file))
    if (c) colors.push(c)
  }
  console.log(`${folder}: ${JSON.stringify(colors)}`)
}
