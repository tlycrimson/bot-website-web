import { useEffect, useState } from "react";

export default function RobloxAvatar({ userId, username }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`)
      .then(res => res.json())
      .then(data => {
        const imageUrl = data.data?.[0]?.imageUrl;
        setUrl(imageUrl || null);
      })
      .catch(() => setUrl(null));
  }, [userId]);

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden mx-auto bg-white/10">
      {url ? (
        <img src={url} alt={username} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs text-black font-bold flex items-center justify-center h-full">U</span>
      )}
    </div>
  );
}
