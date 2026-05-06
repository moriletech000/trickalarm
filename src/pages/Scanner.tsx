import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useObjectDetection } from '../utils/objectDetection';
import { soundEngine } from '../utils/soundEngine';
import { ArrowLeft, Camera, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { getObjectIcon } from '../utils/objectIcons';

export default function Scanner() {
  const navigate = useNavigate();
  const { activeAlarm, setActiveAlarm, tfModel } = useAppStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [flashEffect, setFlashEffect] = useState<'green' | 'red' | null>(null);
  const [successDetected, setSuccessDetected] = useState(false);
  const [showManualConfirm, setShowManualConfirm] = useState(false);

  const { detectedObjects, isTargetFound, confidence, allPredictions } = useObjectDetection(
    videoRef,
    activeAlarm?.challengeObject || ''
  );

  // If model isn't loaded, show warning and allow manual dismissal
  const modelNotLoaded = !tfModel;

  // Show manual confirm button if confidence is between 30-45% (close but not quite)
  useEffect(() => {
    if (confidence > 0.3 && confidence < 0.45 && !isTargetFound) {
      setShowManualConfirm(true);
    } else if (confidence >= 0.45 || confidence === 0) {
      setShowManualConfirm(false);
    }
  }, [confidence, isTargetFound]);

  useEffect(() => {
    if (!activeAlarm) {
      navigate('/');
      return;
    }

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setCameraReady(true);
          };
        }
      } catch (error) {
        console.error('Camera error:', error);
        setCameraError('Camera access denied. Please enable camera permissions and try again.');
      }
    };

    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeAlarm, navigate]);

  useEffect(() => {
    if (isTargetFound && !successDetected) {
      setSuccessDetected(true);
      setFlashEffect('green');
      soundEngine.stop();

      setTimeout(() => {
        setActiveAlarm(null);
        // Reset the last triggered alarm to allow future alarms
        const { resetLastTriggeredAlarm } = require('../utils/alarmScheduler');
        resetLastTriggeredAlarm();
        navigate('/');
      }, 2000);
    }
  }, [isTargetFound, successDetected, navigate, setActiveAlarm]);

  const handleRetry = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraReady(true);
      }
    } catch (error) {
      setCameraError('Still unable to access camera. Please check your browser settings.');
    }
  };

  if (!activeAlarm) {
    return null;
  }

  const ObjectIcon = getObjectIcon(activeAlarm.challengeObject);

  const handleManualDismiss = () => {
    soundEngine.stop();
    setActiveAlarm(null);
    const { resetLastTriggeredAlarm } = require('../utils/alarmScheduler');
    resetLastTriggeredAlarm();
    navigate('/');
  };

  const handleManualConfirm = () => {
    // User confirms they have the object
    setSuccessDetected(true);
    setFlashEffect('green');
    soundEngine.stop();

    setTimeout(() => {
      setActiveAlarm(null);
      const { resetLastTriggeredAlarm } = require('../utils/alarmScheduler');
      resetLastTriggeredAlarm();
      navigate('/');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-yellow-500">Scan Object</h1>
          <button
            onClick={() => navigate('/alarm')}
            className="bg-zinc-900 rounded-xl px-4 py-2 text-white border-2 border-zinc-800 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Model Not Loaded Warning */}
        {modelNotLoaded && (
          <div className="border-2 border-yellow-500 rounded-2xl p-4 mb-6 bg-yellow-500/10">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-yellow-400 text-sm">
                AI model not loaded. Object detection is unavailable.
              </p>
            </div>
            <button
              onClick={handleManualDismiss}
              className="w-full bg-yellow-500 text-black py-2 rounded-xl font-semibold"
            >
              Dismiss Alarm Manually
            </button>
          </div>
        )}

        {/* Main Content - Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera Section */}
          <div className="relative bg-zinc-900 rounded-3xl overflow-hidden aspect-video border-2 border-zinc-800">
            {cameraError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                <Camera className="w-20 h-20 text-zinc-600 mb-4" />
                <p className="text-white font-semibold mb-2 text-xl">Camera Access Required</p>
                <p className="text-zinc-400 mb-6 max-w-sm">{cameraError}</p>
                <button
                  onClick={handleRetry}
                  className="bg-yellow-500 text-black px-8 py-3 rounded-xl font-semibold"
                >
                  Retry
                </button>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                <div
                  className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
                    flashEffect === 'green' ? 'flash-green' : ''
                  } ${flashEffect === 'red' ? 'flash-red' : ''}`}
                />

                {cameraReady && (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-48 h-48">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-yellow-500 rounded-tl-lg"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-yellow-500 rounded-tr-lg"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-yellow-500 rounded-bl-lg"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-yellow-500 rounded-br-lg"></div>

                        {!isTargetFound && (
                          <motion.div
                            animate={{ y: [0, 20, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"
                          />
                        )}
                      </div>
                    </div>

                    {successDetected && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/80"
                      >
                        <div className="text-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 1.2, 1] }}
                            transition={{ duration: 0.5 }}
                            className="flex justify-center mb-4"
                          >
                            <CheckCircle className="w-24 h-24 text-yellow-500" />
                          </motion.div>
                          <p className="text-white text-2xl font-bold">Object Found!</p>
                          <p className="text-zinc-300 mt-2">Alarm dismissed</p>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Detection Info Section */}
          <div className="flex flex-col space-y-4">
            {/* Target Object Card */}
            <div className="bg-zinc-900 rounded-2xl p-6 border-2 border-zinc-800">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <ObjectIcon className="w-16 h-16 lg:w-20 lg:h-20 text-yellow-500" strokeWidth={1.5} />
                  <div>
                    <div className="text-zinc-400 text-xs lg:text-sm mb-1">Target Object:</div>
                    <div className="text-yellow-500 font-bold text-2xl lg:text-3xl capitalize">
                      {activeAlarm.challengeObject}
                    </div>
                  </div>
                </div>
                {isTargetFound && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <CheckCircle className="w-12 h-12 lg:w-16 lg:h-16 text-yellow-500" />
                  </motion.div>
                )}
              </div>
            </div>

            {!successDetected && (
              <>
                {/* Detection Progress */}
                <div className="bg-zinc-900 rounded-2xl p-6 border-2 border-zinc-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white font-semibold text-sm lg:text-base">Detection Confidence</span>
                    <span className="text-yellow-500 font-bold text-xl lg:text-2xl">
                      {confidence > 0 ? `${Math.round(confidence * 100)}%` : '0%'}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-5 overflow-hidden border-2 border-zinc-700">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence * 100}%` }}
                      className="h-full bg-yellow-500 transition-all duration-300"
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-zinc-400 text-xs lg:text-sm">
                      {confidence >= 0.45 
                        ? 'Target detected!' 
                        : confidence >= 0.3
                        ? 'Possible match - confirm below'
                        : 'Need 45% confidence to auto-detect'}
                    </p>
                  </div>
                  
                  {/* Manual Confirm Button */}
                  {showManualConfirm && !successDetected && (
                    <motion.button
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleManualConfirm}
                      className="w-full mt-4 bg-yellow-500 text-black py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Yes, I have the {activeAlarm.challengeObject}
                    </motion.button>
                  )}
                </div>

                {/* Currently Detected Objects */}
                <div className="bg-zinc-900 rounded-2xl p-6 border-2 border-zinc-800">
                  <h3 className="text-white font-semibold mb-3 text-sm lg:text-base">Currently Detecting:</h3>
                  {detectedObjects.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {detectedObjects.slice(0, 8).map((obj, index) => {
                          const prediction = allPredictions?.find((p: any) => p.class === obj);
                          const isMatch = obj.toLowerCase().includes(activeAlarm.challengeObject.toLowerCase()) ||
                                         activeAlarm.challengeObject.toLowerCase().includes(obj.toLowerCase());
                          
                          return (
                            <span
                              key={index}
                              className={`px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl text-xs lg:text-sm font-medium ${
                                isMatch
                                  ? 'bg-yellow-500 text-black'
                                  : 'bg-zinc-800 text-zinc-300 border-2 border-zinc-700'
                              }`}
                            >
                              {obj} {prediction && `(${Math.round(prediction.score * 100)}%)`}
                            </span>
                          );
                        })}
                      </div>
                      
                      {/* Detection Tips */}
                      {detectedObjects.length > 0 && confidence < 0.3 && (
                        <div className="border-2 border-yellow-500 rounded-xl p-3 mt-3 bg-yellow-500/10 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                          <p className="text-yellow-400 text-xs">
                            <strong>Tips:</strong> Try different angles, better lighting, or move closer to the object
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-zinc-400 text-xs lg:text-sm">
                        No objects detected yet. Point your camera at objects.
                      </p>
                      <div className="border-2 border-yellow-500 rounded-xl p-3 bg-yellow-500/10 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <p className="text-yellow-400 text-xs">
                          <strong>For shoes:</strong> Show the side, top, or sole clearly in good lighting
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Message */}
                <div className="bg-zinc-900 rounded-2xl p-6 text-center border-2 border-zinc-800">
                  <p className="text-zinc-300 text-sm lg:text-base">
                    {isTargetFound
                      ? 'Target found! Dismissing alarm...'
                      : detectedObjects.length > 0
                      ? 'Keep looking for the target object...'
                      : 'Point your camera at objects to scan'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
