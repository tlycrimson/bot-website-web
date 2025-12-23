import { useState, useEffect, useRef } from "react";

export default function RobloxAvatar({ userId, username, size = 40, className = "" }) {
  const [src, setSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    if (!userId) {
      setSrc(`https://via.placeholder.com/${size}?text=U`);
      setLoading(false);
      return;
    }

    const fetchAvatar = async () => {
      try {
        setLoading(true);
        setError(false);
        
        const response = await fetch(
          `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=${size}x${size}&format=Png&isCircular=true`
        );
        
        if (!response.ok) throw new Error("Failed to fetch avatar");
        
        const data = await response.json();
        
        if (isMounted.current && data?.data?.[0]?.imageUrl) {
          setSrc(data.data[0].imageUrl);
        } else {
          throw new Error("Invalid response data");
        }
      } catch (err) {
        if (isMounted.current) {
          setError(true);
          setSrc(`https://via.placeholder.com/${size}?text=${username?.[0]?.toUpperCase() || "U"}`);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchAvatar();

    return () => {
      isMounted.current = false;
    };
  }, [userId, username, size]);

  const placeholderText = username?.[0]?.toUpperCase() || "U";

  return (
    <div 
      className={`relative overflow-hidden bg-black/10 rounded-full ${className}`}
      style={{ width: size, height: size }}
      title={username || "Roblox User"}
    >
      {!loading && src && (
        <img
          src={src}
          alt={username ? `Avatar of ${username}` : "Roblox avatar"}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
          onError={(e) => {
            setError(true);
            e.currentTarget.src = `https://via.placeholder.com/${size}?text=${placeholderText}`;
          }}
        />
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div 
            className="border-2 border-t-red-500 border-white rounded-full animate-spin"
            style={{ width: size * 0.5, height: size * 0.5 }}
          ></div>
        </div>
      )}

      {error && !loading && (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 rounded-full">
          <span className="text-gray-700 font-semibold text-sm">
            {placeholderText}
          </span>
        </div>
      )}
    </div>
  );
}