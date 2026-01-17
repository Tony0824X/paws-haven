import React, { useState, useEffect } from 'react';
import { Screen, Pet, Application, User } from '../types';
import { getAdminStats, AdminStats, getCurrentUser } from '../services/userService';
import { getAllPetsAdmin, createPet, updatePet, deletePet } from '../services/petService';
import { getAllApplicationsAdmin, updateApplicationStatus, deleteApplication, getApplicationById } from '../services/applicationService';

interface AdminDashboardProps {
    onNavigate: (screen: Screen) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'stats' | 'pets' | 'applications'>('stats');
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [pets, setPets] = useState<Pet[]>([]);
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [adminUser, setAdminUser] = useState<User | null>(null);

    // Modal states
    const [showPetModal, setShowPetModal] = useState(false);
    const [editingPet, setEditingPet] = useState<Partial<Pet> | null>(null);
    const [showAppModal, setShowAppModal] = useState(false);
    const [viewingApp, setViewingApp] = useState<any | null>(null);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        const [u, s, p, a] = await Promise.all([
            getCurrentUser(),
            getAdminStats(),
            getAllPetsAdmin(),
            getAllApplicationsAdmin()
        ]);
        setAdminUser(u);
        setStats(s);
        setPets(p);
        setApplications(a);
        setLoading(false);
    };

    const handleUpdateAppStatus = async (id: string, status: '已通過' | '未通過') => {
        const success = await updateApplicationStatus(id, status);
        if (success) {
            // Reload data
            const [s, a] = await Promise.all([getAdminStats(), getAllApplicationsAdmin()]);
            setStats(s);
            setApplications(a);
            setShowAppModal(false);
        }
    };

    const handleSavePet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPet) return;

        let success = false;
        if (editingPet.id) {
            const res = await updatePet(editingPet.id, editingPet);
            success = res.success;
        } else {
            const res = await createPet(editingPet as Omit<Pet, 'id'>);
            success = res.success;
        }

        if (success) {
            const [s, p] = await Promise.all([getAdminStats(), getAllPetsAdmin()]);
            setStats(s);
            setPets(p);
            setShowPetModal(false);
        }
    };

    const handleDeletePet = async (id: string) => {
        if (window.confirm('確定要刪除這位毛孩嗎？此操作不可恢復。')) {
            const success = await deletePet(id);
            if (success) {
                const [s, p] = await Promise.all([getAdminStats(), getAllPetsAdmin()]);
                setStats(s);
                setPets(p);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white dark:bg-zinc-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!adminUser || adminUser.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
                <span className="material-symbols-outlined text-6xl text-red-500 mb-4">gpp_maybe</span>
                <h1 className="text-2xl font-bold mb-2">權限不足</h1>
                <p className="text-gray-500 mb-6">您沒有存取管理頁面的權限。</p>
                <button
                    onClick={() => onNavigate(Screen.HOME)}
                    className="bg-primary text-white px-6 py-2 rounded-xl font-bold"
                >
                    返回首頁
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 pb-20">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 sticky top-0 z-40 border-b border-gray-100 dark:border-zinc-800">
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => onNavigate(Screen.PROFILE)} className="material-symbols-outlined text-gray-500">account_circle</button>
                        <h1 className="text-xl font-bold">管理控制台</h1>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-4 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`flex-1 py-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'stats' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
                    >
                        總覽
                    </button>
                    <button
                        onClick={() => setActiveTab('pets')}
                        className={`flex-1 py-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'pets' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
                    >
                        毛孩管理
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`flex-1 py-3 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'applications' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}
                    >
                        申請審核 {stats?.pendingApplications ? `(${stats.pendingApplications})` : ''}
                    </button>
                </div>
            </header>

            <main className="p-4 max-w-4xl mx-auto">
                {activeTab === 'stats' && stats && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard title="毛孩總數" value={stats.totalPets} icon="pets" color="bg-blue-500" />
                            <StatCard title="收到的申請" value={stats.totalApplications} icon="description" color="bg-purple-500" />
                            <StatCard title="審核中" value={stats.pendingApplications} icon="pending" color="bg-orange-500" />
                            <StatCard title="成功領養" value={stats.adoptedPets} icon="favorite" color="bg-red-500" />
                            <StatCard title="註冊用戶" value={stats.totalUsers} icon="group" color="bg-green-500" />
                        </div>

                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-lg mb-4">快速行動</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => { setEditingPet({ status: 'available', images: [], description: [] }); setShowPetModal(true); }}
                                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-800 hover:border-primary transition-colors gap-2"
                                >
                                    <span className="material-symbols-outlined text-primary text-3xl">add_circle</span>
                                    <span className="text-sm font-medium">新增毛孩</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('applications')}
                                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-800 hover:border-primary transition-colors gap-2"
                                >
                                    <span className="material-symbols-outlined text-orange-500 text-3xl">fact_check</span>
                                    <span className="text-sm font-medium">查看申請表</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pets' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-lg">毛孩清單 ({pets.length})</h2>
                            <button
                                onClick={() => { setEditingPet({ status: 'available', images: [], description: [] }); setShowPetModal(true); }}
                                className="bg-primary text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-1 shadow-md shadow-primary/20"
                            >
                                <span className="material-symbols-outlined text-sm">add</span> 新增毛孩
                            </button>
                        </div>

                        <div className="space-y-3">
                            {pets.map(pet => (
                                <div key={pet.id} className="bg-white dark:bg-zinc-900 p-3 rounded-2xl shadow-sm flex gap-4 items-center border border-gray-100 dark:border-zinc-800">
                                    <div
                                        className="w-20 h-20 rounded-xl bg-cover bg-center shrink-0"
                                        style={{ backgroundImage: `url("${pet.images[0] || 'https://via.placeholder.com/150'}")` }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold truncate">{pet.name}</h4>
                                            <StatusBadge status={pet.status || 'available'} />
                                        </div>
                                        <p className="text-xs text-gray-500">{pet.breed} • {pet.age}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setEditingPet(pet); setShowPetModal(true); }}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-full dark:bg-blue-900/20"
                                        >
                                            <span className="material-symbols-outlined text-xl">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeletePet(pet.id)}
                                            className="p-2 bg-red-50 text-red-600 rounded-full dark:bg-red-900/20"
                                        >
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <h2 className="font-bold text-lg">領養申請 ({applications.length})</h2>
                        <div className="space-y-3">
                            {applications.map(app => (
                                <div
                                    key={app.id}
                                    onClick={async () => {
                                        const details = await getApplicationById(app.id);
                                        setViewingApp(details);
                                        setShowAppModal(true);
                                    }}
                                    className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 cursor-pointer hover:border-primary transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold">申請：{app.petName}</h4>
                                        <StatusBadge status={app.status} isApplication />
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span className="material-symbols-outlined text-sm">schedule</span>
                                        <span>{new Date(app.createdAt || '').toLocaleDateString('zh-TW')}</span>
                                    </div>
                                </div>
                            ))}
                            {applications.length === 0 && (
                                <div className="text-center py-20 text-gray-400">
                                    <span className="material-symbols-outlined text-6xl block mb-2">inbox</span>
                                    <p>目前沒有任何申請</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Pet Modal */}
            {showPetModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">{editingPet?.id ? '修改毛孩資訊' : '新增毛孩'}</h2>
                            <button onClick={() => setShowPetModal(false)} className="material-symbols-outlined">close</button>
                        </div>
                        <form onSubmit={handleSavePet} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">毛孩名稱</label>
                                <input
                                    required
                                    className="w-full bg-gray-100 dark:bg-zinc-800 border-none rounded-xl p-3"
                                    value={editingPet?.name || ''}
                                    onChange={e => setEditingPet({ ...editingPet, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">種類</label>
                                    <select
                                        className="w-full bg-gray-100 dark:bg-zinc-800 border-none rounded-xl p-3"
                                        value={editingPet?.type || 'dog'}
                                        onChange={e => setEditingPet({ ...editingPet, type: e.target.value as any })}
                                    >
                                        <option value="dog">狗狗</option>
                                        <option value="cat">貓咪</option>
                                        <option value="rabbit">兔子</option>
                                        <option value="bird">小鳥</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">品種</label>
                                    <input
                                        required
                                        className="w-full bg-gray-100 dark:bg-zinc-800 border-none rounded-xl p-3"
                                        value={editingPet?.breed || ''}
                                        onChange={e => setEditingPet({ ...editingPet, breed: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">性別</label>
                                    <select
                                        className="w-full bg-gray-100 dark:bg-zinc-800 border-none rounded-xl p-3"
                                        value={editingPet?.gender || '公'}
                                        onChange={e => setEditingPet({ ...editingPet, gender: e.target.value as any })}
                                    >
                                        <option value="公">公</option>
                                        <option value="母">母</option>
                                        <option value="未知">未知</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">年齡</label>
                                    <input
                                        required
                                        className="w-full bg-gray-100 dark:bg-zinc-800 border-none rounded-xl p-3"
                                        value={editingPet?.age || ''}
                                        onChange={e => setEditingPet({ ...editingPet, age: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">圖片 URL (多個以逗號分隔)</label>
                                <textarea
                                    className="w-full bg-gray-100 dark:bg-zinc-800 border-none rounded-xl p-3 min-h-[80px]"
                                    value={editingPet?.images?.join(', ') || ''}
                                    onChange={e => setEditingPet({ ...editingPet, images: e.target.value.split(',').map(s => s.trim()) })}
                                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">領養狀態</label>
                                <select
                                    className="w-full bg-gray-100 dark:bg-zinc-800 border-none rounded-xl p-3"
                                    value={editingPet?.status || 'available'}
                                    onChange={e => setEditingPet({ ...editingPet, status: e.target.value as any })}
                                >
                                    <option value="available">待領養</option>
                                    <option value="pending">領養中 (已有人申請)</option>
                                    <option value="adopted">已領養</option>
                                </select>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPetModal(false)}
                                    className="flex-1 py-3 font-bold border border-gray-200 dark:border-zinc-800 rounded-xl"
                                >
                                    取消
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 font-bold bg-primary text-white rounded-xl shadow-lg shadow-primary/20"
                                >
                                    儲存
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Application Details Modal */}
            {showAppModal && viewingApp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">申請詳情</h2>
                            <button onClick={() => setShowAppModal(false)} className="material-symbols-outlined">close</button>
                        </div>

                        <div className="space-y-6">
                            <section>
                                <h3 className="font-bold text-gray-500 text-xs uppercase tracking-wider mb-2">領養對象</h3>
                                <p className="font-bold">{viewingApp.petName} ({viewingApp.petBreed})</p>
                            </section>

                            <section className="bg-gray-50 dark:bg-zinc-800 p-4 rounded-2xl space-y-3">
                                <h3 className="font-bold border-b border-gray-200 dark:border-zinc-700 pb-2">申請人資訊</h3>
                                <div className="grid grid-cols-2 gap-y-3 text-sm">
                                    <div>
                                        <span className="text-gray-500 block">名稱</span>
                                        <span>{viewingApp.formData.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500 block">電話</span>
                                        <span>{viewingApp.formData.phone}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500 block">職業</span>
                                        <span>{viewingApp.formData.job}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="text-gray-500 block">領養理由</span>
                                        <p className="mt-1 bg-white dark:bg-zinc-900 p-2 rounded-lg">{viewingApp.formData.reason}</p>
                                    </div>
                                </div>
                            </section>

                            {viewingApp.status === '審核中' && (
                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => handleUpdateAppStatus(viewingApp.id, '未通過')}
                                        className="flex-1 py-3 font-bold bg-gray-100 dark:bg-zinc-800 text-red-500 rounded-xl"
                                    >
                                        不通過
                                    </button>
                                    <button
                                        onClick={() => handleUpdateAppStatus(viewingApp.id, '已通過')}
                                        className="flex-1 py-3 font-bold bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/20"
                                    >
                                        批准領養
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Sub-components
const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: string, color: string }) => (
    <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
        <div className={`w-10 h-10 rounded-full ${color} text-white flex items-center justify-center mb-3 shadow-lg shadow-black/5`}>
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <p className="text-2xl font-black">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{title}</p>
    </div>
);

const StatusBadge = ({ status, isApplication }: { status: string, isApplication?: boolean }) => {
    let style = "text-[10px] font-bold px-2 py-0.5 rounded-full ";
    let label = status;

    if (isApplication) {
        switch (status) {
            case '審核中': style += "bg-orange-100 text-orange-600"; break;
            case '已通過': style += "bg-green-100 text-green-600"; break;
            case '未通過': style += "bg-red-100 text-red-600"; break;
            default: style += "bg-gray-100 text-gray-600";
        }
    } else {
        switch (status) {
            case 'available': style += "bg-green-100 text-green-600"; label = "待領養"; break;
            case 'pending': style += "bg-orange-100 text-orange-600"; label = "領養中"; break;
            case 'adopted': style += "bg-blue-100 text-blue-600"; label = "已領養"; break;
            default: style += "bg-gray-100 text-gray-600";
        }
    }

    return <span className={style}>{label}</span>;
};

export default AdminDashboard;
