import type { Leak } from "../types";

export const LEAKS: Leak[] = [
  {
    id: "leak-001",
    title: "Corporate Data Breach Cover-up at TechCorp Industries",
    category: "Corporate Misconduct",
    date: "2024-03-15",
    summary: "Internal documents reveal that TechCorp Industries concealed a major data breach affecting 2.3 million users for over 6 months, while publicly denying any security incidents.",
    tags: ["data-breach", "cover-up", "privacy", "corporate-misconduct"],
    content: "Leaked internal emails and incident reports show that TechCorp Industries discovered a significant data breach in September 2023, compromising personal information including SSNs, addresses, and financial data of 2.3 million users. Despite immediate awareness of the breach, the company chose to suppress this information while continuing to assure customers that their data was secure. The leaked documents include:\n\n• Initial breach discovery reports from the security team\n• Executive decision emails to delay disclosure\n• Legal department memos discussing liability minimization\n• Technical forensics reports detailing the scope of compromise\n\nThe breach was caused by a SQL injection vulnerability in their customer portal that remained unpatched for months despite multiple security warnings from the development team.",
    proofAvailable: true,
    proofVerified: true,
    sourceEmail: "security.insider@protonmail.com",
    originalEmail: "noreply@techcorp.com",
    relatedDocuments: [
      { id: "doc-001", name: "breach_incident_report_sept2023.pdf" },
      { id: "doc-002", name: "executive_email_chain.eml" },
      { id: "doc-003", name: "legal_memo_disclosure_delay.docx" }
    ]
  },
  {
    id: "leak-002", 
    title: "Pharmaceutical Company Suppressed Safety Trial Results",
    category: "Healthcare",
    date: "2024-02-28",
    summary: "PharmaCure Labs deliberately omitted serious adverse effects from clinical trial data submitted to regulators for their new arthritis medication, affecting FDA approval process.",
    tags: ["pharmaceutical", "clinical-trials", "fda", "safety", "health"],
    content: "Confidential clinical trial data reveals that PharmaCure Labs systematically excluded reports of severe liver complications from their Phase III trial results for ArthriMax, their new arthritis medication. The suppressed data shows:\n\n• 47 cases of severe hepatotoxicity that were classified as 'unrelated to study drug'\n• Statistical manipulation to reduce reported adverse event rates\n• Pressure on clinical investigators to minimize safety concerns\n• Internal communications acknowledging the liver toxicity risk\n\nThe medication received FDA approval in January 2024 based on incomplete safety data. Post-market surveillance has since identified multiple cases of liver failure among patients taking ArthriMax, leading to an ongoing FDA investigation.",
    proofAvailable: true,
    proofVerified: true,
    sourceEmail: "clinical.researcher@securemail.org",
    originalEmail: "trials@pharmacure.com",
    relatedDocuments: [
      { id: "doc-004", name: "clinical_trial_raw_data.xlsx" },
      { id: "doc-005", name: "adverse_events_excluded.pdf" },
      { id: "doc-006", name: "internal_safety_memo.docx" }
    ]
  },
  {
    id: "leak-003",
    title: "Government Surveillance Program Targeting Climate Activists", 
    category: "Government Surveillance",
    date: "2024-01-20",
    summary: "Classified documents reveal a coordinated federal surveillance operation monitoring environmental activists and climate protest organizers across 15 states.",
    tags: ["surveillance", "climate-activists", "government", "privacy-rights", "protest"],
    content: "Leaked classified documents from multiple federal agencies expose 'Operation Green Watch' - a comprehensive surveillance program targeting climate activists, environmental lawyers, and protest organizers. The program includes:\n\n• Mass collection of social media data and communications\n• Infiltration of environmental organizations by undercover agents\n• Coordination between FBI, DHS, and local law enforcement\n• Creation of detailed profiles on over 10,000 activists\n• Use of facial recognition at climate protests and events\n\nThe documents show the program began in 2022 and expanded significantly following major climate protests. Legal experts argue the surveillance violates First Amendment rights and exceeds constitutional authority for domestic intelligence operations.",
    proofAvailable: true,
    proofVerified: true,
    sourceEmail: "concerned.agent@tutanota.com",
    originalEmail: "classified@dhs.gov",
    relatedDocuments: [
      { id: "doc-007", name: "operation_green_watch_overview.pdf" },
      { id: "doc-008", name: "target_list_activists.xlsx" },
      { id: "doc-009", name: "surveillance_protocols.docx" }
    ]
  },
  {
    id: "leak-004",
    title: "Financial Institution's Predatory Lending Practices",
    category: "Financial Crime",
    date: "2024-04-10", 
    summary: "Internal training materials and loan processing guidelines from MegaBank reveal systematic targeting of vulnerable communities with predatory loan products.",
    tags: ["predatory-lending", "financial-crime", "discrimination", "banking", "vulnerable-communities"],
    content: "Leaked internal documents from MegaBank expose a deliberate strategy to target low-income and minority communities with high-fee loan products while steering them away from better options. The evidence includes:\n\n• Training manuals instructing staff to promote high-fee products to specific demographic groups\n• Loan officer incentive structures rewarding predatory product sales\n• Geographic targeting maps highlighting vulnerable neighborhoods\n• Internal communications acknowledging the discriminatory nature of practices\n• Statistical analysis showing disproportionate impact on minority borrowers\n\nThe bank's 'Community Outreach' program was revealed to be a front for identifying and exploiting financially vulnerable populations. Despite public commitments to fair lending, internal metrics show the bank generated over $850 million in fees from these predatory practices in 2023.",
    proofAvailable: true,
    proofVerified: true,
    sourceEmail: "banking.insider@guerrillamail.com",
    originalEmail: "compliance@megabank.com",
    relatedDocuments: [
      { id: "doc-010", name: "predatory_lending_training.pdf" },
      { id: "doc-011", name: "targeting_demographics.xlsx" },
      { id: "doc-012", name: "fee_revenue_analysis.pdf" }
    ]
  },
  {
    id: "leak-005",
    title: "Defense Contractor's Faulty Equipment Cover-up",
    category: "Defense & Military",
    date: "2024-03-05",
    summary: "DefenseTech Corporation knowingly delivered defective body armor to military units while falsifying quality control reports and safety certifications.",
    tags: ["defense-contractor", "military-equipment", "safety", "fraud", "cover-up"],
    content: "Explosive leaked documents reveal that DefenseTech Corporation systematically delivered substandard body armor to military units while maintaining fraudulent quality control records. The cover-up includes:\n\n• Quality control tests showing 30% failure rate in ballistic protection\n• Falsified certification documents submitted to the Department of Defense\n• Executive decisions to ship defective equipment to meet contract deadlines\n• Suppression of field reports documenting armor failures in combat zones\n• Intimidation of quality control engineers who raised safety concerns\n\nThe defective armor affected over 15,000 military personnel deployed in active combat zones. Internal communications show executives were aware that the faulty equipment could result in serious injuries or deaths but chose to prioritize profits and contract obligations. Multiple military personnel have reportedly suffered preventable injuries due to armor failures.",
    proofAvailable: true,
    proofVerified: true,
    sourceEmail: "military.engineer@protonmail.com",
    originalEmail: "contracts@defensetech.mil",
    relatedDocuments: [
      { id: "doc-013", name: "ballistic_test_failures.pdf" },
      { id: "doc-014", name: "falsified_certifications.pdf" },
      { id: "doc-015", name: "executive_coverup_emails.eml" }
    ]
  }
];