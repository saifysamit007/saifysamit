import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Database,
  Cloud,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FileJson,
  Layers,
  Sparkles,
  Calendar,
  Clock,
  Trash2,
  HardDrive,
  Check,
  RefreshCw,
  FolderDown,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  subscribeToDataPacks,
  saveDataPackToFirestore,
  deleteDataPackFromFirestore,
  restoreDataPackToWebsite,
  createWebsiteDataPackSnapshot,
  WebsiteDataPack,
} from '../firebase';
import { PORTFOLIO_PROJECTS, SERVICES_DATA, TESTIMONIALS_DATA } from '../data/portfolioData';

interface DataPackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DataPackModal({ isOpen, onClose }: DataPackModalProps) {
  const [dataPacks, setDataPacks] = useState<WebsiteDataPack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [snapshotNotes, setSnapshotNotes] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // File upload state
  const [importedPack, setImportedPack] = useState<WebsiteDataPack | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Confirmation state for restoring
  const [confirmingPack, setConfirmingPack] = useState<WebsiteDataPack | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  // Real-time listener for Data Packs in Firestore
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = subscribeToDataPacks(
      (packs) => {
        setDataPacks(packs);
        setIsLoading(false);
      },
      (err) => {
        console.warn('DataPacks listener warning:', err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Create a fresh snapshot
  const handleCreateSnapshot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsCreatingSnapshot(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const created = await createWebsiteDataPackSnapshot(
        snapshotName.trim() || undefined,
        snapshotNotes.trim() || undefined
      );
      setActionSuccess(`✓ Snapshot "${created.name}" created and saved to Cloud Database!`);
      setShowCreateForm(false);
      setSnapshotName('');
      setSnapshotNotes('');
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setActionError(err?.message || 'Failed to create cloud snapshot.');
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  // 2. One-click Restore / Implement
  const handleExecuteRestore = async () => {
    if (!confirmingPack) return;
    setIsRestoring(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const result = await restoreDataPackToWebsite(confirmingPack);
      if (result.success) {
        setActionSuccess(`✓ ${result.message}`);
        setConfirmingPack(null);
        setTimeout(() => setActionSuccess(null), 5000);
      } else {
        setActionError(result.message);
      }
    } catch (err: any) {
      setActionError(err?.message || 'Failed to restore data pack.');
    } finally {
      setIsRestoring(false);
    }
  };

  // 3. Download Data Pack as JSON
  const handleDownloadPack = (pack: WebsiteDataPack) => {
    const jsonStr = JSON.stringify(pack, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = pack.name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
    a.download = `saify-samit-datapack-${safeName}-${pack.createdAt.slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 4. Download Current Live Website Data Pack immediately
  const handleDownloadCurrentLive = async () => {
    try {
      const livePack = await createWebsiteDataPackSnapshot(
        `Export ${new Date().toISOString().slice(0, 10)}`,
        'Live exported backup file'
      );
      handleDownloadPack(livePack);
      setActionSuccess('✓ Complete Website Data Pack exported as JSON!');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch {
      setActionError('Could not export live data.');
    }
  };

  // 5. Handle File Upload (JSON Data Pack)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        // Schema check
        if (!parsed.data || (!parsed.data.projects && !parsed.data.services && !parsed.data.testimonials)) {
          setActionError('Invalid Data Pack file: Missing data collections (projects, services, or testimonials).');
          return;
        }

        const normalizedPack: WebsiteDataPack = {
          id: parsed.id || `datapack-import-${Date.now()}`,
          name: parsed.name || file.name.replace('.json', ''),
          createdAt: parsed.createdAt || new Date().toISOString(),
          version: parsed.version || '2.0.0',
          notes: parsed.notes || 'Imported from local JSON backup',
          counts: {
            projects: parsed.data.projects?.length || 0,
            services: parsed.data.services?.length || 0,
            testimonials: parsed.data.testimonials?.length || 0,
          },
          data: {
            projects: parsed.data.projects || PORTFOLIO_PROJECTS,
            services: parsed.data.services || SERVICES_DATA,
            testimonials: parsed.data.testimonials || TESTIMONIALS_DATA,
            siteSettings: parsed.data.siteSettings || null,
          },
        };

        setImportedPack(normalizedPack);
        setActionError(null);
      } catch (err: any) {
        setActionError('Failed to parse JSON file. Please verify it is a valid Data Pack.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 6. Delete a snapshot
  const handleDeletePack = async (packId: string) => {
    try {
      await deleteDataPackFromFirestore(packId);
      setActionSuccess('Snapshot removed from cloud.');
      setTimeout(() => setActionSuccess(null), 2500);
    } catch {
      setActionError('Failed to remove snapshot.');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-[#0B1017] border border-zinc-800 rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between shrink-0 bg-[#0E141C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF4655]/15 border border-[#FF4655]/30 flex items-center justify-center text-[#FF4655] shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-display">
                  Website Data Pack Hub (ওয়ান-ক্লিক রিস্টোর ও ব্যাকআপ)
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                  <Cloud className="w-2.5 h-2.5" />
                  Cloud Synced
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                সম্পূর্ণ ওয়েবসাইট (Selected Work, Core Services, Client Testimonials) ব্যাকআপ ও এক ক্লিকে রিস্টোর
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800/70 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close Data Pack Hub"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Alerts */}
        {actionSuccess && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-emerald-950/80 border border-emerald-600/60 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-950/80 border border-red-600/60 rounded-xl text-red-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Quick Actions Top Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Create Snapshot Button */}
            <button
              type="button"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="p-3.5 rounded-xl bg-[#0E141C] hover:bg-[#141C26] border border-zinc-800 hover:border-[#FF4655]/50 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-white group-hover:text-[#FF4655] transition-colors">
                  + Create Cloud Snapshot
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#FF4655]" />
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Save the entire live website's current state to cloud
              </p>
            </button>

            {/* Download Live JSON */}
            <button
              type="button"
              onClick={handleDownloadCurrentLive}
              className="p-3.5 rounded-xl bg-[#0E141C] hover:bg-[#141C26] border border-zinc-800 hover:border-[#FF4655]/50 transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-white group-hover:text-[#FF4655] transition-colors">
                  Export Data Pack (.json)
                </span>
                <Download className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Download full website data file to your PC/storage
              </p>
            </button>

            {/* Upload & Implement JSON */}
            <label className="p-3.5 rounded-xl bg-[#0E141C] hover:bg-[#141C26] border border-zinc-800 hover:border-[#FF4655]/50 transition-all text-left group cursor-pointer block">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-white group-hover:text-[#FF4655] transition-colors">
                  Upload & Implement (.json)
                </span>
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Import any previous Data Pack file to restore live
              </p>
            </label>
          </div>

          {/* Create Snapshot Inline Form */}
          {showCreateForm && (
            <form
              onSubmit={handleCreateSnapshot}
              className="p-4 rounded-xl bg-[#080B0F] border border-[#FF4655]/30 space-y-3 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#FF4655]" />
                  Create Full Website Cloud Snapshot
                </span>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-zinc-500 hover:text-zinc-300 text-xs font-mono"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Snapshot Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={snapshotName}
                    onChange={(e) => setSnapshotName(e.target.value)}
                    placeholder={`e.g., Version 2.4 - Pre-Update Backup`}
                    className="w-full px-3 py-1.5 bg-[#0E141C] border border-zinc-700 rounded-lg text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                    Notes / Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={snapshotNotes}
                    onChange={(e) => setSnapshotNotes(e.target.value)}
                    placeholder="e.g., Contains 5 commercial cards, 6 services"
                    className="w-full px-3 py-1.5 bg-[#0E141C] border border-zinc-700 rounded-lg text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4655]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isCreatingSnapshot}
                  className="px-4 py-1.5 bg-[#FF4655] hover:bg-[#ff5a68] text-white text-xs font-mono font-bold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isCreatingSnapshot ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Save Snapshot Now</span>
                </button>
              </div>
            </form>
          )}

          {/* Uploaded Data Pack Preview & 1-Click Implement */}
          {importedPack && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-mono font-bold text-white">
                    Imported File Ready: {importedPack.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setImportedPack(null)}
                  className="text-zinc-400 hover:text-white text-xs font-mono"
                >
                  Discard
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0E141C] text-zinc-300 border border-zinc-700">
                  {importedPack.counts.projects} Projects
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0E141C] text-zinc-300 border border-zinc-700">
                  {importedPack.counts.services} Services
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0E141C] text-zinc-300 border border-zinc-700">
                  {importedPack.counts.testimonials} Testimonials
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-zinc-400 font-mono">
                  Clicking below will write this data to Firestore and immediately apply it to the live site.
                </p>
                <button
                  type="button"
                  onClick={() => setConfirmingPack(importedPack)}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-mono font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Implement To Live Site Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Cloud Snapshots List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#FF4655]" />
                <h3 className="text-xs sm:text-sm font-mono font-bold text-white uppercase tracking-wider">
                  Cloud Snapshots ({dataPacks.length})
                </h3>
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                Click "Implement" on any pack to load it into the live website
              </span>
            </div>

            {dataPacks.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#080B0F] border border-dashed border-zinc-800 text-center space-y-3">
                <Database className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-xs font-mono text-zinc-400">
                  No cloud snapshots saved yet. Click "+ Create Cloud Snapshot" above to save the current website state!
                </p>
                <button
                  type="button"
                  onClick={() => handleCreateSnapshot()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-semibold bg-[#FF4655] hover:bg-[#ff5a68] text-white rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Save First Snapshot</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dataPacks.map((pack) => (
                  <div
                    key={pack.id}
                    className="p-3.5 sm:p-4 rounded-xl bg-[#080B0F] border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-mono font-bold text-white group-hover:text-[#FF4655] transition-colors">
                          {pack.name}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                          v{pack.version || '2.0.0'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-mono flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-zinc-500" />
                          {pack.createdAt ? new Date(pack.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          {pack.createdAt ? new Date(pack.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                        <span className="text-[#FF4655] font-semibold">
                          {pack.counts?.projects ?? pack.data?.projects?.length ?? 0} Projects
                        </span>
                        <span>·</span>
                        <span className="text-blue-400 font-semibold">
                          {pack.counts?.services ?? pack.data?.services?.length ?? 0} Services
                        </span>
                        <span>·</span>
                        <span className="text-emerald-400 font-semibold">
                          {pack.counts?.testimonials ?? pack.data?.testimonials?.length ?? 0} Testimonials
                        </span>
                      </div>

                      {pack.notes && (
                        <p className="text-[11px] text-zinc-500 font-mono italic">
                          "{pack.notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {/* One-Click Implement Button */}
                      <button
                        type="button"
                        onClick={() => setConfirmingPack(pack)}
                        className="px-3 py-1.5 bg-[#FF4655] hover:bg-[#ff5a68] text-white text-xs font-mono font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-[#FF4655]/20 cursor-pointer"
                        title="Implement this snapshot to the entire website in 1 click"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Implement (চালু করুন)</span>
                      </button>

                      {/* Download JSON */}
                      <button
                        type="button"
                        onClick={() => handleDownloadPack(pack)}
                        className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        title="Download Data Pack JSON file"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Snapshot */}
                      <button
                        type="button"
                        onClick={() => handleDeletePack(pack.id)}
                        className="p-1.5 rounded-lg bg-zinc-800/40 hover:bg-red-950/60 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Delete this snapshot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Explanation banner */}
          <div className="p-3.5 rounded-xl bg-[#0E141B] border border-[#1F2833] flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-[11px] font-mono text-zinc-300 leading-relaxed">
              <strong>কিভাবে কাজ করে:</strong> আপনি ওয়েবসাইটে যেকোনো নতুন আপডেট বা পরিবর্তন করার আগে একটি <em>"Create Cloud Snapshot"</em> করে রাখতে পারেন। পরবর্তীতে নতুন কোনো ভার্সন আসলে অথবা কোনো ডাটা রিস্টোর করার প্রয়োজন হলে যেকোনো স্ন্যাপশট এর পাশের <strong>"Implement"</strong> বাটনে ১-ক্লিক করলেই ক্লাউড ফায়ারস্টোরে পুরো সাইটের আগের সমস্ত তথ্য ইনস্ট্যান্ট সেট হয়ে যাবে।
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {confirmingPack && (
          <div className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#0E141B] border border-[#FF4655]/40 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-[#FF4655]">
                <RotateCcw className="w-5 h-5 animate-spin" />
                <h3 className="text-sm font-mono font-bold text-white">
                  Confirm 1-Click Website Restore?
                </h3>
              </div>

              <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                Are you sure you want to implement Data Pack <strong>"{confirmingPack.name}"</strong>?
              </p>

              <div className="p-3 rounded-lg bg-[#080B0F] border border-zinc-800 text-[11px] font-mono space-y-1 text-zinc-400">
                <div>• Projects: <span className="text-white font-bold">{confirmingPack.counts?.projects ?? confirmingPack.data?.projects?.length ?? 0}</span></div>
                <div>• Core Services: <span className="text-white font-bold">{confirmingPack.counts?.services ?? confirmingPack.data?.services?.length ?? 0}</span></div>
                <div>• Testimonials: <span className="text-white font-bold">{confirmingPack.counts?.testimonials ?? confirmingPack.data?.testimonials?.length ?? 0}</span></div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmingPack(null)}
                  disabled={isRestoring}
                  className="px-3.5 py-1.5 text-xs font-mono text-zinc-400 hover:text-white bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRestore}
                  disabled={isRestoring}
                  className="px-4 py-1.5 text-xs font-mono font-bold bg-[#FF4655] hover:bg-[#ff5a68] text-white rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-lg shadow-[#FF4655]/25"
                >
                  {isRestoring ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>{isRestoring ? 'Implementing...' : 'Yes, Implement to Live Site'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
