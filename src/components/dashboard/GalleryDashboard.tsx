import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
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

export function GalleryDashboard() {
  // States untuk 3D Gallery
  const [albums, setAlbums] = React.useState<Album[]>([]);
  const [softwareTools, setSoftwareTools] = React.useState<SoftwareTool[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedAlbum, setSelectedAlbum] = React.useState<Album | null>(null);
  
  // States untuk form Software Tool
  const [softwareForm, setSoftwareForm] = React.useState<SoftwareTool>({
    name: '',
    slug: '',
    iconType: 'iconify',
    iconValue: '',
    color: '#3b82f6'
  });
  const [editingSoftwareId, setEditingSoftwareId] = React.useState<number | null>(null);
  const [softwareSvgFile, setSoftwareSvgFile] = React.useState<File | null>(null);
  const [softwareMsg, setSoftwareMsg] = React.useState('');

  // States untuk edit Album Metadata
  const [albumTitle, setAlbumTitle] = React.useState('');
  const [albumSoftware, setAlbumSoftware] = React.useState<string[]>([]);
  const [albumMsg, setAlbumMsg] = React.useState('');
  
  // States untuk upload file ke Album
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/albums');
      if (res.ok) {
        const data = await res.json();
        setAlbums(data.albums || []);
        setSoftwareTools(data.softwareTools || []);
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

  // Upload file ke Album (R2)
  const handleUploadFileToAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum || !uploadFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('albumSlug', selectedAlbum.albumSlug);
      formData.append('file', uploadFile);

      const res = await fetch('/api/admin/albums/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const result = await res.json();
        // Update data album
        const newFiles = [...selectedAlbum.files, {
          key: result.key,
          name: uploadFile.name,
          size: uploadFile.size
        }];
        
        setAlbums(albums.map(a => 
          a.albumSlug === selectedAlbum.albumSlug ? { ...a, files: newFiles } : a
        ));

        setSelectedAlbum({
          ...selectedAlbum,
          files: newFiles
        });

        setUploadFile(null);
        setAlbumMsg('File berhasil diunggah ke R2!');
        setTimeout(() => setAlbumMsg(''), 3000);
      } else {
        setAlbumMsg('Gagal mengunggah file.');
      }
    } catch (err) {
      setAlbumMsg('Kesalahan mengunggah file.');
    } finally {
      setUploading(false);
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
        setSoftwareForm({ name: '', slug: '', iconType: 'iconify', iconValue: '', color: '#3b82f6' });
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
      
      {/* 1. SEKTOR KIRI: DAFTAR ALBUM R2 & EDIT METADATA D1 */}
      <div className="lg:col-span-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-bold">
              <Folder className="h-5 w-5 text-yellow-500" />
              <span>Daftar Album R2 Bucket</span>
            </CardTitle>
            <CardDescription>
              Folder album dideteksi dari `assets/3Dgallery/` di R2 bucket `dev-web-porto-r2`.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
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
                  
                  <div className="flex items-center gap-1.5">
                    {album.softwareList.map(sw => {
                      const tool = softwareTools.find(t => t.slug === sw);
                      return tool ? (
                        <span 
                          key={sw}
                          className="text-[10px] px-2 py-0.5 rounded-full border border-border/50 text-foreground font-semibold flex items-center gap-1"
                          style={{ borderColor: tool.color ? `${tool.color}30` : undefined }}
                        >
                          {tool.iconType === 'iconify' && <Icon icon={tool.iconValue} style={{ color: tool.color }} className="h-3 w-3" />}
                          <span>{tool.name}</span>
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* PANEL KELOLA ALBUM YANG DIPILIH */}
        {selectedAlbum && (
          <Card className="border-primary/20 ring-1 ring-primary/10">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-bold text-foreground">
                    Kelola Album: {selectedAlbum.title}
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
            <CardContent className="space-y-6">
              {albumMsg && (
                <div className="p-3 text-xs bg-primary/10 border border-primary/20 rounded-lg text-primary font-medium flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>{albumMsg}</span>
                </div>
              )}

              {/* Form Metadata */}
              <form onSubmit={handleSaveAlbumMetadata} className="space-y-4 pb-6 border-b border-border">
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

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-foreground block">Software 3D Yang Digunakan</label>
                  <div className="flex flex-wrap gap-2">
                    {softwareTools.map((tool) => {
                      const isChecked = albumSoftware.includes(tool.slug);
                      return (
                        <button
                          type="button"
                          key={tool.slug}
                          onClick={() => handleToggleSoftwareForAlbum(tool.slug)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                            isChecked 
                              ? 'bg-primary/15 border-primary/50 text-foreground ring-2 ring-primary/10' 
                              : 'bg-card border-border hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          {tool.iconType === 'iconify' ? (
                            <Icon icon={tool.iconValue} style={{ color: tool.color }} className="h-3.5 w-3.5" />
                          ) : (
                            <div 
                              className="h-3.5 w-3.5"
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
                          <span>{tool.name}</span>
                        </button>
                      );
                    })}
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

              {/* Manage Files (R2 Upload & Delete) */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kelola File Album (Cloudflare R2)</h4>
                
                {/* Daftar File R2 di Album ini */}
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {selectedAlbum.files.map((file) => (
                    <div key={file.key} className="flex items-center justify-between p-2 rounded bg-muted/40 border text-xs">
                      <span className="font-mono truncate max-w-[250px]" title={file.name}>
                        {file.name}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-muted-foreground font-mono">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </span>
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
                  ))}
                </div>

                {/* Form Upload File Baru ke R2 */}
                <form onSubmit={handleUploadFileToAlbum} className="p-4 border border-dashed rounded-lg bg-card space-y-3">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Upload className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Unggah File Baru ke R2</span>
                  </label>
                  <input 
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="text-xs w-full cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-muted file:text-foreground hover:file:bg-muted/80"
                    required
                  />
                  <button
                    type="submit"
                    disabled={!uploadFile || uploading}
                    className="h-8 w-full rounded bg-primary text-primary-foreground text-xs font-semibold shadow hover:bg-primary/95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {uploading ? (
                      <>
                        <div className="h-3 w-3 animate-spin rounded-full border border-t-transparent border-primary-foreground"></div>
                        <span>Mengunggah ke R2...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-3.5 w-3.5" />
                        <span>Mulai Unggah File</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

            </CardContent>
          </Card>
        )}
      </div>

      {/* 2. SEKTOR KANAN: DAFTAR SOFTWARE TOOLS (D1) & FORM INPUT */}
      <div className="lg:col-span-3 space-y-6">
        
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
                    value={softwareForm.color || '#3b82f6'}
                    onChange={(e) => setSoftwareForm({ ...softwareForm, color: e.target.value })}
                    className="h-9 w-12 rounded border cursor-pointer bg-background"
                  />
                  <input 
                    type="text"
                    value={softwareForm.color || '#3b82f6'}
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
                      setSoftwareForm({ name: '', slug: '', iconType: 'iconify', iconValue: '', color: '#3b82f6' });
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

    </div>
  )
}
