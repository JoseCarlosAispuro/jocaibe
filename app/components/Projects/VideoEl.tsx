// Safari/iOS requires H.264 MP4. Chrome/Firefox prefer WebM (smaller/better quality).
// This component lists MP4 first so Safari picks it up, then WebM as fallback.
// Upload both foo.mp4 and foo.webm to R2 for full cross-browser support.

import { assetUrl } from '@/app/helpers/assets'

interface VideoElProps {
  src: string           // original src (may be .webm, .mp4, etc.)
  className?: string
}

const toMp4 = (src: string) => src.replace(/\.(webm|ogg)$/i, '.mp4')

const VideoEl = ({ src, className }: VideoElProps) => {
  const isMp4 = /\.mp4$/i.test(src)

  return (
    <video
      key={src}
      autoPlay
      muted
      loop
      playsInline
      className={className}
    >
      {/* MP4 first — required for iOS Safari */}
      <source src={assetUrl(isMp4 ? src : toMp4(src))} type="video/mp4" />
      {/* WebM fallback — smaller file, preferred by Chrome/Firefox */}
      {!isMp4 && <source src={assetUrl(src)} type="video/webm" />}
    </video>
  )
}

export default VideoEl
