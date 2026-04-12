import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const BASE = 'public/placeholders/stock-vizualni knihovna'
const folders = ['K01','K02','K03','K04','K05','K07','K08','K09','K10']

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r,g,b), min = Math.min(r,g,b)
  let h, s, l = (max+min)/2
  if (max === min) { h = s = 0 } else {
    const d = max - min
    s = l > 0.5 ? d/(2-max-min) : d/(max+min)
    switch(max) {
      case r: h = ((g-b)/d + (g<b?6:0))/6; break
      case g: h = ((b-r)/d + 2)/6; break
      case b: h = ((r-g)/d + 4)/6; break
    }
  }
  return [h*360, s*100, l*100]
}

async function getVibrantColors(imgPath) {
  try {
    const { data } = await sharp(imgPath)
      .resize(80, 80, { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    // Zozbieraj len jasné a nasýtené pixely (nie tmavé pozadie)
    const buckets = {}
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i], g = data[i+1], b = data[i+2]
      const [h, s, l] = rgbToHsl(r, g, b)
      // Preskočiť príliš tmavé (l<15) a príliš svetlé (l>90) a nenasýtené (s<8)
      if (l < 15 || l > 90 || s < 8) continue
      // Zaokrúhliť do bucketu po 20°
      const hBucket = Math.round(h/20)*20
      const lBucket = Math.round(l/15)*15
      const key = `${hBucket}-${lBucket}`
      if (!buckets[key]) buckets[key] = {r:0,g:0,b:0,count:0}
      buckets[key].r += r; buckets[key].g += g
      buckets[key].b += b; buckets[key].count++
    }

    // Top 3 buckety podľa počtu pixelov
    return Object.values(buckets)
      .sort((a,b) => b.count - a.count)
      .slice(0, 3)
      .map(b => {
        const r = Math.round(b.r/b.count)
        const g = Math.round(b.g/b.count)
        const bl = Math.round(b.b/b.count)
        return `#${[r,g,bl].map(v=>v.toString(16).padStart(2,'0')).join('')}`
      })
  } catch(e) { return [] }
}

for (const folder of folders) {
  const dir = path.join(BASE, folder)
  if (!fs.existsSync(dir)) continue
  const files = fs.readdirSync(dir)
    .filter(f => /\.(jpe?g|png|webp)$/i.test(f))
    .slice(0, 10)

  const allColors = []
  for (const file of files) {
    const colors = await getVibrantColors(path.join(dir, file))
    allColors.push(...colors)
  }

  // Unikátne farby — odfiltruj duplikáty
  const unique = [...new Set(allColors)].slice(0, 5)
  console.log(`${folder}: ${unique.join(', ')}`)
}
