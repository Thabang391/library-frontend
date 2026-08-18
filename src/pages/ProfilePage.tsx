import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Ensure your .env variables are prefixed with VITE__
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 text-white font-sans antialiased py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <Card className="border-0 shadow-2xl shadow-indigo-950/50 bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden">
          
          {/* Header Banner */}
          <div className="h-40 bg-gradient-to-r from-indigo-600/40 to-violet-600/40 w-full relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
          </div>
          
          {/* Profile Avatar Section */}
          <div className="px-8 flex flex-col items-center -mt-20">
            <div 
              className={`relative w-40 h-40 rounded-full p-2 bg-slate-900/90 backdrop-blur-xl transition-all duration-300 ${
                dragActive ? 'ring-4 ring-indigo-400 scale-105' : 'ring-2 ring-white/10'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-slate-800 relative group cursor-pointer">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-20 h-20 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                  </svg>
                )}

                {/* Hover/Drag Overlay */}
                <div 
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center text-center p-2 transition-opacity duration-300 ${
                    dragActive || uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {uploading ? (
                    <div className="w-full px-4">
                      <div className="flex justify-between text-xs text-indigo-300 mb-1 font-medium">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-indigo-400 to-violet-400 h-full rounded-full transition-all duration-300 ease-out" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-200">
                      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"></path>
                      </svg>
                      <span className="text-xs font-semibold">Drop or Click</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            
            <p className="mt-3 text-xs text-slate-400 text-center max-w-xs">
              Drag & drop an image here, or click to select a file. <br/>
              <span className="text-slate-500">JPG, PNG, or GIF up to 5MB.</span>
            </p>
          </div>

          {/* Form Content */}
          <CardContent className="p-8 pt-6">
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-500/10 border-red-400/30 text-red-200 backdrop-blur-sm rounded-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-6 bg-emerald-500/10 border-emerald-400/30 text-emerald-200 backdrop-blur-sm rounded-xl">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300 font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email}
                  disabled
                  className="bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed rounded-xl py-3"
                />
                <p className="text-xs text-slate-500">Your email address cannot be changed.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300 font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-400 focus:border-transparent rounded-xl transition-all py-3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar" className="text-slate-300 font-medium">Avatar URL (Optional)</Label>
                <Input
                  id="avatar"
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-800 focus:ring-2 focus:ring-indigo-400 focus:border-transparent rounded-xl transition-all py-3"
                />
                <p className="text-xs text-slate-500">You can also edit the image URL manually if needed.</p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="bg-transparent border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl py-3 px-6 transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || uploading}
                  className="bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-300 disabled:opacity-50 py-3 px-8"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving Changes...
                    </div>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}