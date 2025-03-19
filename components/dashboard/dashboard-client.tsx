"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import DashboardHome from "@/components/dashboard/dashboard-home";
import PostsList from "@/components/dashboard/posts-list";
import PostEditor from "@/components/dashboard/post-editor";
import NewPost from "@/components/dashboard/new-post";
import ProfileView from "@/components/dashboard/profile-view";
import ProfileEditor from "@/components/dashboard/profile-editor";
import NewProfile from "@/components/dashboard/new-profile";

export default function DashboardClient() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUser(session.user);
      setLoading(false);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.push("/");
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>Loading...</p>
      </div>
    );
  }

  // Client-side routing based on pathname
  if (!user) {
    return null;
  }

  console.log("Current pathname:", pathname); // Add this for debugging

  // Extract the path parts after /dashboard/
  const pathParts = pathname.split("/").slice(2);
  const section = pathParts[0] || "";
  const action = pathParts[1] || "";
  const id = pathParts[2] || "";

  console.log("Path parts:", { section, action, id }); // Add this for debugging

  // Render the appropriate component based on the path
  if (section === "profile") {
    if (action === "new") {
      return <NewProfile user={user} />;
    }
    if (action === "edit" && id) {
      return <ProfileEditor user={user} profileId={id} />;
    }
    return <ProfileView user={user} />;
  }

  if (section === "posts") {
    if (action === "new") {
      return <NewPost user={user} />;
    }
    if (action === "edit" && id) {
      return <PostEditor user={user} postId={id} />;
    }
    return <PostsList user={user} />;
  }

  // Default to dashboard home
  return <DashboardHome user={user} />;
}
