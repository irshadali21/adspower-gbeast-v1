"use client"; // Required for Next.js 15+

import { useSession, signIn, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 shadow-md">
      <h1
        className="text-2xl font-bold dark:text-white cursor-pointer"
        onClick={() => router.push("/")}
      >
        Gmail & AdsPower Automation
      </h1>

      <div className="flex items-center space-x-4">
        {session ? (
          <>
            <p className="dark:text-white">
              Welcome, <span className="font-bold">{session.user.name}</span>
            </p>
            <button
              className="p-2 bg-blue-500 text-white rounded-md"
              onClick={() => router.push("/dashboard")}
            >
              Dashboard
            </button>
            <button
              className="p-2 bg-green-500 text-white rounded-md"
              onClick={() => router.push("/profiles")}
            >
              Browser Profiles
            </button>
            <button
              className="p-2 bg-red-500 text-white rounded-md"
              onClick={() => signOut()}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            {pathname !== "/login" && (
              <button
                className="p-2 bg-blue-500 text-white rounded-md"
                onClick={() => router.push("/login")}
              >
                Login
              </button>
            )}
            {pathname !== "/register" && (
              <button
                className="p-2 bg-green-500 text-white rounded-md"
                onClick={() => router.push("/register")}
              >
                Register
              </button>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
