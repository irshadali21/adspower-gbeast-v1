import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function AdminRoute({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated" || (session && session.user.role !== "admin")) {
      router.push("/dashboard"); // Redirect non-admin users
    }
  }, [session, status]);

  if (status === "loading") return <p>Loading...</p>;

  return session?.user.role === "admin" ? children : null;
}
