import type { FaqItem } from "../../../Types/Faq";

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 1,
    question: "How can I apply for a program?",
    answer: [
      { text: "You can submit your application directly using the " },
      { text: "Request Admission Interview", bold: true },
      {
        text: " form below. Once reviewed, our admissions committee reaches out within 2 business days to schedule an interview with an academic lead.",
      },
    ],
  },
  {
    id: 2,
    question: "Are the programs online or offline?",
    answer: [
      { text: "All executive diplomas are delivered in an intensive " },
      { text: "blended executive format", bold: true },
      {
        text: ". Core architectural theory is accompanied by mandatory hands-on cohort sessions hosted physically at the ",
      },
      { text: "Alexandria Executive Campus (Gleem District)", bold: true },
      { text: " on evenings and weekends." },
    ],
  },
  {
    id: 3,
    question: "What are the admission requirements?",
    answer: [
      {
        text: "Most executive tracks require a minimum of 1–3 years of hands-on software, data, or product management background. Because seats are limited to a ",
      },
      { text: "1:12 mentor-to-learner ratio", bold: true },
      { text: ", selection evaluates prior experience and portfolio readiness." },
    ],
  },
  {
    id: 4,
    question: "Will I receive a certificate after completing a program?",
    answer: [
      { text: "Yes. Successful candidates receive a verified " },
      { text: "Dual Credential", bold: true },
      {
        text: ": an accredited Andalusia Academy Executive Diploma together with an internationally recognized ",
      },
      { text: "Pearson Assured & CPD Standards UK", bold: true },
      { text: " transcript badge." },
    ],
  },
  {
    id: 5,
    question: "How can I track my application status?",
    answer: [
      {
        text: "Upon submitting your application, you will receive an acknowledgment email with a tracking reference number. You may also contact our admissions desk via WhatsApp or email directly with your applicant reference ID.",
      },
    ],
  },
];

export { FAQ_ITEMS };
