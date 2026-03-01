"use client";

/* CHANGES NEEDED:
  1. Load and populate different tabs from database on page load(Make sure to save pages automatically after being created).
  2. Allow user to rename tabs when clicking on the tab name (make sure to save the new name to the database).
  3. Add warning to delete tab
*/

import React, { useEffect, useState } from 'react';
import { Plus, Users, X } from 'lucide-react'; 

export default function Home() {
  const [tabs, setTabs] = useState([{ id: 'default', label: 'All People' }]);
  const [allPeople, setAllPeople] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('default');
  const [listsData, setListsData] = useState<Record<string, any[]>>({});
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [newMemberModalOpen, setNewMemberModalOpen] = useState(false);

  useEffect(() => {
    async function fetchLists() {
      try {
        const res = await fetch("/api/lists");

        if (!res.ok) {
          console.error("Failed to fetch lists");
          return;
        }

        const data = await res.json();

        if (!Array.isArray(data)) return;

        const dynamicTabs = data.map((list: any) => ({
          id: list.id.toString(),
          label: list.name,
        }));

        setTabs(dynamicTabs);

        // Only set activeTab if none exists yet
        setActiveTab(prev =>
          prev && dynamicTabs.some(t => t.id === prev)
            ? prev
            : dynamicTabs[0]?.id ?? ""
        );

        const listsMap: Record<string, any[]> = {};
        data.forEach((list: any) => {
          listsMap[list.id] = list.people || [];
        });

        setListsData(listsMap);

      } catch (err) {
        console.error("Error fetching lists:", err);
      }
    }

    fetchLists();
  }, []);

  const fetchAllPeople = async () => {
    const res = await fetch("/api/people");
    if (!res.ok) return;
    const data = await res.json();
    setAllPeople(data);
  };

  const addTab = async () => {
    const name = `New List`;

    const res = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) return;

    const newList = await res.json();

    setTabs([...tabs, { id: newList.id.toString(), label: newList.name }]);
    setListsData({ ...listsData, [newList.id]: [] });
    setActiveTab(newList.id.toString());
  };

  const removeTab = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (tabs.length <= 1) return;

    const confirmed = confirm("Are you sure you want to delete this list?");
    if (!confirmed) return;

    await fetch(`/api/lists/${id}`, {
      method: "DELETE",
    });

    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);

    if (activeTab === id) {
      setActiveTab(newTabs[0].id);
    }

    const updatedLists = { ...listsData };
    delete updatedLists[id];
    setListsData(updatedLists);
  };

  const createMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const payload = {
      name: formData.get("name"),
      role: formData.get("role"),
      status: formData.get("status"),
      email: formData.get("email"),
      phone: formData.get("phone"),
    };

    // Create person globally
    const res = await fetch("/api/people", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("Failed to create person.");
      return;
    }

    const newPerson = await res.json();

    // Attach to active list
    await fetch(`/api/lists/${activeTab}/people`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ person_id: newPerson.id }),
    });

    // Update UI
    setListsData((prev) => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] || []), newPerson],
    }));

    setNewMemberModalOpen(false);
    setAddMemberModalOpen(false);
  };

  const attachPersonToList = async (person: any) => {
    await fetch(`/api/lists/${activeTab}/people`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ person_id: person.id }),
    });

    setListsData((prev) => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] || []), person],
    }));

    setAddMemberModalOpen(false);
  };

  // Get the people for the current active tab (default to empty array if not found)
  const currentPeople = listsData[activeTab] || [];
  const currentIds = new Set(currentPeople.map(p => p.id));
  const availablePeople = allPeople.filter(p => !currentIds.has(p.id));

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

          <button 
            className="flex items-center gap-2 w-full px-2 py-3 text-zinc-500 hover:bg-[#252525] rounded-md mt-2 transition-colors border border-transparent cursor-pointer hover:border-[#2F2F2F]"
            onClick={() => {
              fetchAllPeople();
              setAddMemberModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span className="text-sm">Add member</span>
          </button>
        </div>
        
          {/* ADD MEMBER MODAL */}
          {addMemberModalOpen && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div
                className="bg-[#1F1F1F] p-6 rounded-xl w-full max-w-md shadow-xl space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Member List</h2>
                  <button
                    type="button"
                    onClick={() => setAddMemberModalOpen(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {availablePeople.length > 0 ? (
                    availablePeople.map((person) => (
                      <div
                        key={person.id}
                        onClick={() => attachPersonToList(person)}
                        className="p-2 bg-[#2A2A2A] rounded-md cursor-pointer hover:bg-[#333]"
                      >
                        {person.name}
                      </div>
                    ))
                  ) : (
                    <p className="text-zinc-500 text-sm">No people found.</p>
                  )}
                </div>

                <button 
                  className="w-full py-2 bg-[#2F2F2F] hover:bg-[#3F3F3F] rounded-md text-sm transition-colors cursor-pointer"
                  onClick={() => setNewMemberModalOpen(true)}
                >
                  <span className="text-sm">Create New Member</span>
                </button>
                
              </div>
            </div>
          )}

          {/* CREATE NEW MEMBER MODAL */}
          {newMemberModalOpen && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <form
                onSubmit={createMember}
                className="bg-[#1F1F1F] p-6 rounded-xl w-full max-w-md shadow-xl space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Create New Member</h2>
                  <button
                    type="button"
                    onClick={() => setNewMemberModalOpen(false)}
                    className="text-zinc-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    required
                    className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-sm outline-none"
                  />
                  <input
                    type="text"
                    name="role"
                    placeholder="Role"
                    className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-sm outline-none"
                  />
                  <select
                    name="status"
                    className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-sm outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-sm outline-none"
                  />
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    className="w-full px-3 py-2 bg-[#2A2A2A] rounded-md text-sm outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#2F2F2F] hover:bg-[#3F3F3F] rounded-md text-sm transition-colors"
                >
                  Create Member
                </button>
              </form>
            </div>
          )}
      </div>
    </main>
  );
}