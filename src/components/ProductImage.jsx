import React, { useState, useEffect } from 'react';
import { FALLBACK_IMAGE, toAbsoluteImage } from '../utils/productPresentation';

export default function ProductImage({
  src,
  alt = 'Product image',
  className = '',
  fallbackSrc = FALLBACK_IMAGE,
  ...props
}) {
  const [imgSrc, setImgSrc] = useState(() => (src ? toAbsoluteImage(src) : fallbackSrc));
  const [hasError, setHasError] = useState(!src);

  useEffect(() => {
    if (src) {
      setImgSrc(toAbsoluteImage(src));
      setHasError(false);
    } else {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  }, [src, fallbackSrc]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
