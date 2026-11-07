import "./style.css";

function CatalogHero({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="catalog-hero_box-1">
      <span className="catalog-hero_text-1">{eyebrow}</span>
      <h1 className="catalog-hero_title-1">{title}</h1>
      <p className="catalog-hero_text-2">{text}</p>
    </div>
  );
}

export default CatalogHero;
