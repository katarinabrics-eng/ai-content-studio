import Image from 'next/image'

interface LogoProps {
  dark?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function Logo({ dark = false, size = 'md' }: LogoProps) {
  const sizes = { sm: 80, md: 120, lg: 160 }
  const w = sizes[size]
  const src = dark ? '/logo02.png' : '/logo01.png'

  return (
    <Image
      src={src}
      alt="Piclio"
      width={w}
      height={Math.round(w / 3)}
      priority
      style={{ display: 'block' }}
    />
  )
}
