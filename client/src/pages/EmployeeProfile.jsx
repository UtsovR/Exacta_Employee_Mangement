import { useRef, useState, useEffect } from 'react';
import { User, Calendar, CreditCard, Mail, MapPin, Hash, Camera, Upload } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import Toast from '@/components/ui/Toast';

const ProfileField = ({ icon: Icon, label, value }) => (
    <div className="flex items-center rounded-xl border border-gray-100 bg-gray-50 p-4 transition-colors hover:bg-white hover:shadow-md">
        <div className="mr-4 rounded-lg border border-gray-100 bg-white p-3 text-brand-blue-DEFAULT shadow-sm">
            <Icon size={20} />
        </div>
        <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
            <p className="font-semibold text-brand-dark">{value || 'N/A'}</p>
        </div>
    </div>
);

const EmployeeProfile = () => {
    const { user, refreshUser } = useAuth();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const handlePhotoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setToast({ message: 'File is too large (max 2MB)', type: 'error' });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            setUploading(true);
            try {
                const { error } = await supabase.auth.updateUser({
                    data: { profilePhoto: reader.result },
                });

                if (error) {
                    throw error;
                }

                await refreshUser();
                setToast({ message: 'Profile photo updated!', type: 'success' });
            } catch (error) {
                console.error(error);
                setToast({ message: 'Failed to upload photo', type: 'error' });
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    const joinDate = user?.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A';
    const dob = user?.dob ? new Date(user.dob).toLocaleDateString() : 'N/A';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center gap-6 border-b border-gray-200 pb-8 md:flex-row">
                <div className="relative cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                    <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-brand-blue-highlight text-brand-blue-dark shadow-xl shadow-blue-100">
                        {user?.profilePhoto ? (
                            <img src={user.profilePhoto} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-5xl font-bold">{user?.name?.charAt(0).toUpperCase() || '?'}</span>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                            <Camera className="text-white" size={32} />
                        </div>
                    </div>

                    <div className="absolute bottom-1 right-1 rounded-full border-2 border-white bg-brand-blue-DEFAULT p-2 text-white shadow-md transition-transform group-hover:scale-110">
                        {uploading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <Upload size={14} />
                        )}
                    </div>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg"
                        onChange={handlePhotoUpload}
                    />
                </div>

                <div className="space-y-2 text-center md:text-left">
                    <h1 className="text-4xl font-bold text-brand-dark">{user?.name}</h1>
                    <div className="flex items-center justify-center gap-2 text-lg font-medium text-brand-gray-text md:justify-start">
                        <span className="rounded-full bg-brand-blue-light/20 px-3 py-1 text-sm text-brand-blue-dark">
                            {user?.role}
                        </span>
                        <span>•</span>
                        <span>{user?.team || 'Unassigned'}</span>
                    </div>
                    <p className="text-sm text-gray-400">Tap the photo to update your avatar</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-brand-dark">
                        <User size={20} className="text-brand-blue-DEFAULT" />
                        Personal Information
                    </h3>
                    <div className="space-y-4">
                        <ProfileField icon={Hash} label="Employee ID" value={user?.empId} />
                        <ProfileField icon={Mail} label="Email" value={user?.email || 'Not provided'} />
                        <ProfileField icon={Calendar} label="Date of Birth" value={dob} />
                        <ProfileField icon={CreditCard} label="Blood Group" value={user?.bloodGroup} />
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                    <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-brand-dark">
                        <BriefcaseIcon size={20} className="text-brand-blue-DEFAULT" />
                        Work Information
                    </h3>
                    <div className="space-y-4">
                        <ProfileField icon={Calendar} label="Joining Date" value={joinDate} />
                        <ProfileField icon={MapPin} label="Office Location" value="Exacta HQ, Kolkata" />
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-center rounded-xl border border-blue-100 bg-blue-50 p-6 text-center">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-brand-blue-DEFAULT">
                    <User size={20} />
                </div>
                <p className="mb-1 font-medium text-brand-blue-dark">Managed Profile</p>
                <p className="max-w-md text-sm text-brand-blue-dark/70">
                    Most details are managed by your administrator. For updates to name, email, or DOB, contact HR.
                </p>
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

const BriefcaseIcon = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
);

export default EmployeeProfile;
