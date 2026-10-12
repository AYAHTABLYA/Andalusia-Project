import { Link } from "react-router-dom";
import "./style.css";

type Crumb = { label: string; to?: string };

function Breadcrumb({ items, bar = false }: { items: Crumb[]; bar?: boolean }) {
  const nav = (
    <nav className={`breadcrumb${bar ? " breadcrumb--bar" : ""}`} aria-label="Breadcrumb">
      <Link to="/" className="breadcrumb_home">
        <span className="material-symbols-outlined">arrow_back</span>
        Back to Home
      </Link>
      <ol className="breadcrumb_list">
        {items.map((c, i) => (
          <li key={c.label} className="breadcrumb_item">
            {i > 0 && <span>/</span>}
            {c.to ? <Link to={c.to}>{c.label}</Link> : <span className="breadcrumb_current" aria-current="page">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
  return bar ? <div className="breadcrumb_bar">{nav}</div> : nav;
}

export default Breadcrumb;
