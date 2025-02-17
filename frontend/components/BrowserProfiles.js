"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Dialog, DialogTrigger, DialogContent } from "@radix-ui/react-dialog";
import AuthGuard from "../components/AuthGuard";





export default function BrowserProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [profileName, setProfileName] = useState("");
  const [proxy, setProxy] = useState("");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/browser-profiles`);
      setProfiles(res.data);
    } catch (error) {
      console.error("Failed to fetch profiles", error);
    }
  };

  const addProfile = async () => {
    if (!profileName) return;
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/browser-profiles/add`, { profileName, proxy });
      setProfileName("");
      setProxy("");
      fetchProfiles();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create profile", error);
    }
  };

  const deleteProfile = async (id, profileName) => {
    const confirmDelete = window.confirm(
      `⚠️ WARNING: Deleting profile '${profileName}' will remove all stored data and cannot be recovered! \n\nAre you sure you want to proceed?`
    );
    if (!confirmDelete) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/browser-profiles/${id}`);
      fetchProfiles();
    } catch (error) {
      console.error("Failed to delete profile", error);
    }
  };

  const launchProfile = async (profileName) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/browser-profiles/launch`, { profileName });
      fetchProfiles();
    } catch (error) {
      console.error("Failed to launch browser", error);
    }
  };

  const stopProfile = async (profileName) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/browser-profiles/stop`, { profileName });
      fetchProfiles();
    } catch (error) {
      console.error("Failed to stop browser", error);
    }
  };

  return (
    <div className="p-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
      <AuthGuard></AuthGuard>
      <h2 className="text-2xl font-bold text-center dark:text-white">Browser Profiles</h2>

      {/* Search Input */}
      <div className="flex justify-between mt-6">
        <input
          type="text"
          placeholder="Search Profiles..."
          className="p-2 border rounded-md dark:bg-gray-700 dark:text-white w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="p-2 bg-blue-500 text-white rounded-md"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Profile
        </button>

        {/* Modal for Adding Profile */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-md shadow-lg w-96">
              <h3 className="text-xl font-bold dark:text-white">Add New Profile</h3>
              <input
                type="text"
                placeholder="Profile Name"
                className="p-2 border rounded-md dark:bg-gray-700 dark:text-white w-full mt-2"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Proxy (optional)"
                className="p-2 border rounded-md dark:bg-gray-700 dark:text-white w-full mt-2"
                value={proxy}
                onChange={(e) => setProxy(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-4">
                <button className="p-2 bg-gray-500 text-white rounded-md" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button className="p-2 bg-blue-500 text-white rounded-md" onClick={addProfile}>
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Profiles Table */}
      {profiles.length === 0 ? (
        <p className="text-center dark:text-white mt-6">No profiles found.</p>
      ) : (
        <table className="mt-6 w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700">
              <th className="p-3 text-left dark:text-white">Profile Name</th>
              <th className="p-3 text-left dark:text-white">Last Login</th>
              <th className="p-3 text-left dark:text-white">Login Type</th>
              <th className="p-3 text-left dark:text-white">Proxy</th>
              <th className="p-3 text-right dark:text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles
              .filter((profile) => profile.profileName.toLowerCase().includes(search.toLowerCase()))
              .map((profile) => (
                <tr key={profile._id} className="border-t">
                  <td className="p-3 dark:text-white">{profile.profileName}</td>
                  <td className="p-3 dark:text-white">{profile.proxy || "None"}</td>
                  <td className="p-3 dark:text-white">
                    {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : "Never"}
                  </td>
                  <td className="p-3 dark:text-white">{profile.loginType || "No Active Login"}</td>
                  <td className="p-3 flex justify-end gap-2">
                    <button className="p-2 bg-red-500 text-white rounded-md" onClick={() => deleteProfile(profile._id, profile.profileName)}>Delete</button>
                    {!profile.isRunning && (
                      <button className="p-2 bg-yellow-500 text-white rounded-md" onClick={() => launchProfile(profile.profileName)}>Launch</button>
                    )}
                    {profile.isRunning && (
                      <button className="p-2 bg-gray-500 text-white rounded-md" onClick={() => stopProfile(profile.profileName)}>Stop</button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
