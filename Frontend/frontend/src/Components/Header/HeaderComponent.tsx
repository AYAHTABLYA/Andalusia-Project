import type { User } from "../../Types/User.ts";
import { GUEST_NAME } from "./constants.ts";
import "./style.css";

function HeaderComponent({ user, logout }: { user: User | null; logout: any }) {
  return (
    <div className="header">
      <div className="header_brand">
        <span className="header_logo">A</span>
        <div className="header_brand-text">
          <strong>Andalusia Academy</strong>
          <small lang="ar">أكاديمية أندلسية</small>
        </div>
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
