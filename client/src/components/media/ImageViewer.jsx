import React, { useState, useRef, useEffect } from 'react';

const ImageViewer = ({ src, title, alt, onLoad, className = '' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showFullscreen, setShowFullscreen] = useState(false);

  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (showFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showFullscreen]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
    onLoad?.();
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError('Failed to load image');
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 5));
    setIsZoomed(true);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel / 1.2, 1);
    setZoomLevel(newZoom);
    if (newZoom === 1) {
      setIsZoomed(false);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setIsZoomed(false);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (!isZoomed) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !isZoomed) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();

    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  const toggleFullscreen = () => {
    setShowFullscreen(!showFullscreen);
    if (!showFullscreen) {
      handleResetZoom();
    }
  };

  const handleKeyDown = (e) => {
    if (!showFullscreen) return;

    switch (e.key) {
      case 'Escape':
        setShowFullscreen(false);
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
      case '0':
        handleResetZoom();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (showFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showFullscreen]);

  const ImageComponent = () => (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${showFullscreen ? 'w-full h-full' : ''}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isZoomed ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
        </div>
      )}

      {error ? (
        <div className="flex items-center justify-center h-64 bg-gray-100 text-gray-600">
          <div className="text-center">
            <div className="text-4xl mb-2">🖼️</div>
            <p>Failed to load image</p>
          </div>
        </div>
      ) : (
        <img
          ref={imageRef}
          src={src}
          alt={alt || title || 'Content image'}
          className={`transition-transform duration-200 ${showFullscreen ? 'max-h-full max-w-full' : 'w-full h-auto'}`}
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x}px, ${position.y}px)`,
            transformOrigin: 'center center'
          }}
          onLoad={handleImageLoad}
          onError={handleImageError}
          draggable={false}
        />
      )}

      {/* Zoom Controls */}
      {!isLoading && !error && (
        <div className="absolute top-4 right-4 flex flex-col space-y-2">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
            title="Zoom in"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
            disabled={zoomLevel <= 1}
          >
            −
          </button>
          <button
            onClick={handleResetZoom}
            className="w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all text-xs"
            title="Reset zoom"
          >
            1:1
          </button>
          <button
            onClick={toggleFullscreen}
            className="w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full flex items-center justify-center transition-all"
            title={showFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {showFullscreen ? '⏷' : '⏹'}
          </button>
        </div>
      )}

      {/* Zoom Level Indicator */}
      {isZoomed && (
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
          {Math.round(zoomLevel * 100)}%
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Regular View */}
      <div className={`${className} ${showFullscreen ? 'hidden' : ''}`}>
        {title && (
          <div className="mb-2">
            <h3 className="font-medium text-gray-900">{title}</h3>
          </div>
        )}
        <div className="rounded-lg overflow-hidden shadow-sm border">
          <ImageComponent />
        </div>
      </div>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
          <div className="absolute top-4 left-4 text-white">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm opacity-75">
              Use mouse wheel to zoom, drag to pan, ESC to exit
            </p>
          </div>

          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full flex items-center justify-center transition-all"
          >
            ✕
          </button>

          <div className="w-full h-full flex items-center justify-center p-8">
            <ImageComponent />
          </div>
        </div>
      )}

      {/* Accessibility */}
      <div className="sr-only">
        <p>Image viewer for {title}</p>
        <p>Zoom level: {Math.round(zoomLevel * 100)}%</p>
        <p>Status: {isLoading ? 'Loading' : error ? 'Error' : 'Ready'}</p>
      </div>
    </>
  );
};

export default ImageViewer;