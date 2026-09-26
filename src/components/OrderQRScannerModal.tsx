import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScanLine,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Upload,
  RefreshCw,
  UserCheck,
  MapPin,
  CreditCard,
  ShieldCheck,
  PackageCheck,
  Clock,
  Phone,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import jsQR from 'jsqr';
import { Order, AuthUser, AffiliatePIC } from '../types';
import { formatRupiah, formatDateIndo } from '../utils/formatters';

interface OrderQRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onConfirmOrderPickup: (orderId: string, staffName: string) => void;
  currentUser: AuthUser | null;
  affiliatePICs?: AffiliatePIC[];
  initialOrderId?: string;
}

export const OrderQRScannerModal: React.FC<OrderQRScannerModalProps> = ({
  isOpen,
  onClose,
  orders,
  onConfirmOrderPickup,
  currentUser,
  affiliatePICs = [],
  initialOrderId,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'manual'>('camera');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  
  // Scanned order and verification state
  const [scannedId, setScannedId] = useState<string>(initialOrderId || '');
  const [verifiedOrder, setVerifiedOrder] = useState<Order | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [manualInputCode, setManualInputCode] = useState<string>('');
  const [pickupConfirmedSuccess, setPickupConfirmedSuccess] = useState<boolean>(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Sound effects using Web Audio API
  const playAudioFeedback = useCallback((type: 'success' | 'error' | 'confirm') => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'confirm') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        osc.frequency.setValueAtTime(190, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }
    } catch {
      // Audio context might be restricted before interaction
    }
  }, []);

  // Helper to extract clean order ID from raw scanned strings
  const extractOrderId = useCallback((raw: string): string => {
    if (!raw) return '';
    const trimmed = raw.trim();

    // Check if it's JSON
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed.orderId) return String(parsed.orderId);
        if (parsed.id) return String(parsed.id);
      } catch {
        // fallback
      }
    }

    // Check if it's a URL like https://.../?order=PO-20260918-001 or .../resi/PO-...
    try {
      if (trimmed.includes('http://') || trimmed.includes('https://')) {
        const url = new URL(trimmed);
        const orderParam = url.searchParams.get('order') || url.searchParams.get('id');
        if (orderParam) return orderParam;
        const segments = url.pathname.split('/').filter(Boolean);
        const last = segments[segments.length - 1];
        if (last && (last.startsWith('PO-') || last.length > 5)) return last;
      }
    } catch {
      // ignore
    }

    // Match patterns like "ORDER:PO-2026-..." or "#PO-2026-..." or just "PO-20260918-001"
    const poMatch = trimmed.match(/PO-[A-Za-z0-9-]+/i);
    if (poMatch) {
      return poMatch[0].toUpperCase();
    }

    // Remove leading hash or prefix
    return trimmed.replace(/^#/, '').replace(/^ORDER:/i, '').trim();
  }, []);

  // Verification against system database (orders array)
  const verifyOrderAgainstDatabase = useCallback(
    (orderIdRaw: string) => {
      const cleanId = extractOrderId(orderIdRaw);
      setScannedId(cleanId);
      setPickupConfirmedSuccess(false);

      if (!cleanId) {
        setVerificationError('Format kode QR tidak valid.');
        setVerifiedOrder(null);
        playAudioFeedback('error');
        return;
      }

      // Lookup in orders database
      const found = orders.find(
        (o) => o.id.toUpperCase() === cleanId.toUpperCase()
      );

      if (!found) {
        setVerificationError(`Pesanan dengan ID #${cleanId} TIDAK DITEMUKAN di database sistem.`);
        setVerifiedOrder(null);
        playAudioFeedback('error');
      } else {
        setVerifiedOrder(found);
        setVerificationError(null);
        playAudioFeedback('success');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(100);
        }
      }
    },
    [orders, extractOrderId, playAudioFeedback]
  );

  // Initialize camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCameraActive(false);

    if (!navigator?.mediaDevices?.getUserMedia) {
      setCameraError('Browser ini tidak mendukung akses kamera perangkat.');
      return;
    }

    try {
      // Stop any existing tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Camera access denied or failed:', err);
      const errorMsg =
        err instanceof Error
          ? err.name === 'NotAllowedError'
            ? 'Izin kamera ditolak. Silakan aktifkan izin kamera di pengaturan browser Anda.'
            : err.message
          : 'Gagal mengakses kamera.';
      setCameraError(errorMsg);
      setCameraActive(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (animationFrameIdRef.current) {
      cancelAnimationFrame(animationFrameIdRef.current);
      animationFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Continuous frame scanning loop with jsQR
  const scanLoop = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) {
      animationFrameIdRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'attemptBoth',
      });

      if (code && code.data) {
        const decodedString = code.data.trim();
        if (decodedString) {
          setIsScanning(false); // pause scanning on hit
          verifyOrderAgainstDatabase(decodedString);
          return;
        }
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(scanLoop);
  }, [isScanning, verifyOrderAgainstDatabase]);

  // Start or stop camera when modal opens/closes or active tab changes
  useEffect(() => {
    if (isOpen && activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, startCamera, stopCamera]);

  // Handle animation frame scanning
  useEffect(() => {
    if (cameraActive && isScanning && activeTab === 'camera') {
      animationFrameIdRef.current = requestAnimationFrame(scanLoop);
    }
    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
    };
  }, [cameraActive, isScanning, activeTab, scanLoop]);

  // Handle initial order id if supplied
  useEffect(() => {
    if (isOpen && initialOrderId) {
      verifyOrderAgainstDatabase(initialOrderId);
    }
  }, [isOpen, initialOrderId, verifyOrderAgainstDatabase]);

  // Handle image file upload for QR decoding
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth',
        });

        if (code && code.data) {
          verifyOrderAgainstDatabase(code.data);
        } else {
          setVerificationError('Tidak dapat mendeteksi kode QR dalam foto tersebut. Coba foto yang lebih jelas.');
          setVerifiedOrder(null);
          playAudioFeedback('error');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Confirm Handover Action
  const handleConfirmPickup = () => {
    if (!verifiedOrder) return;
    const staffName =
      currentUser?.name ||
      (currentUser?.role === 'affiliate'
        ? `PIC ${currentUser.affiliateCode || 'Affiliate'}`
        : 'Staf Dapur');

    onConfirmOrderPickup(verifiedOrder.id, staffName);
    setPickupConfirmedSuccess(true);
    playAudioFeedback('confirm');

    // Update local verified order status to completed
    setVerifiedOrder((prev) =>
      prev
        ? {
            ...prev,
            orderStatus: 'completed',
            paymentStatus: 'lunas',
            adminNotes: `${prev.adminNotes ? prev.adminNotes + ' | ' : ''}Diserahkan & diverifikasi via QR oleh ${staffName} pada ${new Date().toLocaleTimeString('id-ID')}`,
          }
        : null
    );
  };

  // Reset to scan another
  const handleScanAnother = () => {
    setVerifiedOrder(null);
    setVerificationError(null);
    setScannedId('');
    setManualInputCode('');
    setPickupConfirmedSuccess(false);
    setIsScanning(true);
  };

  if (!isOpen) return null;

  // Filter ready orders for quick test shortcuts
  const readyOrders = orders.filter((o) => o.orderStatus === 'ready');
  const userAffiliateCode = currentUser?.affiliateCode?.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        id="qr-verification-scanner-modal"
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col my-auto max-h-[95vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white p-4 sm:p-5 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ScanLine className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Verifikasi Serah Terima
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black px-2 py-0.5 rounded-full">
                  Kamera Aktif
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black font-serif text-white">
                Scan QR Resi Pengambilan PO
              </h2>
            </div>
          </div>
          <button
            type="button"
            id="close-qr-scanner-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-2 bg-stone-100 border-b border-stone-200 grid grid-cols-3 gap-1.5 text-xs font-bold">
          <button
            type="button"
            id="tab-camera-scanner-btn"
            onClick={() => {
              setActiveTab('camera');
              setIsScanning(true);
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'bg-amber-800 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Kamera Live</span>
          </button>
          <button
            type="button"
            id="tab-upload-qr-btn"
            onClick={() => {
              setActiveTab('upload');
              stopCamera();
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-amber-800 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Foto</span>
          </button>
          <button
            type="button"
            id="tab-manual-code-btn"
            onClick={() => {
              setActiveTab('manual');
              stopCamera();
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'manual'
                ? 'bg-amber-800 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Input Kode</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* CAMERA TAB */}
          {activeTab === 'camera' && !verifiedOrder && !verificationError && (
            <div className="space-y-3">
              <div className="relative rounded-2xl bg-black overflow-hidden aspect-4/3 sm:aspect-16/10 flex items-center justify-center border-2 border-stone-800 shadow-inner">
                {/* Real Video Element */}
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder Target Overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                  {/* Dark mask outside target */}
                  <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-amber-400/80 rounded-2xl overflow-hidden shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                    {/* Corner Target Markers */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                    {/* Animated laser scanning line */}
                    {isScanning && cameraActive && (
                      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-300 to-transparent shadow-[0_0_12px_#f59e0b] animate-bounce" />
                    )}
                  </div>

                  <span className="mt-3 text-xs font-semibold text-white/90 bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs">
                    {cameraActive
                      ? 'Posisikan QR Code Resi Pelanggan di dalam kotak'
                      : 'Menghubungkan ke kamera perangkat...'}
                  </span>
                </div>

                {/* Camera Error or Fallback Warning */}
                {cameraError && (
                  <div className="absolute inset-0 bg-stone-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-3 z-10">
                    <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <CameraOff className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-rose-300">Kamera Tidak Dapat Diakses</h4>
                      <p className="text-xs text-stone-300 mt-1 max-w-sm">{cameraError}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Coba Lagi</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('manual')}
                        className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <span>Gunakan Input Kode</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                <span>Tips: Pastikan kecerahan layar HP pelanggan cukup terang.</span>
                {cameraActive && (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center gap-1 text-amber-800 hover:underline font-bold"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Ganti / Refresh Kamera</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* UPLOAD PHOTO TAB */}
          {activeTab === 'upload' && !verifiedOrder && !verificationError && (
            <div className="p-6 border-2 border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-stone-50">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Unggah Foto atau Screenshot QR Resi</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-xs">
                  Pilih file gambar berformat PNG/JPG yang memuat QR Code tiket resi pembeli.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                id="select-qr-image-file-btn"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Pilih Foto dari Galeri
              </button>
            </div>
          )}

          {/* MANUAL INPUT TAB */}
          {activeTab === 'manual' && !verifiedOrder && !verificationError && (
            <div className="space-y-4">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <label htmlFor="manual-order-id-input" className="block text-xs font-bold text-stone-700">
                  Ketik Nomor Resi / Booking Code PO
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-mono font-bold text-sm">
                      #
                    </span>
                    <input
                      id="manual-order-id-input"
                      type="text"
                      placeholder="PO-20260918-001"
                      value={manualInputCode}
                      onChange={(e) => setManualInputCode(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && manualInputCode.trim()) {
                          verifyOrderAgainstDatabase(manualInputCode);
                        }
                      }}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-white border border-stone-300 font-mono text-sm uppercase font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <button
                    type="button"
                    id="submit-manual-code-btn"
                    disabled={!manualInputCode.trim()}
                    onClick={() => verifyOrderAgainstDatabase(manualInputCode)}
                    className="py-2.5 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
                  >
                    Verifikasi
                  </button>
                </div>
                <p className="text-[11px] text-stone-500">
                  Format dapat berupa kode booking seperti <code className="bg-stone-200 px-1 py-0.5 rounded text-stone-800 font-mono">PO-20260918-001</code>.
                </p>
              </div>

              {/* Quick shortcut demo orders */}
              {readyOrders.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-bold text-stone-600 block">
                    ⚡ Shortcut: Pilih Pesanan Berstatus Siap Diambil di Database:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {readyOrders.slice(0, 4).map((ro) => (
                      <button
                        key={ro.id}
                        type="button"
                        onClick={() => verifyOrderAgainstDatabase(ro.id)}
                        className="p-2.5 text-left rounded-xl bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50/50 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-black text-amber-900">
                            #{ro.id}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Siap Ambil
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-stone-800 mt-1 truncate">
                          {ro.customerName}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          {ro.items.reduce((s, i) => s + i.quantity, 0)} item • {formatRupiah(ro.total)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VERIFICATION ERROR RESULT */}
          {verificationError && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-950 space-y-3 animate-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-rose-900">
                    Verifikasi Gagal: Pesanan Tidak Cocok
                  </h4>
                  <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                    {verificationError}
                  </p>
                  {scannedId && (
                    <div className="mt-2 inline-block bg-white px-2.5 py-1 rounded-lg border border-rose-200 font-mono text-xs font-bold text-rose-900">
                      ID Terbaca: #{scannedId}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  id="retry-scan-qr-btn"
                  onClick={handleScanAnother}
                  className="py-2 px-3 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Ulang</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('manual')}
                  className="py-2 px-3 rounded-xl bg-white border border-rose-300 text-rose-900 font-bold text-xs hover:bg-rose-100 transition-colors cursor-pointer"
                >
                  <span>Cari Manual</span>
                </button>
              </div>
            </div>
          )}

          {/* VERIFIED ORDER CARD (SUCCESS MATCH) */}
          {verifiedOrder && (
            <div className="space-y-4 animate-fade-in">
              {/* Pickup Confirmation Success Banner */}
              {pickupConfirmedSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-600 text-white shadow-lg space-y-2 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-white/20 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-emerald-100" />
                  </div>
                  <h3 className="text-base font-extrabold font-serif">
                    Serah Terima Berhasil Dikonfirmasi!
                  </h3>
                  <p className="text-xs text-emerald-100 max-w-sm mx-auto">
                    Pesanan #{verifiedOrder.id} telah ditandai &apos;Selesai Diambil&apos; oleh pelanggan di database sistem.
                  </p>
                </div>
              ) : (
                /* Status Validation Callout */
                <div>
                  {verifiedOrder.orderStatus === 'ready' ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-400/80 text-emerald-950 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-emerald-900 uppercase tracking-wider block">
                            Status Valid: Siap Diambil
                          </span>
                          <span className="text-[11px] text-emerald-700">
                            Pesanan cocok dan siap diserahkan kepada pelanggan.
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-emerald-200 text-emerald-900 text-[10px] font-black rounded-lg uppercase tracking-wider">
                        Cocok 100%
                      </span>
                    </div>
                  ) : verifiedOrder.orderStatus === 'completed' ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-amber-900 uppercase tracking-wider block">
                          Perhatian: Pesanan Sudah Pernah Diambil!
                        </span>
                        <span className="text-[11px] text-amber-800">
                          Pesanan #{verifiedOrder.id} sudah berstatus &apos;Selesai&apos;. Cek riwayat untuk mencegah klaim ganda.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-amber-900 uppercase tracking-wider block">
                          Status: Sedang Dipersiapkan Dapur
                        </span>
                        <span className="text-[11px] text-amber-800">
                          Status saat ini masih &apos;{verifiedOrder.orderStatus}&apos;. Belum berstatus &apos;Siap Diambil&apos;.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Order Verification Details Container */}
              <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 space-y-4">
                {/* Order Top Summary */}
                <div className="flex items-start justify-between border-b border-stone-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Kode Booking Terverifikasi
                    </span>
                    <span className="font-mono text-xl font-black text-stone-900">
                      #{verifiedOrder.id}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider ${
                        verifiedOrder.paymentStatus === 'lunas'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      {verifiedOrder.paymentStatus === 'lunas' ? 'Lunas' : 'COD / Bayar Saat Ambil'}
                    </span>
                    <span className="block text-[11px] text-stone-500 mt-1">
                      Batch PO: {formatDateIndo(verifiedOrder.poDate)}
                    </span>
                  </div>
                </div>

                {/* Customer Identity Match */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-stone-200/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] text-stone-400 font-bold block uppercase">
                        Nama Pemesan
                      </span>
                      <span className="text-xs sm:text-sm font-black text-stone-900 truncate block">
                        {verifiedOrder.customerName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-stone-400 font-bold block uppercase">
                        Nomor HP
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-800">
                        {verifiedOrder.customerPhone}
                      </span>
                    </div>
                    {verifiedOrder.customerPhone && (
                      <a
                        href={`https://wa.me/${verifiedOrder.customerPhone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
                        title="Chat WhatsApp Pelanggan"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Pickup / Affiliate Drop Point Location Check */}
                <div className="bg-white p-3 rounded-xl border border-stone-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                      <MapPin className="w-3.5 h-3.5 text-amber-700" />
                      <span>Lokasi Pengambilan:</span>
                    </div>
                    {verifiedOrder.affiliateCode && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        PIC Kode: {verifiedOrder.affiliateCode}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-semibold text-stone-900 pl-5">
                    {verifiedOrder.orderType === 'pickup'
                      ? verifiedOrder.pickupLocationType === 'titik_kumpul_affiliate'
                        ? verifiedOrder.affiliatePickupLocation || `Titik Kumpul Affiliate (${verifiedOrder.affiliateCode})`
                        : 'Ambil Sendiri di Dapur Utama Store'
                      : `Pengantaran Kurir ke: ${verifiedOrder.deliveryAddress || '-'}`}
                  </p>

                  {/* Affiliate Match Alert */}
                  {userAffiliateCode && (
                    <div className="pl-5 pt-1">
                      {verifiedOrder.affiliateCode?.toUpperCase() === userAffiliateCode ? (
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Cocok: Pesanan ini terdaftar untuk Drop Point Anda!
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Catatan: Pesanan ini ditujukan untuk PIC kode: {verifiedOrder.affiliateCode || 'Dapur Utama'}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Ordered Items List */}
                <div className="bg-white p-3 rounded-xl border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span className="flex items-center gap-1.5">
                      <PackageCheck className="w-3.5 h-3.5 text-amber-700" />
                      <span>Rincian Menu Hidangan ({verifiedOrder.items.reduce((s, i) => s + i.quantity, 0)} item):</span>
                    </span>
                    <span className="text-amber-900 font-mono font-black">
                      {formatRupiah(verifiedOrder.total)}
                    </span>
                  </div>

                  <div className="divide-y divide-stone-100 max-h-36 overflow-y-auto pr-1">
                    {verifiedOrder.items.map((item, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-stone-900">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                          {item.notes && (
                            <span className="block text-[10px] text-stone-500 italic">
                              Catatan: {item.notes}
                            </span>
                          )}
                        </div>
                        <span className="text-stone-700 font-mono shrink-0">
                          {formatRupiah(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Payment Alert if COD */}
                  {verifiedOrder.paymentStatus !== 'lunas' && (
                    <div className="p-2 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-950 text-xs font-bold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-amber-800" />
                        <span>Tagih Pembayaran Tunai/QRIS:</span>
                      </span>
                      <span className="font-mono text-sm font-black text-rose-700">
                        {formatRupiah(verifiedOrder.total)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Handover Action Buttons */}
              <div className="pt-1 flex flex-col sm:flex-row gap-2">
                {!pickupConfirmedSuccess && verifiedOrder.orderStatus !== 'completed' && (
                  <button
                    type="button"
                    id="confirm-order-pickup-btn"
                    onClick={handleConfirmPickup}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Telah Diambil Pelanggan</span>
                  </button>
                )}

                <button
                  type="button"
                  id="scan-next-order-btn"
                  onClick={handleScanAnother}
                  className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Scan Pesanan Lain</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <span className="text-[11px]">
            {currentUser?.role === 'affiliate'
              ? `Login: Koordinator PIC ${currentUser.affiliateCode || ''}`
              : currentUser?.role === 'dapur' || currentUser?.role === 'admin'
              ? 'Login: Tim Dapur & Kasir'
              : 'Mode Pemindai QR Pengambilan'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-1 px-3 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
