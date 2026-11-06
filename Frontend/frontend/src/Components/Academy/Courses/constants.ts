import type { CatalogImage } from "../../../Types/CatalogImage";

const COURSES_PAGE_SIZE = 12;

const COURSE_IMAGES: CatalogImage[] = [
  { key: "generativeaiforbankingleaders", file: "generative-ai-banking-leaders.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtqqg6Y_nTlu49NgTKs4aY3C4wF--M_tFAWrLaJ2r-BXiScVvJ7mwQsmWD5b7EACZ4Ji4nG4J2meomVsjN0jIAjpFkA-z0iEWBote8zHecZZBcsaIk5ZafdOq-mt5WY7DAu_8ri23Epmg3hrHvtlHokSYk3E5MchBJ6m100lIgjvZwK9JZcMRbfl678k9D1ZRzlIfg2vxmF0FnML35IjKrerG6hAovSGbSynrHeA" },
  { key: "openbankingapis", file: "open-banking-apis.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuASWme6UNaAoT7bcZDKPVguv0-UE_L-I94uCoz_yNObE4CBhUm8YdNiyRRBjK-SPvr4cSLF5HySBo8jNgWmJiDor6P00qY9eKWHFOujHg-UGlzIyj-3Gidv0Ym-diJtr_N4tmzd3_y-yr9riRCEK7Qb2Nedtdd7W9q06ycavPvcx4itwNuV5xzDi0wF796PKYrxQ0KHEQuAkICkjfrEeLimzBlrTuJLNha_gnc6jQ" },
  { key: "paymentsfraudrisk", file: "payments-fraud-risk.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDbQgDqMIwdYZcarEf61f0y68dRaK24Tluva4o_hN8zuZtDhKRpMa0Do1vb032fyaHK1hPDBc1SMyNuBqBZXlP311Gb_eIZ4M6gjyWQQLGKXq4ny1pkBH-VjWgp5SZZGp6JcLlLy0INCnbSbSaVbtW5HA39k008My0dn1wnyh0GkiaFDjh8FlcUycNCGosBGlny4ZMUzWWIcyDPjQFyJSScEMClQ3aJVdjcFFjywQ" },
  { key: "cloudarchitecturefintech", file: "cloud-architecture-fintech.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuACuRXiKbHQ2k2A1Qywh5qxuX7mXiFQg_Az5bAp9WFNJsQ-tBJzUueIwo3mPIDcKWMoXq0ipj6-5MKBMbF17P9z9eSbOp75WZu8WxeSvX6_-fzil695GgG-hsJMBTx_XKwHNwy2FQY8HLvbFLQflafnPRrmkVik81d1HfJq7DGJgXrukGGccelyv03cs7dpjDXtkcg2hLbBB2xpFzAYwNNmXMcwkaN8Fm4LT5dg9g" },
  { key: "devsecops", file: "devsecops-regulated-systems.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCZHw2TDU9XLg7qyTB8iWnyctmcHgkcvw0Ada46HXBraM8KHF2EOGuxO3Rr6CK7QqhJsOoSZtIVr3my3O1pMpcGWrGDiSgfF0UBslUihAlEaKfIpwd3DBo7Ka9Uw7MMZ-lx_g7y4Mzj4ul3-IMxIxt7bWopZjDT9ykzS794WNfaIDY4WPH5QmN-gu-_MhV8Wx-rPNWxeM3BSiNKUK5yzmdsMOb-zzwx6viAA7AWw" },
  { key: "aistrategyforexecutives", file: "ai-strategy-executives.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBA0abE6GeFNinbdwvMa_VqI1eVM92dasxwdESUPotASkPabhq71iKEo2Y-4k0y10fup4p1hX_xw1NPAP1kuyHrVU9jjZEuwZoErQTAJKjsS_2_kvcxq3itRSBg92J3rpTcvUfMvZvWGNZrsGAQOnjI-fiIcn95zucJGZS8Ck5yX8d1sx4JbmnjvWHIFI-0kHxCRMxSAOUYuicV7YzLK12Ka-LTR0GFbNmYunLpvg" },
  { key: "responsibleai", file: "responsible-ai-governance.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9WllVrYrgYej2lh9a1YdN4WZfeqEBCX1JNjvvHB9AfyZ5tI-eszvqYWcEIwbs1tKHpX5XitHSSrU_cANlKCoAQrafe3WrH3xxhl6YgLb-Ed3ryYfuIedFrP2UDUwdERbI0FB1jtb4VjSBowPW-8sn7IBLndKNtiQbWw-WkGfcQhCUbdDx9CTOYLZI4IjpCcHgTVCCrTxOq9qKQGCz6N8p96-Gu2tzxLH_L6ISew" },
  { key: "productdiscovery", file: "product-discovery-bootcamp.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuACtbh3Dwz1CHOmIfYUqhJ00HLQ1dr6qeQkPS6THE-JZ6hG0a-Y5MGo0ygy_Ixur2fYNsLkQ3ji-RVdpsTbhx5Hyj4XlcusPDK8MGw0wEFDlGlB7uzIE1_yGka2ZugUnAltIF_k6vhHC4KWTmX-80Vt6L3ErRps6IUlPzf3T4sMaHd2c4VVtni18n2305ssygWg2-v8OlAf07zAoywA20HQ7OxdT35FRFBb_AoNNA" },
  { key: "agiledelivery", file: "agile-delivery-product-metrics.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCO7uSxY2o3hRRoa-Huv92Met9XQVTt23H7ygNp1rJDu8Itjhi2t2bB2ST3B7PwEZw-lEoHUHmZAPmz7Eb69J_5SH2UEhG70XPLoydz_W09Pj3aFfgHJ77Lvgjc4QIT13tXcweFU0Fz0HJ1g_u4BMTqXVq3EkZwWvBeiv2iA0qBoiUmzAIqjA3Nm878AFlnlMTLOShLaQgSaIY9ANIhIex-PyJ-04qr_wtl6rXYZg" },
  { key: "appliedllmstudio", file: "applied-llm-studio.jpg",
    url: "https://lh3.googleusercontent.com/aida-public/AB6AXuA2goGlhedT2u8Tk24_iUYMLk_9UAInxK5sbj7KcyJDetKdhcqReN53tmsVbKNwNFWanvlXYF8TQbS9ChCYxt_OLk369jXyBGh9OnLL0NatxgCa-aJXeCu4x729IN_BYBbpY7zbLN0BNLSQ4ANyuY4y9SDv-wf0QnMlkT3mc-u3LnoKqo7SJ385SQGnc3JaWwJqaMpFc-Lu7U5IiHxC8wp1AFfYgm0UhX3DD09KEA" },
];

export { COURSES_PAGE_SIZE, COURSE_IMAGES };
