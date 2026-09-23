import type { ReactNode } from "react";
import { PILLARS } from "./constants";
import "./style.css";

function AuthLayoutComponent({
  title,
  text,
  headerAction,
  children,
}: {
  title: string;
  text: string;
  headerAction: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="auth">
      <header className="auth_header">
        <div className="auth_brand">
          <span className="auth_logo">A</span>
          <div>
            <strong>Andalusia Academy</strong>
            <small lang="ar">أكاديمية أندلسية</small>
          </div>
        </div>
        <div className="auth_header_side">
          <span className="auth_phone">Support: +20 3 584-9020</span>
          {headerAction}
        </div>
      </header>

      <main className="auth_main">
        <section className="auth_aside">
          <h1>{title}</h1>
          <p className="auth_lead">{text}</p>
          <div className="auth_pillars">
            {PILLARS.map((p) => (
              <div className="auth_pillar" key={p.title}>
                <span className="material-symbols-outlined">{p.icon}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="auth_card">{children}</section>
      </main>
    </div>
  );
}

export default AuthLayoutComponent;
