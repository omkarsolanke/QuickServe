import { useEffect, useState } from "react";

export default function useMapmyIndia() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let timer;

    const check = () => {
      if (window.MapmyIndia && window.MapmyIndia.Map) {
        setReady(true);
      } else {
        timer = setTimeout(check, 300);
      }
    };

    check();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  return ready;
}
