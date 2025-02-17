import AdminRoute from "../components/AdminRoute";

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
        <h1 className="text-3xl font-bold dark:text-white">Admin Dashboard</h1>
      </div>
    </AdminRoute>
  );
}
