import { useState, useEffect } from "react";
import type { User } from "../../types/User.ts";

function useFetchUser() {
  const [user, setUser] = useState<User | null>(null);
  const userStored = localStorage.getItem("user");

  useEffect(() => {
    if (userStored) {
      const user = JSON.parse(userStored);
      console.log(user);
      setUser(user);
    }
  }, []);

  return { user, setUser };
}

export default useFetchUser;
