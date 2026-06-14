import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Rotate3d, Plus, Trash2, Edit2, Save, Upload, Folder, FileCode, ImageIcon, X, Check } from 'lucide-react'
import { Icon } from '@iconify/react'

interface SoftwareTool {
  id?: number;
  name: string;
  slug: string;
  iconType: "iconify" | "custom_r2";
  iconValue: string;
  color?: string;
}

interface AlbumFile {
  key: string;
  name: string;
  size: number;
}

interface Album {
  albumSlug: string;
  title: string;
  files: AlbumFile[];
  softwareList: string[];
}

interface UploadStatus {
  fileName: string;
  progress: number;
  status: 'idle' | 'uploading' | 'completed' | 'failed';
  error?: string;
}

export function GalleryDashboard() {
  // States untuk 3D Gallery
  const [albums, setAlbums] = React.useState<Album[]>([]);
  const [softwareTools, setSoftwareTools] = React.useState<SoftwareTool[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedAlbum, setSelectedAlbum] = React.useState<Album | null>(null);
  const [bucketName, setBucketName] = React.useState('dev-web-porto-r2');
  
  // States untuk membuat album baru
  const [showCreateAlbum, setShowCreateAlbum] = React.useState(false);
  const [newAlbumSlug, setNewAlbumSlug] = React.useState('');
  const [newAlbumTitle, setNewAlbumTitle] = React.useState('');
  const [createAlbumMsg, setCreateAlbumMsg] = React.useState('');
  const [creatingAlbum, setCreatingAlbum] = React.useState(false);
  
  // States untuk form Software Tool
  const [softwareForm, setSoftwareForm] = React.useState<SoftwareTool>({
    name: '',
    slug: '',
    iconType: 'iconify',
    iconValue: '',
    color: '#ffffff'
  });
  const [editingSoftwareId, setEditingSoftwareId] = React.useState<number | null>(null);
  const [softwareSvgFile, setSoftwareSvgFile] = React.useState<File | null>(null);
  const [softwareMsg, setSoftwareMsg] = React.useState('');

  // States untuk edit Album Metadata
  const [albumTitle, setAlbumTitle] = React.useState('');
  const [albumSoftware, setAlbumSoftware] = React.useState<string[]>([]);
  const [albumMsg, setAlbumMsg] = React.useState('');
  const [showSwDropdown, setShowSwDropdown] = React.useState(false);
  
  // States untuk rename file
  const [renamingKey, setRenamingKey] = React.useState<string | null>(null);
  const [renamingName, setRenamingName] = React.useState('');
  const [renamingLoading, setRenamingLoading] = React.useState(false);

  // States untuk multi-upload berkas ke Album
  const [uploadFiles, setUploadFiles] = React.useState<File[]>([]);
  const [uploadStatuses, setUploadStatuses] = React.useState<Record<string, UploadStatus>>({});
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/albums');
      if (res.ok) {
        const data = await res.json();
        setAlbums(data.albums || []);
        setSoftwareTools(data.softwareTools || []);
        if (data.bucketName) {
          setBucketName(data.bucketName);
        }
      }
    } catch (e) {
      console.error("Gagal memuat data admin gallery:", e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  // Set form album saat diklik
  const handleSelectAlbum = (album: Album) => {
    setSelectedAlbum(album);
    setAlbumTitle(album.title);
    setAlbumSoftware(album.softwareList || []);
    setAlbumMsg('');
  };

  // Submit Album Metadata (D1)
  const handleSaveAlbumMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum) return;

    try {
      const res = await fetch('/api/admin/albums/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          albumSlug: selectedAlbum.albumSlug,
          title: albumTitle,
          softwareList: albumSoftware
        })
      });

      if (res.ok) {
        setAlbumMsg('Metadata album berhasil disimpan!');
        // Refresh local data
        setAlbums(albums.map(a => 
          a.albumSlug === selectedAlbum.albumSlug 
            ? { ...a, title: albumTitle, softwareList: albumSoftware } 
            : a
        ));
        // Update selected state
        setSelectedAlbum({
          ...selectedAlbum,
          title: albumTitle,
          softwareList: albumSoftware
        });
        setTimeout(() => setAlbumMsg(''), 3000);
      } else {
        setAlbumMsg('Gagal menyimpan metadata.');
      }
    } catch (err) {
      setAlbumMsg('Terjadi kesalahan jaringan.');
    }
  };

  // Toggle software selection for album
  const handleToggleSoftwareForAlbum = (slug: string) => {
    if (albumSoftware.includes(slug)) {
      setAlbumSoftware(albumSoftware.filter(s => s !== slug));
    } else {
      setAlbumSoftware([...albumSoftware, slug]);
    }
  };

  // Ganti nama file R2
  const handleRenameFile = async (fileKey: string) => {
    if (!selectedAlbum || !renamingName) return;

    try {
      setRenamingLoading(true);
      const res = await fetch('/api/admin/albums/rename-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          albumSlug: selectedAlbum.albumSlug,
          oldKey: fileKey,
          newFileName: renamingName
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedFiles = selectedAlbum.files.map(f => 
          f.key === fileKey ? { ...f, key: data.newKey, name: renamingName } : f
        );
        
        setAlbums(albums.map(a => 
          a.albumSlug === selectedAlbum.albumSlug ? { ...a, files: updatedFiles } : a
        ));
        
        setSelectedAlbum({
          ...selectedAlbum,
          files: updatedFiles
        });
        
        setRenamingKey(null);
        setRenamingName('');
        setAlbumMsg('Nama berkas berhasil diubah!');
        setTimeout(() => setAlbumMsg(''), 3000);
      } else {
        const err = await res.json();
        setAlbumMsg(err.error || 'Gagal mengubah nama berkas.');
      }
    } catch (err) {
      setAlbumMsg('Terjadi kesalahan jaringan.');
    } finally {
      setRenamingLoading(false);
    }
  };

  // Logika unggah berkas tunggal (PUT biasa jika < 5MB, Multipart jika >= 5MB)
  const uploadSingleFile = async (file: File): Promise<{ key: string; name: string; size: number } | null> => {
    const updateProgress = (progress: number, status: UploadStatus['status'], error?: string) => {
      setUploadStatuses(prev => ({
        ...prev,
        [file.name]: {
          fileName: file.name,
          progress,
          status,
          error
        }
      }));
    };

    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunk size

    try {
      if (file.size < CHUNK_SIZE) {
        // --- UPLOAD PUT TUNGGAL (< 5MB) ---
        const formData = new FormData();
        formData.append('albumSlug', selectedAlbum!.albumSlug);
        formData.append('file', file);

        updateProgress(40, 'uploading');
        const res = await fetch('/api/admin/albums/upload', {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const result = await res.json();
          updateProgress(100, 'completed');
          return { key: result.key, name: file.name, size: file.size };
        } else {
          const err = await res.json();
          updateProgress(0, 'failed', err.error || 'Unggah gagal');
          return null;
        }
      } else {
        // --- UPLOAD MULTIPART (>= 5MB) ---
        // 1. Inisialisasi
        updateProgress(5, 'uploading');
        const startRes = await fetch('/api/admin/albums/upload/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            albumSlug: selectedAlbum!.albumSlug,
            fileName: file.name,
            fileType: file.type
          })
        });

        if (!startRes.ok) {
          const err = await startRes.json();
          updateProgress(0, 'failed', err.error || 'Gagal memulai multipart upload');
          return null;
        }

        const { uploadId, key } = await startRes.json();
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        const uploadedParts: Array<{ partNumber: number; etag: string }> = [];

        // 2. Unggah part satu per satu
        for (let i = 0; i < totalChunks; i++) {
          const start = i * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, file.size);
          const chunk = file.slice(start, end);

          const formData = new FormData();
          formData.append('key', key);
          formData.append('uploadId', uploadId);
          formData.append('partNumber', (i + 1).toString());
          formData.append('file', chunk);

          const partRes = await fetch('/api/admin/albums/upload/part', {
            method: 'POST',
            body: formData
          });

          if (!partRes.ok) {
            updateProgress(0, 'failed', `Gagal mengunggah bagian ${i + 1}`);
            return null;
          }

          const partInfo = await partRes.json();
          uploadedParts.push(partInfo);

          // Update progres (rentang 10% s.d. 90%)
          const currentProgress = Math.round(10 + ((i + 1) / totalChunks) * 80);
          updateProgress(currentProgress, 'uploading');
        }

        // 3. Selesaikan gabungan berkas
        updateProgress(95, 'uploading');
        const completeRes = await fetch('/api/admin/albums/upload/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            key,
            uploadId,
            parts: uploadedParts,
            fileName: file.name,
            albumSlug: selectedAlbum!.albumSlug
          })
        });

        if (completeRes.ok) {
          updateProgress(100, 'completed');
          return { key, name: file.name, size: file.size };
        } else {
          const err = await completeRes.json();
          updateProgress(0, 'failed', err.error || 'Gagal menggabungkan berkas');
          return null;
        }
      }
    } catch (err: any) {
      updateProgress(0, 'failed', err.message || 'Kesalahan jaringan');
      return null;
    }
  };

  // Form submit handler untuk banyak file sekaligus
  const handleMultiUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum || uploadFiles.length === 0) return;

    try {
      setUploading(true);
      
      const initialStatuses: Record<string, UploadStatus> = {};
      uploadFiles.forEach(f => {
        initialStatuses[f.name] = {
          fileName: f.name,
          progress: 0,
          status: 'uploading'
        };
      });
      setUploadStatuses(initialStatuses);

      const uploadPromises = uploadFiles.map(file => uploadSingleFile(file));
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((r): r is { key: string; name: string; size: number } => r !== null);
      
      if (successfulUploads.length > 0) {
        const newFileKeys = new Set(successfulUploads.map(f => f.key));
        const remainingExisting = selectedAlbum.files.filter(f => !newFileKeys.has(f.key));
        const finalFiles = [...remainingExisting, ...successfulUploads];
        
        setAlbums(prevAlbums => prevAlbums.map(a => 
          a.albumSlug === selectedAlbum.albumSlug ? { ...a, files: finalFiles } : a
        ));
        
        setSelectedAlbum(prevSelected => prevSelected ? {
          ...prevSelected,
          files: finalFiles
        } : null);

        setAlbumMsg(`Berhasil mengunggah ${successfulUploads.length} berkas!`);
        setTimeout(() => setAlbumMsg(''), 5000);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setAlbumMsg('Kesalahan mengunggah file.');
    } finally {
      setUploading(false);
      fetchData();
    }
  };

  const handleClearQueue = () => {
    setUploadFiles([]);
    setUploadStatuses({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Delete file dari R2
  const handleDeleteFileFromAlbum = async (fileKey: string) => {
    if (!selectedAlbum || !confirm('Apakah Anda yakin ingin menghapus file ini dari R2?')) return;

    try {
      const res = await fetch('/api/admin/albums/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: fileKey })
      });

      if (res.ok) {
        const newFiles = selectedAlbum.files.filter(f => f.key !== fileKey);
        setAlbums(albums.map(a => 
          a.albumSlug === selectedAlbum.albumSlug ? { ...a, files: newFiles } : a
        ));
        setSelectedAlbum({
          ...selectedAlbum,
          files: newFiles
        });
        setAlbumMsg('File berhasil dihapus dari R2!');
        setTimeout(() => setAlbumMsg(''), 3000);
      } else {
        setAlbumMsg('Gagal menghapus file.');
      }
    } catch (err) {
      setAlbumMsg('Gagal koneksi ke server.');
    }
  };

  // Buat Album Baru
  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumSlug || !newAlbumTitle) return;

    try {
      setCreatingAlbum(true);
      const res = await fetch('/api/admin/albums/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: newAlbumSlug, title: newAlbumTitle })
      });

      if (res.ok) {
        setCreateAlbumMsg('Album berhasil dibuat!');
        setNewAlbumSlug('');
        setNewAlbumTitle('');
        setShowCreateAlbum(false);
        fetchData(); // Reload list
        setTimeout(() => setCreateAlbumMsg(''), 3000);
      } else {
        const err = await res.json();
        setCreateAlbumMsg(err.error || 'Gagal membuat album.');
      }
    } catch (err) {
      setCreateAlbumMsg('Terjadi kesalahan jaringan.');
    } finally {
      setCreatingAlbum(false);
    }
  };

  // Submit Software Tool (Create / Update)
  const handleSaveSoftware = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!softwareForm.name || !softwareForm.slug) return;

    try {
      const isEdit = editingSoftwareId !== null;
      let res;
      
      if (isEdit) {
        // Update (PUT JSON)
        res = await fetch(`/api/admin/software/${editingSoftwareId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(softwareForm)
        });
      } else {
        // Create (POST FormData jika tipe custom_r2 untuk mengunggah file SVG)
        if (softwareForm.iconType === 'custom_r2' && softwareSvgFile) {
          const formData = new FormData();
          formData.append('name', softwareForm.name);
          formData.append('slug', softwareForm.slug);
          formData.append('iconType', 'custom_r2');
          formData.append('color', softwareForm.color || '');
          formData.append('file', softwareSvgFile);

          res = await fetch('/api/admin/software', {
            method: 'POST',
            body: formData
          });
        } else {
          // Standard JSON Post
          res = await fetch('/api/admin/software', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              name: softwareForm.name,
              slug: softwareForm.slug,
              iconType: softwareForm.iconType,
              iconValue: softwareForm.iconValue,
              color: softwareForm.color || ''
            })
          });
        }
      }

      if (res.ok) {
        setSoftwareMsg(isEdit ? 'Software berhasil diperbarui!' : 'Software berhasil ditambahkan!');
        setSoftwareForm({ name: '', slug: '', iconType: 'iconify', iconValue: '', color: '#ffffff' });
        setEditingSoftwareId(null);
        setSoftwareSvgFile(null);
        fetchData(); // Reload list
        setTimeout(() => setSoftwareMsg(''), 3000);
      } else {
        setSoftwareMsg('Gagal memproses request.');
      }
    } catch (err) {
      setSoftwareMsg('Gagal koneksi.');
    }
  };

  // Edit software mode
  const handleEditSoftware = (tool: SoftwareTool) => {
    setSoftwareForm(tool);
    setEditingSoftwareId(tool.id || null);
    setSoftwareMsg('');
  };

  // Delete Software Tool
  const handleDeleteSoftware = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus software ini?')) return;

    try {
      const res = await fetch(`/api/admin/software/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSoftwareMsg('Software berhasil dihapus!');
        fetchData();
        setTimeout(() => setSoftwareMsg(''), 3000);
      } else {
        setSoftwareMsg('Gagal menghapus software.');
      }
    } catch (err) {
      setSoftwareMsg('Gagal koneksi.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 border border-dashed rounded-xl">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Memuat data galeri & Cloudflare R2/D1...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
      
      {/* 1. SEKTOR KIRI (col-span 3): DAFTAR ALBUM R2 BUCKET */}
      <div className="lg:col-span-3 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <Folder className="h-5 w-5 text-yellow-500" />
                <span>Daftar Album R2 Bucket</span>
              </CardTitle>
              <button 
                onClick={() => setShowCreateAlbum(!showCreateAlbum)}
                className="h-8 rounded bg-primary text-primary-foreground px-3 text-xs font-semibold hover:bg-primary/95 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Album
              </button>
            </div>
            <CardDescription>
              Folder album dideteksi dari `assets/3Dgallery/` di R2 bucket `{bucketName}`.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {showCreateAlbum && (
              <form onSubmit={handleCreateAlbum} className="p-4 border rounded-lg bg-muted/20 space-y-3 mb-4">
                <h4 className="text-xs font-bold text-foreground">Buat Album Baru</h4>
                <div className="grid grid-cols-1 gap-3">
                  <div className="grid gap-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Folder Slug (Contoh: helmet)</label>
                    <input 
                      type="text" 
                      value={newAlbumSlug}
                      onChange={(e) => setNewAlbumSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="h-8 w-full rounded border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="slug-album"
                      required
                    />
                  </div>
                  <div className="grid gap-1">
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase">Judul Album</label>
                    <input 
                      type="text" 
                      value={newAlbumTitle}
                      onChange={(e) => setNewAlbumTitle(e.target.value)}
                      className="h-8 w-full rounded border border-input bg-background px-3 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="Judul Album Cantik"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button 
                    type="button" 
                    onClick={() => setShowCreateAlbum(false)}
                    className="h-8 px-3 rounded border border-border text-xs bg-card hover:bg-muted font-medium cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={creatingAlbum}
                    className="h-8 px-3 rounded bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    {creatingAlbum ? 'Membuat...' : 'Buat Album'}
                  </button>
                </div>
              </form>
            )}
            {createAlbumMsg && (
              <div className="p-2.5 text-xs bg-primary/10 border border-primary/20 rounded-lg text-primary font-medium mb-4">
                {createAlbumMsg}
              </div>
            )}
            {albums.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Tidak ada folder album di R2.</p>
            ) : (
              albums.map((album) => (
                <div 
                  key={album.albumSlug}
                  className={`flex items-center justify-between p-3.5 rounded-lg border transition-all cursor-pointer ${
                    selectedAlbum?.albumSlug === album.albumSlug 
                      ? 'bg-primary/5 border-primary/50 ring-2 ring-primary/20 shadow-sm' 
                      : 'bg-card border-border hover:bg-muted/30'
                  }`}
                  onClick={() => handleSelectAlbum(album)}
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                      <span>{album.title}</span>
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-mono text-muted-foreground font-normal">
                        {album.albumSlug}
                      </span>
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <FileCode className="h-3 w-3" />
                        {album.files.filter(f => f.name.endsWith('.glb')).length} 3D Model
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {album.files.filter(f => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(f.name)).length} Render
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 flex-wrap max-w-[120px]">
                    {album.softwareList.map(sw => {
                      const tool = softwareTools.find(t => t.slug === sw);
                      return tool ? (
                        <span 
                          key={sw}
                          className="text-[9px] px-1.5 py-0.5 rounded-full border border-border/50 text-foreground font-semibold flex items-center gap-1"
                          style={{ borderColor: tool.color ? `${tool.color}30` : undefined }}
                        >
                          {tool.iconType === 'iconify' && <Icon icon={tool.iconValue} style={{ color: tool.color }} className="h-2.5 w-2.5 shrink-0" />}
                          <span className="truncate max-w-[40px]">{tool.name}</span>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 2. SEKTOR KANAN (col-span 4): DETAIL & TABS KELOLA */}
      <div className="lg:col-span-4 space-y-6">
        {selectedAlbum ? (
          <Card className="border-primary/20 ring-1 ring-primary/10">
            <CardHeader className="pb-3 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    Album: {selectedAlbum.title}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs">
                    Folder R2: assets/3Dgallery/{selectedAlbum.albumSlug}/
                  </CardDescription>
                </div>
                <button 
                  onClick={() => setSelectedAlbum(null)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <Tabs defaultValue="detail" className="space-y-5">
                <TabsList className="w-full justify-start border-b rounded-none h-9 bg-transparent p-0">
                  <TabsTrigger value="detail" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 cursor-pointer">
                    Detail & File
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 cursor-pointer">
                    Pratinjau Gambar
                  </TabsTrigger>
                  <TabsTrigger value="software" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 cursor-pointer">
                    Master Software
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: DETAIL & FILE */}
                <TabsContent value="detail" className="space-y-6 pt-1">
                  {albumMsg && (
                    <div className="p-3 text-xs bg-primary/10 border border-primary/20 rounded-lg text-primary font-medium flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      <span>{albumMsg}</span>
                    </div>
                  )}

                  {/* Form Metadata Album */}
                  <form onSubmit={handleSaveAlbumMetadata} className="space-y-4 pb-6 border-b">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Metadata Album (D1 Database)</h4>
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-foreground">Judul Kustom Album</label>
                      <input 
                        type="text" 
                        value={albumTitle}
                        onChange={(e) => setAlbumTitle(e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        required
                        placeholder="Masukkan judul album yang cantik"
                      />
                    </div>

                    {/* Popover/Dropdown Pemilihan Software dengan Checkbox */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-foreground block">Software 3D Yang Digunakan</label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowSwDropdown(!showSwDropdown)}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-left shadow-sm flex items-center justify-between cursor-pointer focus:outline-none"
                        >
                          <span className="truncate">
                            {albumSoftware.length === 0 
                              ? "Pilih software 3D..." 
                              : `${albumSoftware.length} software terpilih`
                            }
                          </span>
                          <span className="text-muted-foreground text-xs">▼</span>
                        </button>
                        
                        {showSwDropdown && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowSwDropdown(false)} />
                            <div className="absolute left-0 right-0 mt-1.5 z-50 rounded-md border bg-popover text-popover-foreground shadow-md max-h-60 overflow-y-auto p-1.5 space-y-1">
                              {softwareTools.length === 0 ? (
                                <p className="text-xs text-muted-foreground p-3 text-center">Belum ada software tools terdaftar.</p>
                              ) : (
                                softwareTools.map((tool) => {
                                  const isChecked = albumSoftware.includes(tool.slug);
                                  return (
                                    <div
                                      key={tool.slug}
                                      onClick={() => handleToggleSoftwareForAlbum(tool.slug)}
                                      className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-semibold rounded hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                                    >
                                      <input 
                                        type="checkbox" 
                                        checked={isChecked}
                                        onChange={() => {}} // handled by parent div
                                        className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                                      />
                                      {tool.iconType === 'iconify' ? (
                                        <Icon icon={tool.iconValue} style={{ color: tool.color }} className="h-3.5 w-3.5 shrink-0" />
                                      ) : (
                                        <div 
                                          className="h-3.5 w-3.5 shrink-0"
                                          style={{
                                            backgroundColor: tool.color || 'currentColor',
                                            WebkitMaskImage: `url(/api/assets/${tool.iconValue})`,
                                            maskImage: `url(/api/assets/${tool.iconValue})`,
                                            WebkitMaskSize: 'contain',
                                            maskSize: 'contain',
                                            WebkitMaskRepeat: 'no-repeat',
                                          }}
                                        />
                                      )}
                                      <span className="truncate">{tool.name}</span>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="h-9 rounded-md bg-primary text-primary-foreground px-4 text-xs font-semibold shadow hover:bg-primary/90 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Save className="h-3.5 w-3.5" />
                      Simpan Metadata
                    </button>
                  </form>

                  {/* Kelola Berkas R2 */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kelola Berkas Album (Cloudflare R2)</h4>
                    
                    {/* Daftar File R2 di Album ini */}
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {selectedAlbum.files.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">Belum ada file di album ini.</p>
                      ) : (
                        selectedAlbum.files.map((file) => {
                          const isRenaming = renamingKey === file.key;
                          return isRenaming ? (
                            <div key={file.key} className="flex items-center gap-2 p-2 rounded bg-muted/60 border text-xs">
                              <input 
                                type="text" 
                                value={renamingName}
                                onChange={(e) => setRenamingName(e.target.value)}
                                className="h-7 flex-1 rounded border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => handleRenameFile(file.key)}
                                disabled={renamingLoading}
                                className="text-emerald-500 hover:text-emerald-700 p-1 cursor-pointer shrink-0 disabled:opacity-50"
                                title="Simpan"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setRenamingKey(null)}
                                className="text-muted-foreground hover:text-foreground p-1 cursor-pointer shrink-0"
                                title="Batal"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div key={file.key} className="flex items-center justify-between p-2 rounded bg-muted/40 border text-xs">
                              <span className="font-mono truncate max-w-[200px]" title={file.name}>
                                {file.name}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-muted-foreground font-mono">
                                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRenamingKey(file.key);
                                    setRenamingName(file.name);
                                  }}
                                  className="text-primary hover:text-primary/80 hover:bg-primary/10 p-1 rounded transition-colors"
                                  title="Ganti nama file"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFileFromAlbum(file.key)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-500/10 p-1 rounded transition-colors"
                                  title="Hapus file dari R2"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Form Upload Banyak File */}
                    <form onSubmit={handleMultiUpload} className="p-4 border border-dashed rounded-lg bg-card space-y-4">
                      <label className="text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer">
                        <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Pilih Berkas Upload (Mendukung Multi-select)</span>
                      </label>
                      <input 
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={(e) => {
                          const filesArray = Array.from(e.target.files || []);
                          setUploadFiles(filesArray);
                          setUploadStatuses({}); // reset status unggahan
                        }}
                        className="text-xs w-full cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-muted file:text-foreground hover:file:bg-muted/80"
                      />

                      {/* List Antrean Unggah */}
                      {uploadFiles.length > 0 && (
                        <div className="space-y-2 border-t pt-3">
                          <h5 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Antrean Unggah ({uploadFiles.length} berkas)</h5>
                          <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                            {uploadFiles.map((file) => {
                              const status = uploadStatuses[file.name];
                              return (
                                <div key={file.name} className="p-2 rounded bg-muted/20 border text-[11px] space-y-1">
                                  <div className="flex justify-between items-center gap-2">
                                    <span className="font-medium truncate max-w-[200px]" title={file.name}>
                                      {file.name}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground shrink-0 font-mono">
                                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                                    </span>
                                  </div>
                                  
                                  {/* Status Progres Per Berkas */}
                                  {status && (
                                    <div className="space-y-1 pt-0.5">
                                      <div className="flex justify-between items-center text-[9px] font-semibold">
                                        {status.status === 'uploading' && (
                                          <span className="text-primary flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                                            Sedang mengunggah... {status.progress}%
                                          </span>
                                        )}
                                        {status.status === 'completed' && (
                                          <span className="text-emerald-500 flex items-center gap-0.5">
                                            <Check className="h-3 w-3" />
                                            Selesai 100%
                                          </span>
                                        )}
                                        {status.status === 'failed' && (
                                          <span className="text-red-500 truncate max-w-[180px]" title={status.error}>
                                            Gagal: {status.error || 'Terjadi kesalahan'}
                                          </span>
                                        )}
                                      </div>
                                      {/* Progress Bar */}
                                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full transition-all duration-300 ${
                                            status.status === 'completed' 
                                              ? 'bg-emerald-500' 
                                              : status.status === 'failed' 
                                              ? 'bg-red-500' 
                                              : 'bg-primary'
                                          }`}
                                          style={{ width: `${status.progress}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {uploadFiles.length > 0 && uploadFiles.every(f => uploadStatuses[f.name]?.status === 'completed' || uploadStatuses[f.name]?.status === 'failed') ? (
                        <button
                          type="button"
                          onClick={handleClearQueue}
                          className="h-8 w-full rounded border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Bersihkan Antrean ({uploadFiles.length} Berkas)</span>
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={uploadFiles.length === 0 || uploading}
                          className="h-8 w-full rounded bg-primary text-primary-foreground text-xs font-semibold shadow hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {uploading ? (
                            <>
                              <div className="h-3 w-3 animate-spin rounded-full border border-t-transparent border-primary-foreground"></div>
                              <span>Mengunggah Antrean...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-3.5 w-3.5" />
                              <span>Mulai Unggah {uploadFiles.length > 0 ? `${uploadFiles.length} Berkas` : "Berkas"}</span>
                            </>
                          )}
                        </button>
                      )}
                    </form>
                  </div>
                </TabsContent>

                {/* TAB 2: PRATINJAU GAMBAR */}
                <TabsContent value="preview" className="space-y-4 pt-1">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedAlbum.files.filter(f => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(f.name)).length === 0 ? (
                      <div className="col-span-full py-8 text-center text-xs text-muted-foreground">
                        Tidak ada render gambar di album ini.
                      </div>
                    ) : (
                      selectedAlbum.files
                        .filter(f => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(f.name))
                        .map((file) => (
                          <div key={file.key} className="relative group aspect-square rounded-lg border overflow-hidden bg-muted/30">
                            <img 
                              src={`/api/assets/${file.key}`} 
                              alt={file.name} 
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-2 transition-opacity duration-200">
                              <span className="text-[10px] text-white font-semibold truncate leading-tight mb-1" title={file.name}>
                                {file.name}
                              </span>
                              <span className="text-[9px] text-muted-foreground font-mono">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </TabsContent>

                {/* TAB 3: MASTER SOFTWARE (BUNGKUS KELOLA SOFTWARE DI TAB) */}
                <TabsContent value="software" className="space-y-6 pt-1">
                  {renderSoftwareManagerSection()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          /* Render Master Software Tools Manager By Default */
          renderSoftwareManagerSection()
        )}
      </div>

    </div>
  )

  // Sub-render helper untuk manajemen software tools agar kodenya modular
  function renderSoftwareManagerSection() {
    return (
      <div className="space-y-6">
        {/* Form Tambah/Edit Software */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">
              {editingSoftwareId ? 'Edit Software Tool' : 'Tambah Software Tool'}
            </CardTitle>
            <CardDescription>
              Tambahkan detail program untuk ditampilkan di bawah judul album.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSoftware} className="space-y-4">
              {softwareMsg && (
                <div className="p-3 text-xs bg-primary/10 border border-primary/20 rounded-lg text-primary font-medium flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>{softwareMsg}</span>
                </div>
              )}

              <div className="grid gap-1">
                <label className="text-xs font-semibold">Nama Software</label>
                <input 
                  type="text" 
                  value={softwareForm.name}
                  onChange={(e) => setSoftwareForm({ ...softwareForm, name: e.target.value })}
                  className="h-9 w-full rounded border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Contoh: Blender"
                  required
                />
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-semibold">Slug (Unique ID)</label>
                <input 
                  type="text" 
                  value={softwareForm.slug}
                  onChange={(e) => setSoftwareForm({ ...softwareForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  className="h-9 w-full rounded border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Contoh: blender"
                  required
                  disabled={editingSoftwareId !== null}
                />
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-semibold">Warna Brand Icon (Color Picker)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="color" 
                    value={softwareForm.color || '#ffffff'}
                    onChange={(e) => setSoftwareForm({ ...softwareForm, color: e.target.value })}
                    className="h-9 w-12 rounded border cursor-pointer bg-background"
                  />
                  <input 
                    type="text"
                    value={softwareForm.color || '#ffffff'}
                    onChange={(e) => setSoftwareForm({ ...softwareForm, color: e.target.value })}
                    className="h-9 w-full rounded border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="#ffffff"
                    maxLength={7}
                  />
                </div>
              </div>

              <div className="grid gap-1">
                <label className="text-xs font-semibold">Jenis Ikon</label>
                <select
                  value={softwareForm.iconType}
                  onChange={(e) => setSoftwareForm({ ...softwareForm, iconType: e.target.value as any, iconValue: '' })}
                  className="h-9 w-full rounded border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="iconify">Iconify (Simple Icons / Logos)</option>
                  <option value="custom_r2">Upload SVG Kustom ke R2</option>
                </select>
              </div>

              {softwareForm.iconType === 'iconify' ? (
                <div className="grid gap-1">
                  <label className="text-xs font-semibold">Iconify Icon Key</label>
                  <input 
                    type="text" 
                    value={softwareForm.iconValue}
                    onChange={(e) => setSoftwareForm({ ...softwareForm, iconValue: e.target.value })}
                    className="h-9 w-full rounded border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Contoh: simple-icons:blender"
                    required={softwareForm.iconType === 'iconify'}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Temukan ribuan key icon di website iconify.design (misal simple-icons:autodeskmaya)
                  </span>
                </div>
              ) : (
                <div className="grid gap-1">
                  <label className="text-xs font-semibold">Upload File SVG Ikon</label>
                  <input 
                    type="file" 
                    accept=".svg"
                    onChange={(e) => setSoftwareSvgFile(e.target.files?.[0] || null)}
                    className="text-xs w-full file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-muted"
                    required={editingSoftwareId === null && softwareForm.iconType === 'custom_r2'}
                  />
                  {editingSoftwareId !== null && (
                    <span className="text-[10px] text-yellow-600">
                      Kosongkan jika tidak ingin mengganti file SVG kustom yang lama di R2.
                    </span>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="h-9 flex-1 rounded bg-primary text-primary-foreground text-xs font-semibold shadow hover:bg-primary/95 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{editingSoftwareId ? 'Perbarui Software' : 'Simpan Software'}</span>
                </button>
                {editingSoftwareId !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSoftwareId(null);
                      setSoftwareForm({ name: '', slug: '', iconType: 'iconify', iconValue: '', color: '#ffffff' });
                    }}
                    className="h-9 px-3 rounded border border-border bg-card text-foreground text-xs font-semibold hover:bg-muted cursor-pointer"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Daftar Software Terdaftar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground">
              Software Terdaftar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {softwareTools.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Belum ada software yang terdaftar di D1.</p>
            ) : (
              softwareTools.map((tool) => (
                <div key={tool.id} className="flex items-center justify-between p-2 rounded bg-muted/30 border text-xs">
                  <div className="flex items-center gap-2">
                    {tool.iconType === 'iconify' ? (
                      <Icon icon={tool.iconValue} className="h-4 w-4" style={{ color: tool.color }} />
                    ) : (
                      <div 
                        className="h-4 w-4"
                        style={{
                          backgroundColor: tool.color || 'currentColor',
                          WebkitMaskImage: `url(/api/assets/${tool.iconValue})`,
                          maskImage: `url(/api/assets/${tool.iconValue})`,
                          WebkitMaskSize: 'contain',
                          maskSize: 'contain',
                          WebkitMaskRepeat: 'no-repeat',
                        }}
                      />
                    )}
                    <span className="font-semibold">{tool.name}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">({tool.slug})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditSoftware(tool)}
                      className="text-primary hover:text-primary/80 hover:bg-primary/10 p-1 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSoftware(tool.id!)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-500/10 p-1 rounded transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
}

