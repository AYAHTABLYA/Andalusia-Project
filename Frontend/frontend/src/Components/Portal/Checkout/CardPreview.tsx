import { memo } from "react";
import { BRAND_LABEL, CARD_PLACEHOLDER } from "./constants";
import type { CardBrand, CardForm } from "../../../Types/Checkout";

type Props = { card: CardForm; brand: CardBrand };

// Live card visual that mirrors what the learner types.
function CardPreview({ card, brand }: Props) {
  return (
    <div className="checkout_card" aria-hidden="true">
      <div className="checkout_card-glow" />
      <div className="checkout_card-top">
        <div className="checkout_card-left">
          <div className="checkout_card-chip">
            <span />
          </div>
          <span className="material-symbols-outlined">contactless</span>
        </div>
        <span className="checkout_card-brand">{BRAND_LABEL[brand]}</span>
      </div>

      <span className="checkout_card-number">{card.number || CARD_PLACEHOLDER.number}</span>

      <div className="checkout_card-bottom">
        <div>
          <span className="checkout_card-label">Cardholder Name</span>
          <span className="checkout_card-name">
            {card.name.trim() ? card.name.toUpperCase() : CARD_PLACEHOLDER.name}
          </span>
        </div>
        <div className="checkout_card-expiry">
          <span className="checkout_card-label">Expires</span>
          <span className="checkout_card-name">{card.expiry || CARD_PLACEHOLDER.expiry}</span>
        </div>
      </div>
    </div>
  );
}

export default memo(CardPreview);
