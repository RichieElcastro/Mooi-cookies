import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  AlertCircle,
  Pencil,
  Info,
  CalendarCheck,
  CalendarX,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { POBatchSchedule, Order } from '../types';
import { formatDateIndo } from '../utils/formatters';

interface ManagePODatesProps {
  batchSchedules: POBatchSchedule[];
  orders: Order[];
  onAddBatchSchedule: (schedule: POBatchSchedule) => void;
  onUpdateBatchSchedule: (schedule: POBatchSchedule) => void;
  onToggleBatchSchedule: (date: string) => void;
  onDeleteBatchSchedule: (date: string) => void;
  onSelectBatchDate?: (date: string) => void;
}

export const ManagePODates: React.FC<ManagePODatesProps> = ({
  batchSchedules,
  orders,
  onAddBatchSchedule,
  onUpdateBatchSchedule,
  onToggleBatchSchedule,
  onDeleteBatchSchedule,
  onSelectBatchDate,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingSchedule, setEditingSchedule] = useState<POBatchSchedule | null>(null);
  const [deletingDate, setDeletingDate] = useState<string | null>(null);

  // Form states for Add / Edit
  const [formDate, setFormDate] = useState<string>('');
  const [formLabel, setFormLabel] = useState<string>('');
  const [formCutoff, setFormCutoff] = useState<string>('20:00');
  const [formMaxSlots, setFormMaxSlots] = useState<number>(40);
  const [formNotes, setFormNotes] = useState<string>('');
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [formError, setFormError] = useState<string>('');

  const handleOpenAddModal = () => {
    // Generate default suggestion for next day after last scheduled date
    const sorted = [...batchSchedules].sort((a, b) => a.date.localeCompare(b.date));
    let nextDate = '2026-09-21';
    if (sorted.length > 0) {
      const lastDate = sorted[sorted.length - 1].date;
      const d = new Date(lastDate);
      d.setDate(d.getDate() + 1);
      nextDate = d.toISOString().split('T')[0];
    }

    setFormDate(nextDate);
    setFormLabel('Batch Spesial Patisserie');
    setFormCutoff('20:00');
    setFormMaxSlots(40);
    setFormNotes('Fresh baked & dikirim mulai pukul 11:30 WIB');
    setFormIsActive(true);
    setFormError('');
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item: POBatchSchedule) => {
    setEditingSchedule(item);
    setFormDate(item.date);
    setFormLabel(item.label || '');
    setFormCutoff(item.cutoffHour || '20:00');
    setFormMaxSlots(item.maxOrderSlots || 40);
    setFormNotes(item.notes || '');
    setFormIsActive(item.isActive);
    setFormError('');
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formDate) {
      setFormError('Silakan pilih tanggal batch PO.');
      return;
    }

    // Check duplicate
    if (batchSchedules.some((s) => s.date === formDate)) {
      setFormError(`Tanggal ${formDate} (${formatDateIndo(formDate)}) sudah ada dalam jadwal.`);
      return;
    }

    const newSchedule: POBatchSchedule = {
      date: formDate,
      label: formLabel.trim() || undefined,
      cutoffHour: formCutoff || '20:00',
      maxOrderSlots: Number(formMaxSlots) || 40,
      notes: formNotes.trim() || undefined,
      isActive: formIsActive,
    };

    onAddBatchSchedule(newSchedule);
    setShowAddModal(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule) return;
    setFormError('');

    const updated: POBatchSchedule = {
      ...editingSchedule,
      label: formLabel.trim() || undefined,
      cutoffHour: formCutoff || '20:00',
      maxOrderSlots: Number(formMaxSlots) || 40,
      notes: formNotes.trim() || undefined,
      isActive: formIsActive,
    };

    onUpdateBatchSchedule(updated);
    setEditingSchedule(null);
  };

  // Compute stats per batch date
  const statsByDate = batchSchedules.reduce((acc, s) => {
    const matchingOrders = orders.filter(
      (o) => o.poDate === s.date && o.orderStatus !== 'dibatalkan'
    );
    const totalRevenue = matchingOrders.reduce((sum, o) => sum + o.total, 0);
    const totalItems = matchingOrders.reduce(
      (sum, o) => sum + o.items.reduce((iSum, it) => iSum + it.quantity, 0),
      0
    );
    acc[s.date] = {
      ordersCount: matchingOrders.length,
      totalRevenue,
      totalItems,
    };
    return acc;
  }, {} as Record<string, { ordersCount: number; totalRevenue: number; totalItems: number }>);

  // Sorted schedules ascending by date
  const sortedSchedules = [...batchSchedules].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      {/* Header Info & Action Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-800 text-white flex items-center justify-center shrink-0 shadow-md">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 font-serif">
                Kelola Jadwal & Tanggal Batch PO
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                {batchSchedules.length} Tanggal Terdaftar
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Atur tanggal buka PO, status ketersediaan pemesanan, jam tutup (cutoff H-1), dan kuota slot produksi dapur.
            </p>
          </div>
        </div>

        <button
          type="button"
          id="add-new-batch-date-btn"
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tanggal PO Baru</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Tanggal Aktif (Open PO)</span>
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-stone-900">
            {batchSchedules.filter((s) => s.isActive).length} Tanggal
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-medium">
            Ditampilkan di beranda pemesanan pelanggan
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Tanggal Ditutup (Closed)</span>
            <CalendarX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-stone-900">
            {batchSchedules.filter((s) => !s.isActive).length} Tanggal
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Dapur sedang penuh / pesanan ditutup sementara
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span>Total Pesanan Masuk (Semua Batch)</span>
            <Layers className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-black text-stone-900">
            {orders.filter((o) => o.orderStatus !== 'dibatalkan').length} Order
          </div>
          <div className="text-[11px] text-stone-500 mt-1">
            Terbagi di seluruh batch tanggal aktif
          </div>
        </div>
      </div>

      {/* Batch Dates List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
            <span>Daftar Tanggal Pre-Order</span>
            <span className="text-xs font-normal text-stone-500">
              (Pelanggan dapat memilih tanggal yang bertanda &apos;Open PO&apos;)
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedSchedules.map((schedule) => {
            const stats = statsByDate[schedule.date] || {
              ordersCount: 0,
              totalRevenue: 0,
              totalItems: 0,
            };
            const isFull = (schedule.maxOrderSlots || 40) <= stats.ordersCount;

            return (
              <div
                key={schedule.date}
                id={`batch-date-card-${schedule.date}`}
                className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-2xs hover:shadow-xs ${
                  schedule.isActive
                    ? 'border-amber-200/90 ring-1 ring-amber-100'
                    : 'border-stone-200 bg-stone-50/70 opacity-90'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Top: Date & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-stone-400">
                          {schedule.date}
                        </span>
                        {schedule.label && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 truncate max-w-[150px]">
                            {schedule.label}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-extrabold text-stone-900 font-serif mt-1">
                        {formatDateIndo(schedule.date)}
                      </h4>
                    </div>

                    {/* Status Pill */}
                    <button
                      type="button"
                      id={`toggle-schedule-status-${schedule.date}`}
                      onClick={() => onToggleBatchSchedule(schedule.date)}
                      className={`px-2.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                        schedule.isActive
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-rose-300'
                      }`}
                      title="Klik untuk mengubah status Buka/Tutup PO"
                    >
                      {schedule.isActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Open PO</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Closed</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Cutoff & Quota detail */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 text-xs space-y-2">
                    <div className="flex items-center justify-between text-stone-600">
                      <span className="flex items-center gap-1 text-stone-500">
                        <Clock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Batas Pemesanan (Cutoff):</span>
                      </span>
                      <span className="font-bold text-stone-800">
                        H-1 pkl {schedule.cutoffHour} WIB
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-stone-600">
                      <span className="text-stone-500">Pesanan Masuk / Kapasitas:</span>
                      <span className="font-extrabold text-stone-900">
                        {stats.ordersCount} / {schedule.maxOrderSlots || 40} Order
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isFull
                            ? 'bg-rose-600'
                            : stats.ordersCount > (schedule.maxOrderSlots || 40) * 0.75
                            ? 'bg-amber-600'
                            : 'bg-emerald-600'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((stats.ordersCount / (schedule.maxOrderSlots || 40)) * 100)
                          )}%`,
                        }}
                      />
                    </div>

                    {schedule.notes && (
                      <div className="text-[11px] text-stone-500 italic pt-1 border-t border-stone-200">
                        Catatan: {schedule.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      id={`edit-schedule-btn-${schedule.date}`}
                      onClick={() => handleOpenEditModal(schedule)}
                      className="p-1.5 px-2.5 rounded-xl text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                      title="Edit rincian jadwal tanggal PO"
                    >
                      <Pencil className="w-3.5 h-3.5 text-amber-700" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      id={`delete-schedule-btn-${schedule.date}`}
                      onClick={() => setDeletingDate(schedule.date)}
                      className="p-1.5 px-2.5 rounded-xl text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
                      title="Hapus tanggal PO dari daftar"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Hapus</span>
                    </button>
                  </div>

                  {onSelectBatchDate && (
                    <button
                      type="button"
                      onClick={() => onSelectBatchDate(schedule.date)}
                      className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 underline underline-offset-2 cursor-pointer"
                    >
                      <span>Lihat Rekap</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guide Card for Kitchen Manager */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs text-amber-950">
        <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-extrabold text-amber-900">Tips Pengelolaan Batch Pre-Order:</div>
          <p className="text-amber-900/80 leading-relaxed">
            - Tanggal yang diset <strong>&apos;Open PO&apos;</strong> otomatis muncul di Hero Banner dan pilihan formulir Checkout pelanggan.
            <br />- Jika kapasitas oven atau tenaga dapur sudah mendekati batas maksimal, ubah status menjadi <strong>&apos;Closed&apos;</strong> agar pelanggan tidak dapat memilih tanggal tersebut untuk pesanan baru.
            <br />- Anda dapat menambahkan tanggal baru hingga berminggu-minggu ke depan untuk reservasi acara khusus, hari raya, atau hampers akhir pekan.
          </p>
        </div>
      </div>

      {/* MODAL: Tambah Tanggal PO Baru */}
      {showAddModal && (
        <div
          id="add-batch-date-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            id="add-batch-date-modal"
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 border border-stone-200 animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-800 text-white flex items-center justify-center shadow-xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Tambah Tanggal Batch PO Baru</h3>
                  <p className="text-xs text-stone-500">Buka jadwal pre-order baru untuk pelanggan</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Tanggal Picker */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Pilih Tanggal Pengantaran / Pengambilan (Hari H Batch):
                </label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 font-bold focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700"
                />
                {formDate && (
                  <p className="text-[11px] text-amber-800 font-bold mt-1">
                    Pratinjau Format: {formatDateIndo(formDate)}
                  </p>
                )}
              </div>

              {/* Label / Nama Batch */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Label / Tema Batch (Opsional):
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Batch Weekend Special / Fresh Baked Sabtu"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Jam Tutup Order (Cutoff) */}
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Jam Tutup Pemesanan (Cutoff H-1):
                  </label>
                  <input
                    type="text"
                    placeholder="20:00"
                    value={formCutoff}
                    onChange={(e) => setFormCutoff(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700"
                  />
                  <span className="text-[10px] text-stone-400">Format: 20:00 WIB</span>
                </div>

                {/* Kuota Kapasitas Maksimal */}
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Kapasitas Maksimal (Slot Order):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={formMaxSlots}
                    onChange={(e) => setFormMaxSlots(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 font-bold focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700"
                  />
                  <span className="text-[10px] text-stone-400">Total pesanan yang sanggup dipanggang</span>
                </div>
              </div>

              {/* Catatan Khusus Batch */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Catatan Batch Dapur (Opsional):
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Termasuk hampers Ramadan & edisi Basque Cheesecake matcha..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700"
                />
              </div>

              {/* Status Buka / Tutup Langsung */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                <input
                  type="checkbox"
                  id="checkbox-is-active"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-amber-700 rounded border-stone-300 focus:ring-amber-600 cursor-pointer"
                />
                <label htmlFor="checkbox-is-active" className="cursor-pointer">
                  <strong className="text-stone-800">Buka Status Pemesanan Sekarang (Open PO)</strong>
                  <p className="text-[11px] text-stone-500">
                    Jika dicentang, pelanggan dapat langsung memilih tanggal ini saat berbelanja.
                  </p>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="save-new-batch-date-btn"
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Tanggal PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Tanggal PO */}
      {editingSchedule && (
        <div
          id="edit-batch-date-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            id="edit-batch-date-modal"
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 border border-stone-200 animate-scaleUp"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-800 text-white flex items-center justify-center shadow-xs">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">
                    Edit Jadwal Batch {formatDateIndo(editingSchedule.date)}
                  </h3>
                  <p className="text-xs text-stone-500">Tanggal: {editingSchedule.date}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSchedule(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Label / Nama Batch */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Label / Tema Batch:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Batch Weekend Special / Fresh Baked Sabtu"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Jam Tutup Order (Cutoff) */}
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Jam Tutup Pemesanan (Cutoff H-1):
                  </label>
                  <input
                    type="text"
                    placeholder="20:00"
                    value={formCutoff}
                    onChange={(e) => setFormCutoff(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700"
                  />
                  <span className="text-[10px] text-stone-400">Format: 20:00 WIB</span>
                </div>

                {/* Kuota Kapasitas Maksimal */}
                <div>
                  <label className="block font-bold text-stone-800 mb-1">
                    Kapasitas Maksimal (Slot Order):
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={formMaxSlots}
                    onChange={(e) => setFormMaxSlots(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 font-bold focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700"
                  />
                </div>
              </div>

              {/* Catatan Khusus Batch */}
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Catatan Batch Dapur:
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Fresh baked oven 230°C..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-amber-600/30 focus:border-amber-700"
                />
              </div>

              {/* Status Buka / Tutup */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                <input
                  type="checkbox"
                  id="checkbox-edit-is-active"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-amber-700 rounded border-stone-300 focus:ring-amber-600 cursor-pointer"
                />
                <label htmlFor="checkbox-edit-is-active" className="cursor-pointer">
                  <strong className="text-stone-800">Status Pemesanan: Buka (Open PO)</strong>
                  <p className="text-[11px] text-stone-500">
                    Hilangkan centang jika batch ini sudah penuh atau ditutup sementara.
                  </p>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingSchedule(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="save-edit-batch-date-btn"
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus Tanggal */}
      {deletingDate && (
        <div
          id="delete-batch-date-modal-backdrop"
          className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div
            id="delete-batch-date-modal"
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 border border-stone-200 animate-scaleUp"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-stone-900 text-base leading-tight">
                  Hapus Tanggal Batch PO?
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Tanggal <strong>{formatDateIndo(deletingDate)}</strong> ({deletingDate}) akan dihapus dari jadwal pre-order aktif.
                </p>
              </div>
            </div>

            {orders.some((o) => o.poDate === deletingDate) && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Perhatian: Terdapat {orders.filter((o) => o.poDate === deletingDate).length} pesanan yang telah terdaftar pada tanggal ini. Riwayat pesanan tetap tercatat di tab pesanan dapur.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setDeletingDate(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                id="confirm-delete-batch-date-btn"
                onClick={() => {
                  onDeleteBatchSchedule(deletingDate);
                  setDeletingDate(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Ya, Hapus Tanggal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
