import React, { useState } from 'react';
import { 
  UserProfile, 
  Room, 
  HostelRoom, 
  NewsItem, 
  CafeteriaFacility, 
  PushNotificationAlert, 
  AlertPriority 
} from '../types';
import { 
  Building2, 
  BedDouble, 
  Utensils, 
  Newspaper, 
  BellRing, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Image as ImageIcon, 
  ShieldCheck, 
  Users, 
  DollarSign, 
  Sparkles,
  Save,
  CheckCircle2,
  Clock,
  Pin
} from 'lucide-react';

interface AdminFacilityCustomizerProps {
  currentUser: UserProfile;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  hostelRooms: HostelRoom[];
  setHostelRooms: React.Dispatch<React.SetStateAction<HostelRoom[]>>;
  news: NewsItem[];
  setNews: React.Dispatch<React.SetStateAction<NewsItem[]>>;
  cafeteria: CafeteriaFacility;
  setCafeteria: React.Dispatch<React.SetStateAction<CafeteriaFacility>>;
  alerts: PushNotificationAlert[];
  setAlerts: React.Dispatch<React.SetStateAction<PushNotificationAlert[]>>;
}

export const AdminFacilityCustomizer: React.FC<AdminFacilityCustomizerProps> = ({
  currentUser,
  rooms,
  setRooms,
  hostelRooms,
  setHostelRooms,
  news,
  setNews,
  cafeteria,
  setCafeteria,
  alerts,
  setAlerts,
}) => {
  const [activeTab, setActiveTab] = useState<'news' | 'rooms' | 'hostel' | 'cafeteria' | 'notifications'>('news');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Preset image gallery for easy selection
  const PRESET_IMAGES = [
    { label: 'PDRC Campus Hero', url: '/src/assets/images/pdrc_tsirang_hero_1793686565111.jpg' },
    { label: 'GNH Conference Hall', url: '/src/assets/images/pdrc_conference_hall_1793686564377.jpg' },
    { label: 'Rigsum Seminar Room', url: '/src/assets/images/pdrc_seminar_room_1793686565129.jpg' },
  ];

  // News Form State
  const [isEditingNews, setIsEditingNews] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState<Omit<NewsItem, 'id' | 'date'>>({
    title: '',
    category: 'Announcement',
    content: '',
    imageUrl: PRESET_IMAGES[0].url,
    author: currentUser.name,
    isPinned: false,
    targetAgency: 'ALL',
  });

  // Room Form State
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [roomForm, setRoomForm] = useState<Omit<Room, 'id'>>({
    name: '',
    code: '',
    capacity: 50,
    floor: '1st Floor',
    status: 'Available',
    hourlyRate: 1000,
    equipment: ['Projector', 'WiFi', 'PA System'],
    isAccessible: true,
    image: PRESET_IMAGES[1].url,
    description: '',
  });

  // Hostel Room Form State
  const [isEditingHostel, setIsEditingHostel] = useState(false);
  const [editingHostelId, setEditingHostelId] = useState<string | null>(null);
  const [hostelForm, setHostelForm] = useState<Omit<HostelRoom, 'id'>>({
    roomNumber: '',
    type: 'Single Suite',
    capacity: 1,
    floor: '1st Floor Residential Block',
    nightlyRate: 800,
    status: 'Available',
    amenities: ['Single Bed', 'Attached Bath', 'WiFi', 'Heater'],
    isAccessible: false,
  });

  // Notification Form State
  const [notifForm, setNotifForm] = useState({
    title: '',
    message: '',
    priority: 'Urgent' as AlertPriority,
    targetAgency: 'ALL',
    imageUrl: PRESET_IMAGES[0].url,
  });

  // Cafeteria Form State
  const [cafeteriaForm, setCafeteriaForm] = useState<CafeteriaFacility>(cafeteria);

  const triggerToast = (msg: string) => {
    setSaveFeedback(msg);
    setTimeout(() => setSaveFeedback(null), 3500);
  };

  // Handle Image File Upload (converts file to Data URL for instant picture update)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'news' | 'room' | 'notif' | 'cafeteria') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultUrl = reader.result as string;
        if (target === 'news') setNewsForm(prev => ({ ...prev, imageUrl: resultUrl }));
        if (target === 'room') setRoomForm(prev => ({ ...prev, image: resultUrl }));
        if (target === 'notif') setNotifForm(prev => ({ ...prev, imageUrl: resultUrl }));
        if (target === 'cafeteria') setCafeteriaForm(prev => ({ ...prev, imageUrl: resultUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- NEWS CRUD ---
  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsForm.title.trim()) return;

    if (editingNewsId) {
      setNews(prev => prev.map(n => n.id === editingNewsId ? { ...newsForm, id: editingNewsId, date: new Date().toISOString().substring(0, 10) } : n));
      triggerToast('News update modified successfully!');
    } else {
      const newItem: NewsItem = {
        ...newsForm,
        id: `news-${Date.now()}`,
        date: new Date().toISOString().substring(0, 10),
      };
      setNews(prev => [newItem, ...prev]);
      triggerToast('New announcement with picture posted to Dashboard!');
    }

    setIsEditingNews(false);
    setEditingNewsId(null);
    setNewsForm({
      title: '',
      category: 'Announcement',
      content: '',
      imageUrl: PRESET_IMAGES[0].url,
      author: currentUser.name,
      isPinned: false,
      targetAgency: 'ALL',
    });
  };

  const handleEditNewsClick = (item: NewsItem) => {
    setEditingNewsId(item.id);
    setNewsForm({
      title: item.title,
      category: item.category,
      content: item.content,
      imageUrl: item.imageUrl,
      author: item.author,
      isPinned: item.isPinned,
      targetAgency: item.targetAgency,
    });
    setIsEditingNews(true);
  };

  const handleDeleteNews = (id: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
    triggerToast('Announcement removed.');
  };

  // --- ROOM CRUD ---
  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomForm.name.trim()) return;

    if (editingRoomId) {
      setRooms(prev => prev.map(r => r.id === editingRoomId ? { ...roomForm, id: editingRoomId } : r));
      triggerToast(`Room inventory "${roomForm.name}" updated!`);
    } else {
      const newRoom: Room = {
        ...roomForm,
        id: `room-${Date.now()}`,
      };
      setRooms(prev => [...prev, newRoom]);
      triggerToast(`New venue "${roomForm.name}" added to inventory!`);
    }

    setIsEditingRoom(false);
    setEditingRoomId(null);
  };

  const handleEditRoomClick = (room: Room) => {
    setEditingRoomId(room.id);
    setRoomForm({
      name: room.name,
      code: room.code,
      capacity: room.capacity,
      floor: room.floor,
      status: room.status,
      hourlyRate: room.hourlyRate,
      equipment: room.equipment,
      isAccessible: room.isAccessible,
      image: room.image,
      description: room.description,
    });
    setIsEditingRoom(true);
  };

  const handleDeleteRoom = (id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    triggerToast('Room removed from inventory.');
  };

  // --- HOSTEL ROOM CRUD ---
  const handleSaveHostel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hostelForm.roomNumber.trim()) return;

    if (editingHostelId) {
      setHostelRooms(prev => prev.map(h => h.id === editingHostelId ? { ...hostelForm, id: editingHostelId } : h));
      triggerToast(`Hostel lodging "${hostelForm.roomNumber}" updated!`);
    } else {
      const newHostel: HostelRoom = {
        ...hostelForm,
        id: `hostel-${Date.now()}`,
      };
      setHostelRooms(prev => [...prev, newHostel]);
      triggerToast(`Hostel room "${hostelForm.roomNumber}" added! Total capacity expanded.`);
    }

    setIsEditingHostel(false);
    setEditingHostelId(null);
  };

  const handleEditHostelClick = (hr: HostelRoom) => {
    setEditingHostelId(hr.id);
    setHostelForm({
      roomNumber: hr.roomNumber,
      type: hr.type,
      capacity: hr.capacity,
      floor: hr.floor,
      nightlyRate: hr.nightlyRate,
      status: hr.status,
      amenities: hr.amenities,
      isAccessible: hr.isAccessible,
    });
    setIsEditingHostel(true);
  };

  // --- CAFETERIA SAVE ---
  const handleSaveCafeteria = (e: React.FormEvent) => {
    e.preventDefault();
    setCafeteria(cafeteriaForm);
    triggerToast('Cafeteria capacity & menu bulletin updated live!');
  };

  // --- NOTIFICATION BROADCAST ---
  const handleBroadcastNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifForm.title.trim() || !notifForm.message.trim()) return;

    const newAlert: PushNotificationAlert = {
      id: `alert-${Date.now()}`,
      title: notifForm.title,
      message: notifForm.message,
      priority: notifForm.priority,
      targetAgency: notifForm.targetAgency,
      sender: `${currentUser.name} (${currentUser.title})`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      read: false,
      imageUrl: notifForm.imageUrl,
    };

    setAlerts(prev => [newAlert, ...prev]);
    triggerToast('Urgent alert with picture broadcasted across all agency terminals!');
    setNotifForm({
      title: '',
      message: '',
      priority: 'Urgent',
      targetAgency: 'ALL',
      imageUrl: PRESET_IMAGES[0].url,
    });
  };

  if (currentUser.role !== 'ADMIN') {
    return (
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-8 text-center space-y-4 max-w-xl mx-auto my-12">
        <ShieldCheck className="w-12 h-12 text-amber-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 font-display">Administrator Privileges Required</h2>
        <p className="text-xs text-slate-600 font-medium">
          You are currently signed in as <span className="font-bold text-slate-900">{currentUser.name}</span> ({currentUser.role}). Please switch to the Director General or Administrator profile in the top-right menu to access the Facility & News Customizer console.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center font-display text-xl shadow-md">
            RAA
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 font-display">
                PDC Admin Facility & News Control Console
              </h1>
              <span className="bg-amber-100 text-amber-900 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-amber-300">
                DIRECTOR GENERAL
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Customize news updates with photos, configure room capacities, modify trainee hostel beds, and update cafeteria menus.
            </p>
          </div>
        </div>

        {/* Live Feedback Toast */}
        {saveFeedback && (
          <div className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-mono font-bold shadow-md animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
            <span>{saveFeedback}</span>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('news')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'news'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>News & Photo Updates ({news.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('rooms')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'rooms'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Conference Halls & Rooms ({rooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('hostel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'hostel'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BedDouble className="w-4 h-4" />
          <span>Trainee Hostel Inventory ({hostelRooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cafeteria')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'cafeteria'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Cafeteria & Dining Hall</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <BellRing className="w-4 h-4" />
          <span>Push Notifications with Photo</span>
        </button>
      </div>

      {/* --- TAB 1: NEWS & PHOTO UPDATES --- */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-amber-600" />
              Institutional News & Photo Bulletin Management
            </h2>
            {!isEditingNews && (
              <button
                onClick={() => {
                  setEditingNewsId(null);
                  setNewsForm({
                    title: '',
                    category: 'Announcement',
                    content: '',
                    imageUrl: PRESET_IMAGES[0].url,
                    author: currentUser.name,
                    isPinned: false,
                    targetAgency: 'ALL',
                  });
                  setIsEditingNews(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Photo Announcement</span>
              </button>
            )}
          </div>

          {/* Create/Edit News Form */}
          {isEditingNews && (
            <div className="bg-white border border-amber-300 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm font-display">
                  {editingNewsId ? 'Edit Announcement & Picture' : 'Create New Photo Announcement'}
                </h3>
                <button
                  onClick={() => setIsEditingNews(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveNews} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Announcement Title</label>
                    <input
                      type="text"
                      required
                      value={newsForm.title}
                      onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                      placeholder="e.g., Expansion of Tsirang Campus Trainee Hostel"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Category</label>
                    <select
                      value={newsForm.category}
                      onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Announcement">Announcement</option>
                      <option value="Press Release">Press Release</option>
                      <option value="Infrastructure Update">Infrastructure Update</option>
                      <option value="Training Alert">Training Alert</option>
                      <option value="Cafeteria Notice">Cafeteria Notice</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Content / Description</label>
                  <textarea
                    rows={3}
                    required
                    value={newsForm.content}
                    onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                    placeholder="Enter detailed news message..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Picture Customization Section */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-display">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      Picture Update / Featured Image
                    </label>
                    <span className="text-[11px] text-slate-500 font-mono">Upload file or enter URL</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Select Preset Campus Image:
                      </label>
                      <div className="flex gap-2">
                        {PRESET_IMAGES.map((img, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setNewsForm({ ...newsForm, imageUrl: img.url })}
                            className={`flex-1 text-[10px] font-semibold p-1.5 rounded-lg border text-center transition truncate ${
                              newsForm.imageUrl === img.url
                                ? 'bg-amber-100 border-amber-500 text-amber-900 font-bold'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {img.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Upload Custom Photo File:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageFileUpload(e, 'news')}
                        className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-amber-300 hover:file:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-600">Or Paste Image URL:</label>
                    <input
                      type="text"
                      value={newsForm.imageUrl}
                      onChange={(e) => setNewsForm({ ...newsForm, imageUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900"
                    />
                  </div>

                  {newsForm.imageUrl && (
                    <div className="flex items-center gap-3 pt-2">
                      <span className="text-[11px] font-semibold text-slate-600">Image Preview:</span>
                      <img
                        src={newsForm.imageUrl}
                        alt="Preview"
                        className="w-24 h-16 object-cover rounded-lg border border-slate-300 shadow-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={newsForm.isPinned}
                      onChange={(e) => setNewsForm({ ...newsForm, isPinned: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Pin to Top of Dashboard Feed</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingNews(false)}
                      className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingNewsId ? 'Update Announcement' : 'Publish Announcement'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* List of News Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-slate-950/80 text-amber-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                        {item.category}
                      </span>
                      {item.isPinned && (
                        <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm font-display leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono text-[11px] font-semibold">{item.date} · {item.author}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditNewsClick(item)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-amber-600 hover:border-amber-400 transition"
                      title="Edit News"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNews(item.id)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-400 transition"
                      title="Delete News"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 2: ROOMS & CONFERENCE HALLS CAPACITY MANAGEMENT --- */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-600" />
                Conference Halls, Seminar Rooms & IT Lab Inventory
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust seat capacities, hourly rates, equipment specs, and pictures for room bookings.
              </p>
            </div>
            {!isEditingRoom && (
              <button
                onClick={() => {
                  setEditingRoomId(null);
                  setRoomForm({
                    name: '',
                    code: '',
                    capacity: 50,
                    floor: '1st Floor',
                    status: 'Available',
                    hourlyRate: 1000,
                    equipment: ['Projector', 'WiFi', 'PA Sound System'],
                    isAccessible: true,
                    image: PRESET_IMAGES[1].url,
                    description: '',
                  });
                  setIsEditingRoom(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Venue / Room</span>
              </button>
            )}
          </div>

          {/* Edit/Add Room Form */}
          {isEditingRoom && (
            <div className="bg-white border border-amber-300 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm font-display">
                  {editingRoomId ? `Edit Venue: ${roomForm.name}` : 'Add New Venue to Inventory'}
                </h3>
                <button onClick={() => setIsEditingRoom(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveRoom} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Venue Name</label>
                    <input
                      type="text"
                      required
                      value={roomForm.name}
                      onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                      placeholder="e.g. Jigme Khesar Executive Hall"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Room Code</label>
                    <input
                      type="text"
                      required
                      value={roomForm.code}
                      onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })}
                      placeholder="e.g. HALL-02"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-700 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Total Seating Capacity (Seats)
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={500}
                      value={roomForm.capacity}
                      onChange={(e) => setRoomForm({ ...roomForm, capacity: parseInt(e.target.value) || 0 })}
                      className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Hourly Rate (Nu.)</label>
                    <input
                      type="number"
                      required
                      value={roomForm.hourlyRate}
                      onChange={(e) => setRoomForm({ ...roomForm, hourlyRate: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Floor & Wing</label>
                    <input
                      type="text"
                      value={roomForm.floor}
                      onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Availability Status</label>
                    <select
                      value={roomForm.status}
                      onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Available">Available</option>
                      <option value="Occupied">Occupied</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700">Description</label>
                  <textarea
                    rows={2}
                    value={roomForm.description}
                    onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-display">
                    <ImageIcon className="w-4 h-4 text-amber-600" />
                    Venue Photo Customization
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageFileUpload(e, 'room')}
                      className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-amber-300"
                    />
                    <input
                      type="text"
                      value={roomForm.image}
                      onChange={(e) => setRoomForm({ ...roomForm, image: e.target.value })}
                      placeholder="Or paste Image URL"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={roomForm.isAccessible}
                      onChange={(e) => setRoomForm({ ...roomForm, isAccessible: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Wheelchair Ramp & Disability Accessible</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingRoom(false)}
                      className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingRoomId ? 'Save Room Capacity' : 'Add Room'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* List of Rooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.map((room) => (
              <div key={room.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition">
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[11px] font-mono font-bold px-2.5 py-1 rounded-full shadow-xs">
                    Capacity: {room.capacity} Seats
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-sm font-display">{room.name}</h3>
                      <span className="text-xs font-mono font-bold text-amber-700">Nu. {room.hourlyRate}/hr</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">{room.code} · {room.floor}</div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{room.description}</p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      room.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {room.status}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditRoomClick(room)}
                        className="px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Capacity</span>
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-1 rounded-lg bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-700 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: TRAINEE HOSTEL CAPACITY MANAGEMENT --- */}
      {activeTab === 'hostel' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-amber-600" />
                Trainee Hostel & Lodging Capacity (100+ Bed Facility)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage room numbers, bed capacity per suite, pricing per night, and disability amenities.
              </p>
            </div>
            {!isEditingHostel && (
              <button
                onClick={() => {
                  setEditingHostelId(null);
                  setHostelForm({
                    roomNumber: '',
                    type: 'Single Suite',
                    capacity: 1,
                    floor: '1st Floor Residential Block',
                    nightlyRate: 800,
                    status: 'Available',
                    amenities: ['Single Bed', 'Attached Bath', 'WiFi'],
                    isAccessible: false,
                  });
                  setIsEditingHostel(true);
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hostel Room</span>
              </button>
            )}
          </div>

          {/* Edit Hostel Form */}
          {isEditingHostel && (
            <div className="bg-white border border-amber-300 rounded-2xl p-6 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm font-display">
                  {editingHostelId ? `Edit Hostel Room: ${hostelForm.roomNumber}` : 'Add New Trainee Hostel Room'}
                </h3>
                <button onClick={() => setIsEditingHostel(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveHostel} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Room Number / Suite Code</label>
                    <input
                      type="text"
                      required
                      value={hostelForm.roomNumber}
                      onChange={(e) => setHostelForm({ ...hostelForm, roomNumber: e.target.value })}
                      placeholder="e.g. Suite A-204"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Room Type</label>
                    <select
                      value={hostelForm.type}
                      onChange={(e) => setHostelForm({ ...hostelForm, type: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    >
                      <option value="Executive Suite">Executive Suite</option>
                      <option value="Single Suite">Single Suite</option>
                      <option value="Shared Twin Room">Shared Twin Room</option>
                      <option value="Accessible Suite">Accessible Suite</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-amber-700 flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5" /> Max Guest Capacity (Beds)
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={10}
                      value={hostelForm.capacity}
                      onChange={(e) => setHostelForm({ ...hostelForm, capacity: parseInt(e.target.value) || 1 })}
                      className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Nightly Rate (Nu.)</label>
                    <input
                      type="number"
                      required
                      value={hostelForm.nightlyRate}
                      onChange={(e) => setHostelForm({ ...hostelForm, nightlyRate: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">Floor & Residential Block</label>
                    <input
                      type="text"
                      value={hostelForm.floor}
                      onChange={(e) => setHostelForm({ ...hostelForm, floor: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={hostelForm.isAccessible}
                      onChange={(e) => setHostelForm({ ...hostelForm, isAccessible: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Wheelchair Accessible & Barrier-Free Bath</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingHostel(false)}
                      className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs flex items-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingHostelId ? 'Update Hostel Room' : 'Create Hostel Room'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* List of Hostel Rooms */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hostelRooms.map((hr) => (
              <div key={hr.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm font-mono">{hr.roomNumber}</span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    {hr.type}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Capacity:</span>
                    <span className="font-bold text-slate-900 font-mono">{hr.capacity} Trainee Bed(s)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Nightly Rate:</span>
                    <span className="font-bold text-amber-700 font-mono">Nu. {hr.nightlyRate}/night</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    hr.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {hr.status}
                  </span>

                  <button
                    onClick={() => handleEditHostelClick(hr)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-bold"
                  >
                    Edit Capacity
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: CAFETERIA & DINING HALL CUSTOMIZER --- */}
      {activeTab === 'cafeteria' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-600" />
                Central Dining Hall & Cafeteria Customization
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Update total seating capacity, organic menu bulletin, operating hours, and dining photo.
              </p>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold px-3 py-1 rounded-full border border-emerald-300">
              OPERATIONAL
            </span>
          </div>

          <form onSubmit={handleSaveCafeteria} className="space-y-6 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Facility / Dining Hall Name</label>
                <input
                  type="text"
                  required
                  value={cafeteriaForm.facilityName}
                  onChange={(e) => setCafeteriaForm({ ...cafeteriaForm, facilityName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> Total Dining Seating Capacity (Guests)
                </label>
                <input
                  type="number"
                  required
                  min={20}
                  max={500}
                  value={cafeteriaForm.totalCapacity}
                  onChange={(e) => setCafeteriaForm({ ...cafeteriaForm, totalCapacity: parseInt(e.target.value) || 0 })}
                  className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Operating Service Hours
                </label>
                <input
                  type="text"
                  required
                  value={cafeteriaForm.operatingHours}
                  onChange={(e) => setCafeteriaForm({ ...cafeteriaForm, operatingHours: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Featured Picture</label>
                <input
                  type="text"
                  value={cafeteriaForm.imageUrl}
                  onChange={(e) => setCafeteriaForm({ ...cafeteriaForm, imageUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-amber-600" /> Today's Organic Menu Bulletin (Public View)
              </label>
              <textarea
                rows={3}
                required
                value={cafeteriaForm.currentMenu}
                onChange={(e) => setCafeteriaForm({ ...cafeteriaForm, currentMenu: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 transition"
              >
                <Save className="w-4 h-4" />
                <span>Save Cafeteria Capacity & Menu Updates</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- TAB 5: PUSH NOTIFICATIONS WITH PHOTO --- */}
      {activeTab === 'notifications' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                <BellRing className="w-5 h-5 text-amber-600" />
                Broadcast Urgent Push Notification with Picture
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Send real-time alerts across all agency terminals with customizable priority badges and photo attachments.
              </p>
            </div>
          </div>

          <form onSubmit={handleBroadcastNotification} className="space-y-4 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Notification Title</label>
                <input
                  type="text"
                  required
                  value={notifForm.title}
                  onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                  placeholder="e.g. Venue Change Notice for Room GNH"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">Urgency Priority level</label>
                <select
                  value={notifForm.priority}
                  onChange={(e) => setNotifForm({ ...notifForm, priority: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="Urgent">Urgent Alert (Red Badge)</option>
                  <option value="Notice">Notice (Amber Badge)</option>
                  <option value="Info">General Info (Blue Badge)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Message Content</label>
              <textarea
                rows={3}
                required
                value={notifForm.message}
                onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                placeholder="Enter alert details..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Notification Picture Upload */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-display">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                Notification Photo Attachment
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFileUpload(e, 'notif')}
                  className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-amber-300"
                />
                <input
                  type="text"
                  value={notifForm.imageUrl}
                  onChange={(e) => setNotifForm({ ...notifForm, imageUrl: e.target.value })}
                  placeholder="Or paste Image URL"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-2 transition"
              >
                <BellRing className="w-4 h-4" />
                <span>Broadcast Alert Now</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
