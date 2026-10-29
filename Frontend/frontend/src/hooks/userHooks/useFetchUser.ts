import { useState, useEffect } from "react";
import type { User } from "../../Types/User.ts";

function useFetchUser() {
  const [user, setUser] = useState<User | null>(null);
  const userStored = localStorage.getItem("user");

  useEffect(() => {
    if (userStored) {
      const user = JSON.parse(userStored);
      setUser(user);
    }
  }, []);

  return { user, setUser };
}

export default useFetchUser;
