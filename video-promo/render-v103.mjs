const { renderMedia } = require('@remotion/renderer');
const path = require('path');

const outputPath = path.join(__dirname, 'out', 'godot-mcp-native-v103-update-full.mp4');

renderMedia({
  codec: 'h264',
  composition: {
    id: 'UpdateV103',
    width: 1280,
    height: 720,
    fps: 30,
    durationInFrames: 2160,
  },
  serveUrl: __dirname,
  outputPath,
}).then(() => {
  console.log('Render complete:', outputPath);
}).catch(err => {
  console.error('Render failed:', err);
  process.exit(1);
});
