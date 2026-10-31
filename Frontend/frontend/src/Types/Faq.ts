// A piece of an answer: bold parts are rendered inside <strong>.
type FaqAnswerPart = {
  text: string;
  bold?: boolean;
};

type FaqItem = {
  id: number;
  question: string;
  answer: FaqAnswerPart[];
};

export type { FaqItem, FaqAnswerPart };
