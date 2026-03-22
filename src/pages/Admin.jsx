import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaUsers, FaQuoteLeft, FaCameraRetro, FaSave, FaUndo, FaPlus, FaTrash, FaCheck, FaLock, FaSignOutAlt, FaCog } from 'react-icons/fa';
import { upcomingEventsData, teamData, testimonialsData, pastEventsData } from '../data/siteData';

const TABS = [
  { id: 'upcoming', label: 'Upcoming Events', icon: FaCalendarAlt, storageKey: 'admin_upcomingEventsData', currentData: upcomingEventsData },
  { id: 'team', label: 'Team Members', icon: FaUsers, storageKey: 'admin_teamData', currentData: teamData },
  { id: 'album', label: 'Photo Album', icon: FaCameraRetro, storageKey: 'admin_pastEventsData', currentData: pastEventsData },
  { id: 'testimonials', label: 'Testimonials', icon: FaQuoteLeft, storageKey: 'admin_testimonialsData', currentData: testimonialsData },
];

const ADMIN_PASSWORD = "codecrafters_admin";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    sessionStorage.getItem('cc_admin_auth') === 'true'
  );
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [formData, setFormData] = useState(JSON.parse(JSON.stringify(TABS[0].currentData)));
  const [success, setSuccess] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('cc_admin_auth', 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Incorrect password');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cc_admin_auth');
    setIsAuthenticated(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFormData(JSON.parse(JSON.stringify(tab.currentData)));
    setSuccess('');
  };

  const handleSave = () => {
    localStorage.setItem(activeTab.storageKey, JSON.stringify(formData));
    setSuccess('Saved! Refreshing...');
    setTimeout(() => window.location.reload(), 700);
  };

  const handleReset = () => {
    if (window.confirm(`Are you sure you want to reset ${activeTab.label} to default? All changes will be lost.`)) {
      localStorage.removeItem(activeTab.storageKey);
      window.location.reload();
    }
  };

  const updateItem = (index, field, value, arrayPath) => {
    const newData = Array.isArray(formData) ? [...formData] : { ...formData };
    if (arrayPath) {
       newData[arrayPath][index][field] = value;
    } else {
       newData[index][field] = value;
    }
    setFormData(newData);
  };

  const deleteItem = (index, arrayPath) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    const newData = Array.isArray(formData) ? [...formData] : { ...formData };
    if (arrayPath) {
       newData[arrayPath].splice(index, 1);
    } else {
       newData.splice(index, 1);
    }
    setFormData(newData);
  };

  const addItem = (emptyTemplate, arrayPath) => {
     const newData = Array.isArray(formData) ? [...formData] : { ...formData };
     if (arrayPath) {
        newData[arrayPath].push({ ...emptyTemplate, id: Date.now() });
     } else {
        newData.push({ ...emptyTemplate, id: Date.now() });
     }
     setFormData(newData);
  }

  const updateStringList = (index, field, valueString, arrayPath) => {
    updateItem(index, field, valueString.split(',').map(s => s.trim()).filter(Boolean), arrayPath);
  }

  const renderInput = (label, value, onChange, isTextArea = false) => (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[11px] font-bold uppercase tracking-widest text-black/50">{label}</label>
      {isTextArea ? (
        <textarea 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/5 border-2 border-transparent focus:border-black rounded-lg px-4 py-3 text-sm text-black transition-colors min-h-[100px] resize-y outline-none"
        />
      ) : (
        <input 
          type="text" 
          value={value || ''} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/5 border-2 border-transparent focus:border-black rounded-lg px-4 py-2 text-sm text-black transition-colors outline-none"
        />
      )}
    </div>
  );

  const renderCard = (item, index, titleField, fields, arrayPath = null) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      key={item.id || index} 
      className="bg-white border-2 border-black/10 rounded-2xl p-6 mb-6 shadow-sm relative group overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-2 h-full bg-black/10 transition-colors group-hover:bg-black"></div>
      
      <div className="flex justify-between items-center mb-6 pl-2">
        <h3 className="font-bold text-lg text-black">{item[ titleField ] || "New Item"}</h3>
        <button 
          onClick={() => deleteItem(index, arrayPath)}
          className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
          title="Delete item"
        >
          <FaTrash size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pl-2">
         {fields.map(f => {
           if (f.type === 'stringList') {
              return <div key={f.key} className="md:col-span-2">{renderInput(f.label, (item[f.key] || []).join(', '), (val) => updateStringList(index, f.key, val, arrayPath), false)}</div>
           }
           if (f.type === 'textarea') {
              return <div key={f.key} className="md:col-span-2">{renderInput(f.label, item[f.key], (val) => updateItem(index, f.key, val, arrayPath), true)}</div>
           }
           return <div key={f.key} className={f.fullWidth ? "md:col-span-2" : ""}>{renderInput(f.label, item[f.key], (val) => updateItem(index, f.key, val, arrayPath), false)}</div>
         })}
      </div>
    </motion.div>
  );

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] py-20 bg-[#e6e4dc] flex flex-col justify-center items-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 md:p-10 rounded-2xl max-w-md w-full border-2 border-black/10 shadow-[12px_12px_0px_rgba(0,0,0,0.1)] relative"
        >
          <div className="absolute -top-6 -right-6 text-black/10 rotate-12 pointer-events-none">
             <FaLock size={80} />
          </div>

          <h1 className="text-3xl font-black font-serif text-black tracking-tighter mb-2 relative z-10">Admin Access</h1>
          <p className="text-black/60 mb-8 font-medium">Please authenticate to manage Site Data.</p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4 relative z-10">
            <div>
              <input
                type="password"
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-black/5 border-2 border-transparent focus:border-black rounded-xl px-4 py-3 text-black outline-none transition-colors"
                autoFocus
              />
              {loginError && <p className="text-red-500 font-bold text-xs mt-2 ml-1">{loginError}</p>}
            </div>
            <button 
              type="submit"
              className="w-full bg-black text-white hover:scale-[1.02] active:scale-[0.98] font-black tracking-widest uppercase rounded-xl px-4 py-3 transition-transform shadow-[4px_4px_0px_rgba(0,0,0,0.2)] mt-2"
            >
              Unlock
            </button>
          </form>

          <div className="mt-8 text-center text-[10px] font-mono font-bold uppercase tracking-widest text-black/30">
            pwd: <span className="bg-black/5 text-black/50 px-2 py-1 rounded">codecrafters_admin</span>
          </div>
        </motion.div>
      </div>
    )
  }

  // --- DASHBOARD SCREEN ---
  return (
    <div className="min-h-[80vh] bg-[#e6e4dc] pt-24 pb-16 px-6 md:px-12 lg:px-20 font-sans overflow-hidden">
      
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b-2 border-black/10"
        >
          <div>
             <h1 className="text-5xl md:text-6xl font-black font-serif text-black tracking-tighter inline-flex items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                >
                  <FaCog size={40} className="text-black/20" />
                </motion.div>
                ADMIN CONTROL.
             </h1>
             <p className="text-black/50 text-xl font-bold font-mono tracking-widest uppercase mt-4">
                SYSTEM // REGISTRY OVERRIDE
             </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-bold tracking-widest uppercase text-black/50 hover:text-black hover:bg-black/5 border-2 border-transparent hover:border-black/10 px-4 py-2 rounded-xl transition-all w-fit md:w-auto"
          >
            <FaSignOutAlt /> Lock Portal
          </motion.button>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 relative items-start">
          
          {/* Sidebar / Tabs */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-64 shrink-0 flex flex-col gap-2 lg:sticky lg:top-32 z-20"
          >
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black/40 mb-2 pl-2">Data Modules</h3>
            {TABS.map((tab, i) => {
              const isActive = activeTab.id === tab.id;
              const Icon = tab.icon;
              return (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + (i * 0.1) }}
                  key={tab.id}
                  onClick={() => handleTabChange(tab)}
                  className={`flex items-center gap-3 px-5 py-4 rounded-xl font-bold tracking-wide text-left transition-all duration-300 ${
                    isActive 
                      ? 'bg-black text-white shadow-[6px_6px_0px_rgba(0,0,0,0.1)] -translate-y-1' 
                      : 'bg-white text-black/60 hover:text-black hover:bg-black/5 border-2 border-transparent relative overflow-hidden group'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'opacity-100' : 'opacity-40'} />
                  {tab.label}
                  {!isActive && (
                     <div className="absolute inset-0 bg-black/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Main Editor Area */}
          <div className="flex-1 max-w-4xl">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border-2 border-black/10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-black/5 rounded-full -translate-y-12 translate-x-8 pointer-events-none"></div>
              
              <h2 className="text-2xl font-black text-black">
                {activeTab.label}
              </h2>

              <div className="flex items-center gap-3 relative z-10">
                <button 
                  onClick={handleReset}
                  className="px-4 py-3 bg-black/5 hover:bg-black/10 text-black rounded-xl font-bold text-sm tracking-wide transition-colors flex items-center gap-2"
                >
                  <FaUndo size={14}/> Reset
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-3 bg-black text-white hover:scale-105 active:scale-95 rounded-xl font-bold text-sm tracking-wide transition-transform shadow-[4px_4px_0px_rgba(0,0,0,0.2)] flex items-center gap-2"
                >
                  {success ? <FaCheck size={14}/> : <FaSave size={14}/>} {success ? "Saved!" : "Publish Changes"}
                </button>
              </div>
            </div>

            {/* Content Rendering based on current tab */}
            <div className="space-y-6">
              
              {activeTab.id === 'upcoming' && (
                <AnimatePresence>
                  {formData.map((evt, i) => renderCard(evt, i, 'title', [
                    { key: 'title', label: 'Event Title' },
                    { key: 'date', label: 'Date' },
                    { key: 'category', label: 'Category' },
                    { key: 'location', label: 'Location' },
                    { key: 'time', label: 'Time' },
                    { key: 'gradient', label: 'CSS Gradient Class' },
                    { key: 'image', label: 'Image URL', fullWidth: true },
                    { key: 'speakers', label: 'Speakers (comma separated)', type: 'stringList', fullWidth: true },
                    { key: 'description', label: 'Description', type: 'textarea', fullWidth: true },
                  ]))}
                  <button onClick={() => addItem({ title: "New Event", description: "", date: "", category: "", image: "", location: "", time: "", speakers: [], gradient: "from-gray-500 to-gray-700" })} className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-white border-[3px] border-dashed border-black/10 hover:border-black text-black/40 hover:text-black rounded-2xl font-bold transition-all group">
                     <div className="w-12 h-12 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors">
                        <FaPlus size={16}/>
                     </div>
                     <span className="tracking-widest uppercase text-xs">Add New Event</span>
                  </button>
                </AnimatePresence>
              )}

              {activeTab.id === 'team' && (
                <>
                  <h3 className="text-xl font-black uppercase tracking-widest text-black/40 mb-4 border-b-2 border-black/10 pb-2 flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-black/20"></span> Founding / OG Members
                  </h3>
                  {formData.og.map((member, i) => renderCard(member, i, 'name', [
                    { key: 'name', label: 'Name' },
                    { key: 'role', label: 'Role' },
                    { key: 'linkedin', label: 'LinkedIn URL', fullWidth: true },
                    { key: 'image', label: 'Image URL', fullWidth: true },
                  ], 'og'))}
                  <button onClick={() => addItem({ name: "New Member", role: "", linkedin: "", image: "" }, 'og')} className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-white border-[3px] border-dashed border-black/10 hover:border-black text-black/40 hover:text-black rounded-2xl font-bold transition-all group mb-12">
                     <div className="w-10 h-10 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors">
                        <FaPlus size={14}/>
                     </div>
                     <span className="tracking-widest uppercase text-xs">Add OG Member</span>
                  </button>

                  <h3 className="text-xl font-black uppercase tracking-widest text-black/40 mb-4 border-b-2 border-black/10 pb-2 flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full bg-black/20"></span> Core Members
                  </h3>
                  {formData.core.map((member, i) => renderCard(member, i, 'name', [
                    { key: 'name', label: 'Name' },
                    { key: 'role', label: 'Role' },
                    { key: 'linkedin', label: 'LinkedIn URL', fullWidth: true },
                    { key: 'image', label: 'Image URL', fullWidth: true },
                  ], 'core'))}
                  <button onClick={() => addItem({ name: "New Member", role: "", linkedin: "", image: "" }, 'core')} className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-white border-[3px] border-dashed border-black/10 hover:border-black text-black/40 hover:text-black rounded-2xl font-bold transition-all group">
                     <div className="w-10 h-10 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors">
                        <FaPlus size={14}/>
                     </div>
                     <span className="tracking-widest uppercase text-xs">Add Core Member</span>
                  </button>
                </>
              )}

              {activeTab.id === 'album' && (
                <>
                  {formData.map((evt, i) => renderCard(evt, i, 'title', [
                    { key: 'title', label: 'Event Title' },
                    { key: 'date', label: 'Date' },
                    { key: 'coverImage', label: 'Cover Image URL', fullWidth: true },
                    { key: 'photos', label: 'Gallery Photo URLs (comma separated)', type: 'stringList', fullWidth: true },
                    { key: 'description', label: 'Description', type: 'textarea', fullWidth: true },
                  ]))}
                  <button onClick={() => addItem({ title: "New Album", date: "", description: "", coverImage: "", photos: [] })} className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-white border-[3px] border-dashed border-black/10 hover:border-black text-black/40 hover:text-black rounded-2xl font-bold transition-all group">
                     <div className="w-12 h-12 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors">
                        <FaPlus size={16}/>
                     </div>
                     <span className="tracking-widest uppercase text-xs">Add New Album</span>
                  </button>
                </>
              )}

              {activeTab.id === 'testimonials' && (
                <>
                  {formData.map((test, i) => renderCard(test, i, 'name', [
                    { key: 'name', label: 'Person Name' },
                    { key: 'role', label: 'Role / Title' },
                    { key: 'avatar', label: 'Avatar Image URL', fullWidth: true },
                    { key: 'text', label: 'Testimonial Quote', type: 'textarea', fullWidth: true },
                  ]))}
                  <button onClick={() => addItem({ name: "New Person", role: "", text: "", avatar: "" })} className="flex flex-col items-center justify-center gap-2 w-full py-8 bg-white border-[3px] border-dashed border-black/10 hover:border-black text-black/40 hover:text-black rounded-2xl font-bold transition-all group">
                     <div className="w-12 h-12 rounded-full bg-black/5 group-hover:bg-black group-hover:text-white flex items-center justify-center transition-colors">
                        <FaPlus size={16}/>
                     </div>
                     <span className="tracking-widest uppercase text-xs">Add New Testimonial</span>
                  </button>
                </>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
