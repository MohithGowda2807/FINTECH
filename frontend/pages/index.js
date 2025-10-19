import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background:
          "linear-gradient(135deg, #0D9488 0%, #06B6D4 50%, #0EA5E9 100%)",
        color: "white",
        fontFamily: "Space Grotesk, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "800",
            marginBottom: "16px",
            letterSpacing: "-0.5px",
          }}
        >
          Loading...
        </h1>
        <div
          style={{
            width: "60px",
            height: "60px",
            border: "4px solid rgba(255, 255, 255, 0.3)",
            borderTop: "4px solid white",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto",
          }}
        ></div>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
