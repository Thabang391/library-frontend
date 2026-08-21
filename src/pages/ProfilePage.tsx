import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserRound, UploadCloud } from 'lucide-react';

// Ensure your .env variables are prefixed with VITE__
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const RR_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=IBM+Plex+Mono:wght@400;500;600&family=Public+Sans:wght@400;500;600;700&display=swap');
  .rr-scope { font-family: 'Public Sans', ui-sans-serif, system-ui, sans-serif; color: #241C10; }
  .rr-display { font-family: 'Fraunces', ui-serif, Georgia, serif; }
  .rr-mono { font-family: 'IBM Plex Mono', ui-monospace, SFMono-Regular, monospace; }
  .rr-scope ::-webkit-scrollbar { height: 10px; width: 10px; }
  .rr-scope ::-webkit-scrollbar-track { background: #EFE6D3; }
  .rr-scope ::-webkit-scrollbar-thumb { background: #B08968; border-radius: 999px; border: 2px solid #EFE6D3; }
  .rr-ruled-input {
    background: transparent; border: none; border-bottom: 1.5px solid #C9BB9C;
    border-radius: 0; padding-left: 2px; color: #241C10;
  }
  .rr-ruled-input::placeholder { color: #A99A7A; }
  .rr-ruled-input:focus { outline: none; box-shadow: none; border-bottom-color: #B08968; border-bottom-width: 2px; }
  .rr-ruled-input:disabled { color: #A99A7A; -webkit-text-fill-color: #A99A7A; opacity: 1; }
  .rr-stamp { transform: rotate(-4deg); border: 2px solid currentColor; border-radius: 3px; box-shadow: 0 0 0 1px currentColor inset; }
`;

const roleInk: Record<string, string> = {
  admin: '#A63D2F',
  librarian: '#1F4738',
  member: '#8A5A22',
};

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const [username, setUsername] = useState<string>('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [user]);

  // XHR Upload logic to track real-time progress
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();

    // Track Progress
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percent);
      }
    };

    // Handle Success
    xhr.onload = () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        if (data.secure_url) {
          setAvatarUrl(data.secure_url);
          setSuccess('Avatar uploaded successfully. Don\'t forget to save!');
        } else {
          setError('Upload failed: ' + (data.error?.message || 'Unknown error'));
        }
      } else {
        setError('Upload failed. Please try again.');
      }
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Handle Error
    xhr.onerror = () => {
      setError('Network error during upload.');
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, true);
    xhr.send(formData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  // Drag & Drop Handlers
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile({ username, avatarUrl });
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="rr-scope min-h-screen bg-[#F6F1E7] flex items-center justify-center">
        <style>{RR_STYLE}</style>
        <div className="w-10 h-10 rounded-full border-[3px] border-[#E4D8BE] border-t-[#1F4738] animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative rr-scope min-h-screen bg-[#F6F1E7] dark:bg-[#0a0a0a] font-[500] antialiased py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div
          className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4yIiAvPjwvc3ZnPg==')] bg-repeat"
        />
      <style>{RR_STYLE}</style>
      <div className="w-full max-w-3xl">
        <div className="bg-[#FFFDF8] border border-[#D9C9A3] shadow-[0_24px_48px_-28px_rgba(31,71,56,0.4)] rounded-md overflow-hidden">

          {/* Plaque banner */}
          <div className="h-32 bg-[#1F4738] w-full relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#D9C08F] to-transparent" />
            <span className="rr-mono absolute top-5 right-6 text-[10px] tracking-[0.2em] uppercase text-[#B9CDC1]">Member Card</span>
          </div>

          {/* Avatar Section */}
          <div className="px-8 flex flex-col items-center -mt-16">
            <div
              className={`relative w-32 h-32 rounded-full p-1.5 bg-[#FFFDF8] transition-all duration-300 ${
                dragActive ? 'ring-4 ring-[#B08968] scale-105' : 'ring-2 ring-[#D9C9A3]'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-[#EFE6D3] relative group cursor-pointer border border-[#D9C9A3]">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <UserRound className="w-14 h-14 text-[#B3A582]" strokeWidth={1.25} />
                )}

                {/* Hover/Drag Overlay */}
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`absolute inset-0 bg-[#1F4738]/85 flex flex-col items-center justify-center text-center p-2 transition-opacity duration-300 ${
                    dragActive || uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {uploading ? (
                    <div className="w-full px-3">
                      <div className="rr-mono flex justify-between text-[9px] text-[#D9C08F] mb-1 uppercase tracking-wide">
                        <span>Uploading…</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-[#F6F1E7]/20 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-[#D9C08F] h-full rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-[#F6F1E7]">
                      <UploadCloud className="w-6 h-6 mb-1.5" strokeWidth={1.5} />
                      <span className="rr-mono text-[9px] font-semibold uppercase tracking-wide">Drop or Click</span>
                    </div>
                  )}
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <p className="rr-mono mt-3 text-[10px] text-[#4A3F2A] text-center max-w-xs uppercase tracking-wide leading-relaxed">
              Drag &amp; drop an image, or click to select
              <br />
              <span className="text-[#4A3F2A]">JPG, PNG, or GIF up to 5MB</span>
            </p>
          </div>

          {/* Form Content */}
          <div className="p-8 pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6 bg-[#F6DED8] border-[#A63D2F]/40 text-[#7A2C21] rounded-sm">
                <AlertDescription className="rr-mono text-xs">{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-6 bg-[#E3EEE5] border-[#1F4738]/30 text-[#1F4738] rounded-sm">
                <AlertDescription className="rr-mono text-xs">{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="rr-mono text-[10px] text-[#4A3F2A] font-semibold tracking-[0.15em] uppercase">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="rr-ruled-input h-10 text-sm cursor-not-allowed"
                />
                <p className="text-xs text-[#4A3F2A]">Your email address cannot be changed.</p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username" className="rr-mono text-[10px] text-[#4A3F2A] font-semibold tracking-[0.15em] uppercase">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  className="rr-ruled-input h-10 text-base"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="avatar" className="rr-mono text-[10px] text-[#4A3F2A] font-semibold tracking-[0.15em] uppercase">Avatar URL (Optional)</Label>
                <Input
                  id="avatar"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="rr-ruled-input h-10 text-sm"
                />
                <p className="text-xs text-[#4A3F2A]">You can also edit the image URL manually if needed.</p>
              </div>

              {/* Role Display */}
              <div className="space-y-1.5">
                <Label className="rr-mono text-[10px] text-[#4A3F2A] font-semibold tracking-[0.15em] uppercase">Role</Label>
                <div className="bg-[#F6F1E7] border border-[#D9C9A3] rounded-sm py-2.5 px-4 flex items-center">
                  <span
                    className="rr-stamp rr-mono inline-block text-[9px] font-bold uppercase tracking-wider px-2.5 py-1"
                    style={{ color: roleInk[user.role] || '#8A5A22' }}
                  >
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-[#4A3F2A]">Your role determines what actions you can perform.</p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rr-mono border-[#D9C9A3] text-[#4A3F2A] hover:bg-[#EFE6D3] rounded-sm text-xs uppercase tracking-wide px-6 py-3 h-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || uploading}
                  className="rr-mono bg-[#1F4738] hover:bg-[#24543F] text-[#F6F1E7] rounded-sm text-xs uppercase tracking-wide px-8 py-3 h-auto disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="w-3.5 h-3.5 mr-2 rounded-full border-2 border-[#F6F1E7]/40 border-t-[#F6F1E7] animate-spin" />
                      Saving Changes…
                    </span>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}