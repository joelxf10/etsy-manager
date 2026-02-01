'use client'
import { useState } from 'react'
import Image from 'next/image'

interface ProductImageProps {
  src?: string | null
  alt: string
  fill?: boolean
  className?: string
  width?: number
  height?: number
}

export default function ProductImage({ src, alt, fill, className = '', width, height }: ProductImageProps) {
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  // Placeholder for missing/error images
  const placeholder = (
    <div className={`bg-gray-100 flex items-center justify-center ${fill ? 'absolute inset-0' : ''} ${className}`}
         style={!fill ? { width: width || 100, height: height || 100 } : undefined}>
      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </div>
  )

  if (!src || error) {
    return placeholder
  }

  // Handle different image sources
  let imageSrc = src

  // For 1688/Alibaba images, use a proxy or direct link
  if (src.includes('cbu01.alicdn.com') || src.includes('1688.com')) {
    // These images often have CORS issues, show placeholder or try proxy
    imageSrc = src
  }

  if (fill) {
    return (
      <div className="relative w-full h-full">
        {loading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        )}
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
          onError={() => setError(true)}
          onLoad={() => setLoading(false)}
          unoptimized
        />
      </div>
    )
  }

  return (
    <div className="relative" style={{ width: width || 100, height: height || 100 }}>
      {loading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <Image
        src={imageSrc}
        alt={alt}
        width={width || 100}
        height={height || 100}
        className={`${className} ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
        onError={() => setError(true)}
        onLoad={() => setLoading(false)}
        unoptimized
      />
    </div>
  )
}
