import { useSession, signIn, signUp, signOut } from "@/lib/auth-client";

export function useAuth() {
  const session = useSession();

  return {
    user: session.data?.user ?? null,
    isLoading: session.isPending,
    isAuthenticated: !!session.data,
    signIn: (email: string, password: string) =>
      signIn.email({ email, password }),
    signUp: (name: string, email: string, password: string) =>
      signUp.email({ name, email, password }),
    signOut: () => signOut(),
  };
}
