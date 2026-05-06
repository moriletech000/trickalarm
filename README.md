# 🚨 TrickAlarm

> A smart alarm clock that can't be dismissed until you scan a real-world object with your camera

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-AI-orange.svg)](https://www.tensorflow.org/js)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 🎯 Overview

TrickAlarm is an innovative alarm clock application that uses AI-powered object detection to ensure you actually wake up. When your alarm goes off, the only way to dismiss it is to point your device camera at a randomly assigned object (like a cup, shoe, or book). No more hitting snooze while half-asleep!

### ✨ Key Features

- 🤖 **AI Object Detection** - Uses TensorFlow.js and COCO-SSD model for real-time object recognition
- 📷 **Camera Integration** - Leverages device camera to verify objects
- 🎨 **Modern UI** - Clean black and yellow design with smooth animations
- 🔄 **Smart Scheduling** - Set alarms for specific days and times
- 🔊 **Custom Sounds** - Choose from beep, buzz, or bell alarm sounds
- 💾 **Offline Support** - Works completely offline, no API calls needed
- 📱 **PWA Ready** - Install as a Progressive Web App on any device
- 🎯 **20 Challenge Objects** - Random selection from cup, bottle, chair, laptop, and more

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Modern web browser with camera access
- HTTPS connection (required for camera API)

### Installation

```bash
# Clone the repository
git clone https://github.com/moriletech000/trickalarm.git

# Navigate to project directory
cd trickalarm

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `https://localhost:5173` (HTTPS is required for camera access)

### Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🎮 How to Use

1. **Create an Alarm**
   - Click the yellow "+" button on the home screen
   - Set your desired time and label
   - Select which days the alarm should repeat
   - Choose an alarm sound (beep, buzz, or bell)
   - A random challenge object will be assigned
   - Save your alarm

2. **When the Alarm Rings**
   - The alarm screen will take over your device
   - You'll see which object you need to find
   - Click "Start Scanning" to open the camera
   - Point your camera at the assigned object
   - Once detected with 45%+ confidence, the alarm dismisses

3. **Snooze Option**
   - You can snooze up to 2 times (5 minutes each)
   - After 2 snoozes, you must scan the object

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router v6** - Navigation
- **Lucide React** - Icon library

### AI & Detection
- **TensorFlow.js** - Machine learning in the browser
- **COCO-SSD Model** - Pre-trained object detection model
- Runs entirely client-side, no backend needed

### State Management
- **Zustand** - Lightweight state management
- **localStorage** - Persistent alarm storage

### Audio
- **Web Audio API** - Programmatic sound generation
- No audio files needed, all sounds generated in-browser

## 📁 Project Structure

```
trickalarm/
├── public/
│   ├── icon-192.png          # PWA icon
│   ├── icon-512.png          # PWA icon
│   └── manifest.json         # PWA manifest
├── src/
│   ├── components/
│   │   ├── AlarmCard.tsx     # Alarm list item component
│   │   └── LoadingScreen.tsx # AI model loading screen
│   ├── pages/
│   │   ├── Home.tsx          # Main dashboard
│   │   ├── SetAlarm.tsx      # Alarm creation/editing
│   │   ├── AlarmFiring.tsx   # Alarm ringing screen
│   │   └── Scanner.tsx       # Object detection screen
│   ├── hooks/
│   │   ├── useCamera.ts      # Camera access hook
│   │   └── useSoundEngine.ts # Audio management hook
│   ├── store/
│   │   └── appStore.ts       # Zustand state management
│   ├── utils/
│   │   ├── alarmScheduler.ts      # Alarm timing logic
│   │   ├── challengeObjects.ts    # Object definitions
│   │   ├── objectDetection.ts     # AI detection logic
│   │   ├── objectIcons.tsx        # Icon mappings
│   │   ├── soundEngine.ts         # Web Audio API wrapper
│   │   └── tensorflowLoader.ts    # TF.js model loader
│   ├── App.tsx               # Main app component
│   ├── main.tsx             # Entry point
│   └── index.css            # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎯 Challenge Objects

The app can detect 20 different objects:

- ☕ Cup
- 🍾 Bottle
- 🪑 Chair
- 💻 Laptop
- ⌨️ Keyboard
- 🖱️ Mouse
- 📖 Book
- 🎒 Backpack
- 📱 Cell Phone
- 📺 Remote
- ⏰ Clock
- ✂️ Scissors
- 🪥 Toothbrush
- 🥄 Spoon
- 🍴 Fork
- 🥣 Bowl
- ☂️ Umbrella
- 👜 Handbag
- 🧳 Suitcase
- 👟 Shoe

## 🔧 Configuration

### Camera Settings
The app uses the rear camera by default. To change camera preferences, modify `src/pages/Scanner.tsx`:

```typescript
const stream = await navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment', // 'user' for front camera
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
});
```

### Detection Confidence
Adjust the confidence threshold in `src/utils/objectDetection.ts`:

```typescript
const confidenceThreshold = 0.45; // 45% confidence required
```

### Alarm Check Interval
Modify how often the app checks for alarms in `src/utils/alarmScheduler.ts`:

```typescript
const intervalId = setInterval(checkAlarms, 30000); // Check every 30 seconds
```

## 🌐 Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Requirements:**
- Camera access permission
- HTTPS connection (or localhost)
- JavaScript enabled
- Modern browser with WebGL support

## 🔒 Privacy & Security

- **No Data Collection** - All processing happens locally on your device
- **No Backend** - No data is sent to any server
- **Camera Privacy** - Camera is only accessed when you explicitly start scanning
- **Offline First** - Works completely offline after initial load

## 🐛 Troubleshooting

### Camera Not Working
- Ensure you're using HTTPS (or localhost)
- Check browser permissions for camera access
- Try refreshing the page
- Verify camera is not being used by another app

### Object Not Detected
- Ensure good lighting conditions
- Try different angles of the object
- Move closer to the object
- Some objects work better than others (cup, bottle, laptop are most reliable)

### Alarm Not Firing
- Check that the alarm is toggled ON
- Verify at least one day is selected
- Ensure the time is set correctly
- Keep the browser tab open (or install as PWA)

### Model Loading Slowly
- First load downloads ~10MB AI model
- Subsequent loads use cached model
- Use "Skip and Continue" if model fails to load

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TensorFlow.js](https://www.tensorflow.org/js) - Machine learning framework
- [COCO-SSD](https://github.com/tensorflow/tfjs-models/tree/master/coco-ssd) - Object detection model
- [Lucide Icons](https://lucide.dev/) - Beautiful icon library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

## 📧 Contact

Project Link: [https://github.com/moriletech000/trickalarm](https://github.com/moriletech000/trickalarm)

---

Made with ☕ and 💻 to help you wake up on time!
