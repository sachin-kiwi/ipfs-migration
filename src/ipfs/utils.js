const path = require('path');

const IMAGE_EXT_LIST = [
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.svg',
  '.tif',
  '.tiff',
  '.webp'
]

const VIDEO_EXT_LIST = ['.avi', '.mp4', '.mpeg', '.ogv', '.ts', '.webm']

const AUDIO_EXT_LIST = [
  '.aac',
  '.mid',
  '.midi',
  '.mp3',
  '.oga',
  '.opus',
  '.wav',
  '.weba'
]

const getFileExt = (url) => {
  const ext = path.extname(url)
  if (IMAGE_EXT_LIST.includes(ext)) {
    return 'image'
  }
  if (VIDEO_EXT_LIST.includes(ext)) {
    return 'video'
  }
  if (AUDIO_EXT_LIST.includes(ext)) {
    return 'audio'
  }
  return 'unknown'
}

module.exports={
    getFileExt
}