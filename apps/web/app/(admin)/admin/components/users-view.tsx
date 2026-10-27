import { Search } from "lucide-react";

import { useState } from "react";

interface UsersViewProps {
  users: any[];
  handleDeleteUser: (email: string) => void;
}

export function AdminUsersView({ users, handleDeleteUser }: UsersViewProps) {
  const [userSearch, setUserSearch] = useState("");

  const filteredUsers = users.filter((u) =>
    (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[18px] font-bold">All Platform Users ({users.length})</h2>
        <div className="flex items-center gap-2 bg-[#15171b] border border-border rounded-lg px-3 py-2 w-80">
          <Search className="w-4 h-4 text-muted" />
          <input 
            value={userSearch} 
            onChange={(e) => setUserSearch(e.target.value)} 
            placeholder="Search users..." 
            className="bg-transparent text-[12px] outline-none w-full text-foreground placeholder:text-zinc-600" 
          />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="border-b border-black/5 dark:border-white/5 text-muted">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Name</th>
              <th className="px-5 py-3 text-left font-medium">Email</th>
              <th className="px-5 py-3 text-left font-medium">Role</th>
              <th className="px-5 py-3 text-left font-medium">Joined</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((u) => (
              <tr key={u.email} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                <td className="px-5 py-3 font-bold flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#ff5c1a]/15 grid place-items-center text-[8px] font-bold text-[#ff5c1a]">{u.name[0]}</div>
                  {u.name}
                </td>
                <td className="px-5 py-3 text-muted">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.role === "ADMIN" ? "bg-red-500/15 text-red-400" : u.role === "SELLER" ? "bg-violet-500/15 text-violet-400" : "bg-blue-500/15 text-blue-400"}`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted">{u.joinedAt ? new Date(u.joinedAt).toLocaleDateString() : "N/A"}</td>
                <td className="px-5 py-3 text-right">
                  {u.role !== "ADMIN" && (
                    <button onClick={() => handleDeleteUser(u.email)} className="text-[10px] text-red-400 hover:underline font-bold">Remove</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
