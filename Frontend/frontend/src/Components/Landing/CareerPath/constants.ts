import type { CareerStep } from "../../../types/CareerStep";

const CAREER_STEPS: CareerStep[] = [
  {
    id: 1,
    order: "01",
    phase: "Foundation (Month 1-2)",
    title: "Data Engineering Core",
    description:
      "Distributed computing pipelines, scalable ETL with Apache Spark, and SQL database optimization for enterprise lakes.",
    footerLeft: "3 Offline Workshops",
    footerRight: "Passed Lab 1",
  },
  {
    id: 2,
    order: "02",
    phase: "Specialization (Month 3-4)",
    title: "Deep Learning & LLMs",
    description:
      "Transformer architectures, vector database retrieval augmented generation (RAG), and fine-tuning open weights.",
    footerLeft: "Alexandria GPU Cluster",
    footerRight: "Cohort Project",
  },
  {
    id: 3,
    order: "03",
    phase: "Production (Month 5)",
    title: "MLOps & Governance",
    description:
      "Continuous integration for models, automated drift detection, low-latency API serving, and EU/MENA AI compliance.",
    footerLeft: "Enterprise Sandbox",
    footerRight: "AWS Mapped",
  },
  {
    id: 4,
    order: "04",
    phase: "Capstone (Month 6)",
    title: "Executive Defense",
    description:
      "Defend an end-to-end proprietary enterprise platform prototype in front of our industry advisory council and investors.",
    footerLeft: "CPD Certificate",
    footerRight: "Job Placement",
    highlighted: true,
  },
];

export { CAREER_STEPS };
