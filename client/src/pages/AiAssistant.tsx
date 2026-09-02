import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, RotateCcw, AlertCircle, Mic, StopCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api, { transcribeAudio } from '../services/api';
import type { ChatMessage, ChatResponse } from '../types';

const SESSION_STORAGE_KEY = 'smart-farming-session-id';

function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID?.() || `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

export default function AiAssistant() {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: t('chat.welcomeMessage'), timestamp: new Date().toISOString() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    setInput('');
    setError(null);

    const userMessage: ChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const res = await api.post<ChatResponse>('/assistant/chat', {
        message: trimmed,
        sessionId: getSessionId(),
        language,
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: res.data.data.reply,
        timestamp: res.data.data.timestamp,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const msg = err.message || t('chat.error');
      setError(msg);

      // Show specific not-configured message
      if (msg.includes('not configured') || msg.includes('AI_NOT_CONFIGURED')) {
        setError(t('chat.notConfigured'));
      }
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      { role: 'assistant', content: t('chat.welcomeMessage'), timestamp: new Date().toISOString() },
    ]);
    setError(null);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  };

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const barCount = 24;
      const gap = 3;
      const barWidth = (w - (barCount - 1) * gap) / barCount;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const value = dataArray[i * step];
        const barHeight = Math.max(3, (value / 255) * h * 0.9);
        const x = i * (barWidth + gap);
        const y = (h - barHeight) / 2;

        ctx.fillStyle = `rgba(34, 197, 94, ${0.5 + (value / 255) * 0.5})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };
    draw();
  }, []);

  const getSupportedMimeType = (): string => {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/ogg', 'audio/mp4'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return '';
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop waveform visualization
      cancelAnimationFrame(animFrameRef.current);
      audioCtxRef.current?.close().catch(() => {});
      audioCtxRef.current = null;
      analyserRef.current = null;
      // Reset recording state immediately so the mic button returns to idle
      setIsRecording(false);
      mediaRecorderRef.current?.stop();
      return;
    }

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError(t('chat.voiceNotSupported'));
      return;
    }

    try {
      // Let the browser capture at its native sample rate (typically 48kHz).
      // Groq Whisper downsamples to 16kHz server-side — forcing 16kHz at
      // capture can cause browser-level resampling artifacts that hurt accuracy.
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        cancelAnimationFrame(animFrameRef.current);
        audioCtxRef.current?.close().catch(() => {});
        audioCtxRef.current = null;
        analyserRef.current = null;
        const blob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        if (blob.size === 0) return;

        setIsTranscribing(true);
        setError(null);
        try {
          const result = await transcribeAudio(blob);
          setInput((prev) => prev + result.text);
        } catch (err: any) {
          const msg = err.message || '';
          if (msg.includes('AI_NOT_CONFIGURED')) {
            setError(t('chat.notConfigured'));
          } else {
            setError(t('chat.transcriptionFailed'));
          }
        } finally {
          setIsTranscribing(false);
        }
      };

      // Set up Web Audio API for reactive waveform visualization
      try {
        const audioCtx = new AudioContext();
        // The AudioContext starts in "suspended" state (browser autoplay policy).
        // Without resuming, the AnalyserNode receives no data (waveform stays flat)
        // and on some Chromium builds the suspended graph can interfere with the
        // MediaRecorder's audio capture from the same stream.
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.7;
        source.connect(analyser);
        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;
      } catch {
        // Waveform visualization is optional — recording still works without it
      }

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setError(null);
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setError(t('chat.micPermissionDenied'));
      } else {
        setError(err?.message || t('chat.voiceNotSupported'));
      }
    }
  };

  // Start waveform visualization AFTER React commits the canvas to the DOM.
  // The canvas is conditionally rendered with {isRecording && <canvas/>}, so
  // canvasRef.current is only available after the re-render triggered by
  // setIsRecording(true) has been committed.
  useEffect(() => {
    if (isRecording && analyserRef.current) {
      drawWaveform();
    }
  }, [isRecording, drawWaveform]);

  // Cleanup recorder and audio context on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      audioCtxRef.current?.close().catch(() => {});
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-farm-50 text-farm-600">
            <MessageCircle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {t('chat.title')}
            </h1>
            <p className="text-sm text-gray-500">{t('chat.subtitle')}</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={14} />
          {t('chat.clearChat')}
        </button>
      </div>

      {/* Chat Container */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Messages */}
        <div className="h-[55vh] min-h-[350px] max-h-[600px] overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-farm-600 text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  {t('chat.sending')}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border-t border-red-100 px-4 py-2.5">
            <AlertCircle size={14} className="text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 p-3 bg-white">
          {/* Recording waveform */}
          {isRecording && (
            <div className="flex flex-col items-center gap-1 mb-2">
              <canvas
                ref={canvasRef}
                width={288}
                height={48}
                className="w-72 h-12"
              />
              <span className="text-xs text-red-600 font-medium">{t('chat.recording')}</span>
            </div>
          )}
          {/* Transcribing indicator */}
          {isTranscribing && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="flex gap-1">
                <div className="h-1.5 w-1.5 bg-farm-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-1.5 w-1.5 bg-farm-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-1.5 w-1.5 bg-farm-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-farm-600 font-medium">{t('chat.transcribing')}</span>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={t('chat.placeholder')}
              disabled={loading || isTranscribing}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-farm-400 disabled:opacity-50"
            />
            {/* Mic / Stop button */}
            <button
              onClick={toggleRecording}
              disabled={loading || isTranscribing}
              aria-label={isRecording ? t('chat.recording') : 'Voice input'}
              className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                isRecording
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {isRecording ? <StopCircle size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={sendMessage}
              disabled={loading || isTranscribing || !input.trim()}
              className="btn-primary !py-2.5 !px-4 !text-sm disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2 text-center">
            {t('chat.disclaimer')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
