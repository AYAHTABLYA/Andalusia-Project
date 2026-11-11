export interface BotStep {
  step: string;
  title: string;
}

export interface BotQuestion {
  id: number;
  question: string;
  answerPoints: string[];
  visualization?: { type: "stepper" | "timeline"; steps: BotStep[] };
  /** Internal route (starts with "/") opens inside the app; full URLs open in a new tab. */
  topicPath?: string;
  topicLabel?: string;
}

export interface BotTopic {
  id: string;
  title: string;
  badgeColor: string;
  questions: BotQuestion[];
}

export interface BotUi {
  back: string;
  close: string;
  open: string;
  closeBot: string;
  defaultLink: string;
}
