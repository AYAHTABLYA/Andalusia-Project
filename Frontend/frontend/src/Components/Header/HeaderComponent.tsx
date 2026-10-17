import logo from "../../assets/andalusia-logo.png";
import type { User } from "../../Types/User.ts";
import { GUEST_NAME } from "./constants.ts";
import "./style.css";

function HeaderComponent({ user, logout }: { user: User | null; logout: any }) {
  return (
    <div className="header">
      <div className="header_brand">
        <img className="header_logo-img" src={logo} alt="Andalusia Academy" />
      </div>

      <div className="header_side">
        <h2>Hi {user ? `${user.name}` : `${GUEST_NAME}`}</h2>
        {user && (
          <div className="header_actions">
            <button onClick={logout}>Log out</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HeaderComponent;
