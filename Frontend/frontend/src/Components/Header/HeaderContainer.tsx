import HeaderComponent from "./HeaderComponent";
import useFetchUser from "../../hooks/userHooks/useFetchUser.ts";

function HeaderContainer() {
  const { user, setUser } = useFetchUser();

  function logout() {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    setUser(null);
  }

  return (
    <div>
      <HeaderComponent user={user} logout={logout} />
    </div>
  );
}

export default HeaderContainer;
