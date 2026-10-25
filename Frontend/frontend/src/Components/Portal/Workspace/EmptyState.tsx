type Props = { icon: string; title: string; text: string };

export default function EmptyState({ icon, title, text }: Props) {
  return (
    <div className="ws_empty">
      <span className="material-symbols-outlined">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
