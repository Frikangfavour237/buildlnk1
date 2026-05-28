import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSegments } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";

type AppUser = {
  uid: string;
  email: string | null;
  role?: "worker" | "contractor";
  fullName?: string;
  name?: string;
  phone?: string;
  profileImageUrl?: string | null;
  blocked?: boolean;
};

type AuthContextValue = {
  currentUser: AppUser | null;
  loading: boolean;
  refreshCurrentUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const isAdminRoute = segments[0] === "admin";

  const buildUserFromDoc = (
    firebaseUser: {
      uid: string;
      email: string | null;
    },
    userData: {
      role?: "worker" | "contractor";
      fullName?: string;
      name?: string;
      phone?: string;
      profileImageUrl?: string | null;
      blocked?: boolean;
    } | undefined,
  ): AppUser => ({
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    role: userData?.role,
    fullName: userData?.fullName ?? userData?.name,
    name: userData?.name ?? userData?.fullName,
    phone: userData?.phone,
    profileImageUrl: userData?.profileImageUrl ?? null,
    blocked: userData?.blocked ?? false,
  });

  const refreshCurrentUser = async () => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      setCurrentUser(null);
      return;
    }

    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
    setCurrentUser(buildUserFromDoc(firebaseUser, userDoc.data()));
  };

  useEffect(() => {
    if (isAdminRoute) {
      setLoading(false);
      return;
    }

    let unsubscribeUser = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      unsubscribeUser();
      unsubscribeUser = () => {};

      if (!firebaseUser) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      unsubscribeUser = onSnapshot(doc(db, "users", firebaseUser.uid), (userDoc) => {
        if (!userDoc.exists() || userDoc.data()?.blocked) {
          setCurrentUser(null);
          setLoading(false);
          void signOut(auth);
          return;
        }

        setCurrentUser(buildUserFromDoc(firebaseUser, userDoc.data()));
        setLoading(false);
      });
    });

    return () => {
      unsubscribeUser();
      unsubscribeAuth();
    };
  }, [isAdminRoute]);

  const value = useMemo(
    () => ({ currentUser, loading, refreshCurrentUser }),
    [currentUser, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
