import React, { useState } from 'react';
import AudioPlayer from './AudioPlayer';
import VideoPlayer from './VideoPlayer';

const MediaPlayerDebug = () => {
  const [testUrl, setTestUrl] = useState('');
  const [mediaType, setMediaType] = useState('audio');

  // Test URLs for debugging
  const testUrls = {
    audio: [
      'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
      'https://file-examples.com/storage/fef45bbcb99b3b1f95db89a/2017/11/file_example_MP3_700KB.mp3',
      'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwfBTqW2O7Efz8JFnDE9tF/QAoUXrXo66NaFgsvaLbv2IhBJBY='
    ],
    video: [
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4'
    ]
  };

  const handlePlaySuccess = () => {
    console.log('✅ Media playback started successfully');
  };

  const handlePlayError = (error) => {
    console.error('❌ Media playback failed:', error);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Media Player Debug Tool
        </h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Media Type
            </label>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Test URL
            </label>
            <input
              type="url"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="Enter media URL or select from test URLs below"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Test URLs
            </label>
            <div className="space-y-2">
              {testUrls[mediaType].map((url, index) => (
                <button
                  key={index}
                  onClick={() => setTestUrl(url)}
                  className="block w-full text-left px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded border"
                >
                  Test URL {index + 1}: {url.substring(0, 60)}...
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Media Player Test
          </h3>

          {testUrl ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="text-sm text-gray-600 mb-2">
                  Testing URL: <span className="font-mono">{testUrl}</span>
                </div>

                {mediaType === 'audio' ? (
                  <AudioPlayer
                    src={testUrl}
                    title="Debug Audio Test"
                    onPlay={handlePlaySuccess}
                    onPause={() => console.log('Audio paused')}
                    onEnded={() => console.log('Audio ended')}
                    className="w-full"
                  />
                ) : (
                  <VideoPlayer
                    src={testUrl}
                    title="Debug Video Test"
                    onPlay={handlePlaySuccess}
                    onPause={() => console.log('Video paused')}
                    onEnded={() => console.log('Video ended')}
                    className="w-full"
                  />
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded">
                <h4 className="font-medium text-blue-900 mb-2">Debug Instructions:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Open browser developer tools (F12)</li>
                  <li>Go to Console tab</li>
                  <li>Try playing the media above</li>
                  <li>Check for any error messages in the console</li>
                  <li>Look for network requests in the Network tab</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Enter a media URL above to test playback
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium text-gray-900 mb-2">Common Issues & Solutions:</h4>
          <div className="text-sm text-gray-600 space-y-2">
            <div>• <strong>CORS errors:</strong> Server needs proper CORS headers</div>
            <div>• <strong>File format:</strong> Browser doesn't support the audio/video format</div>
            <div>• <strong>Network issues:</strong> URL is unreachable or requires authentication</div>
            <div>• <strong>Autoplay policy:</strong> Browser blocks autoplay without user interaction</div>
            <div>• <strong>HTTPS requirement:</strong> Some features require HTTPS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPlayerDebug;