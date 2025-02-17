// import { useSession, signOut } from "next-auth/react";
// import { useRouter } from "next/router";
// import { useEffect } from "react";

// export default function Dashboard() {
//   const { data: session, status } = useSession();
//   const router = useRouter();

//   useEffect(() => {
//     if (status === "unauthenticated") {
//       router.push("/login");
//     }
//   }, [status]);

//   if (status === "loading") return <p>Loading...</p>;

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
//       <h1 className="text-3xl font-bold dark:text-white">
//         Welcome, {session?.user?.email} ({session?.user?.role})
//       </h1>
//       <button onClick={() => signOut()} className="mt-4 p-2 bg-red-500 text-white rounded-md">
//         Logout
//       </button>
//       {session?.user?.role === "admin" && (
//         <button
//           onClick={() => router.push("/admin")}
//           className="mt-4 p-2 bg-blue-500 text-white rounded-md"
//         >
//           Go to Admin Panel
//         </button>
//       )}
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalProfiles: 0, userGrowth: [] });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`);
      setStats(res.data);
    } catch (error) {
      console.error("❌ Failed to fetch dashboard stats:", error);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-center dark:text-white">Dashboard</h1>

      <div className="grid grid-cols-2 gap-6 mt-8">
        {/* Total Users */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold dark:text-white">Total Users</h2>
          <p className="text-4xl font-bold text-blue-500">{stats.totalUsers}</p>
        </div>

        {/* Total Profiles */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-semibold dark:text-white">Total Profiles</h2>
          <p className="text-4xl font-bold text-green-500">{stats.totalProfiles}</p>
        </div>
      </div>

      {/* User Growth Graph */}
      <div className="bg-white dark:bg-gray-800 p-6 mt-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold dark:text-white text-center">User Growth</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#4A90E2" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 mt-8 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold dark:text-white text-center">Recent Browser Activity</h2>
        <ul className="mt-4">
          {stats?.recentActivity?.length > 0 ? (
            stats.recentActivity.map((activity, index) => (
              <li key={index} className="text-lg dark:text-white">
                <strong>{activity.profileName}</strong> - {activity.lastLaunched ? new Date(activity.lastLaunched).toLocaleString(): "No recent activity"}
              </li>
            ))
          ) : (
            <li className="text-lg dark:text-white">No recent activity found.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
