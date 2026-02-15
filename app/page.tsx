"use client";

import React, { useState } from 'react';
import { Plus, Users, X } from 'lucide-react'; 

// Mock Data for the different lists
const INITIAL_DATA: Record<string, any[]> = {
  'default': [
    { id: 1, name: "Alice Johnson", role: "Product Designer", status: "Active" },
    { id: 2, name: "Bob Smith", role: "Lead Engineer", status: "Away" },
  ],
  'new': [
    { id: 3, name: "Charlie Davis", role: "Researcher", status: "Busy" },
  ]
};

export default function Home() {
  const [tabs, setTabs] = useState([{ id: 'default', label: 'All People' }]);
  const [activeTab, setActiveTab] = useState('default');
  const [listsData, setListsData] = useState(INITIAL_DATA);

  const addTab = () => {
    const newId = Date.now().toString();
    setTabs([...tabs, { id: newId, label: `List ${tabs.length + 1}` }]);
    // Initialize empty data for the new list
    setListsData({ ...listsData, [newId]: [] });
    setActiveTab(newId);
  };

  const removeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length > 1) {
      const newTabs = tabs.filter(t => t.id !== id);
      setTabs(newTabs);
      if (activeTab === id) setActiveTab(newTabs[0].id);
    }
  };

  // Get the people for the current active tab (default to empty array if not found)
  const currentPeople = listsData[activeTab] || [];

  return (
    <main className="min-h-screen bg-[#191919] text-[#E3E3E3] font-sans flex flex-col">
      
      {/* 1. TABS NAVIGATION */}
      <div className="flex items-center px-4 pt-4 border-b border-[#2F2F2F] bg-[#191919] sticky top-0 z-10">
        <div className="flex overflow-x-auto no-scrollbar gap-1">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-t-md cursor-pointer text-sm transition-colors group whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-[#2F2F2F] text-white border-b-2 border-[#E3E3E3]' 
                  : 'text-zinc-500 hover:bg-[#252525]'}`}
            >
              <Users size={14} />
              <span>{tab.label}</span>
              {tabs.length > 1 && (
                <X 
                  size={12} 
                  className="ml-1 opacity-0 group-hover:opacity-100 hover:text-red-400" 
                  onClick={(e) => removeTab(tab.id, e)}
                />
              )}
            </div>
          ))}
        </div>
        <button 
          onClick={addTab}
          className="ml-2 mb-1 p-1.5 hover:bg-[#2F2F2F] rounded text-zinc-500 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* 2. DYNAMIC CONTENT AREA (Renders based on activeTab) */}
      <div className="max-w-4xl mx-auto w-full px-8 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <span className="p-2 bg-[#2F2F2F] rounded-lg">👥</span>
            {tabs.find(t => t.id === activeTab)?.label}
          </h1>
          <p className="text-zinc-500 mt-2">Currently viewing the {activeTab} workspace.</p>
        </header>

        <div className="border-t border-[#2F2F2F]">
          <div className="grid grid-cols-3 px-2 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <div>Name</div>
            <div>Role</div>
            <div>Status</div>
          </div>
          
          <div className="flex flex-col">
            {currentPeople.length > 0 ? (
              currentPeople.map((person: any) => (
                <div key={person.id} className="grid grid-cols-3 px-2 py-3 hover:bg-[#252525] rounded-md transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3 font-medium text-sm">
                    <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center text-[10px]">{person.name.charAt(0)}</div>
                    {person.name}
                  </div>
                  <div className="text-zinc-400 text-sm flex items-center">{person.role}</div>
                  <div className="flex items-center">
                    <span className="px-2 py-0.5 rounded-full text-[11px] bg-[#2F2F2F] text-zinc-300">{person.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-zinc-600 text-sm italic">
                No people in this list yet. Click "New member" to add someone.
              </div>
            )}
          </div>

          <button className="flex items-center gap-2 w-full px-2 py-3 text-zinc-500 hover:bg-[#252525] rounded-md mt-2 transition-colors border border-transparent hover:border-[#2F2F2F]">
            <Plus size={16} />
            <span className="text-sm">New member</span>
          </button>
        </div>
      </div>
    </main>
  );
}