/**
 * Starter content taken from "YOGESH MODI - PROFESSIONAL PROFILE.pdf".
 * Everything here is editable later from the admin dashboard.
 * Deliberately excluded for privacy: phone number, home address, references.
 * Case-study fields the profile does not cover (problem, solution, detailed results) are left empty
 * so they can be written with real details rather than invented ones.
 */

export const settings = {
  siteName: 'Yogesh N Modi',
  tagline: 'Manufacturing Excellence, Quality Systems and Water Stewardship.',
  availability: { available: true, label: '' },
  profile: {
    name: 'Yogesh N Modi',
    role: 'Quality & Business Strategy Professional',
    headline: 'Where manufacturing quality meets sustainability and responsible growth.',
    intro:
      'Senior Quality Manager at Grundfos with 16+ years in industrial manufacturing. I build quality management systems, solve problems at the root cause, and connect operational results to business strategy.',
    about:
      'For me, quality is not limited to inspection or compliance. Over 16 years across industrial environments I have worked on the systems, processes, technologies and decisions that shape an organisation’s efficiency and competitiveness.\n\n' +
      'Since 2017 I have been with Grundfos Pumps India, part of the global Grundfos Group, leading manufacturing quality, supplier quality development, digitalisation and sustainability initiatives aligned with the company’s water and climate commitments.\n\n' +
      'I am currently completing the Executive Management Programme at IIM Indore, with a focus on strategic management, business analytics and economic value creation, so that engineering decisions and business decisions are made with the same rigour.',
    photoUrl: '/images/yogesh-modi.jpg',
    photoAlt: 'Portrait of Yogesh N Modi',
  },
  stats: [
    { value: '16+', label: 'Years in industrial manufacturing' },
    { value: '2,500+', label: 'Supplier PPM reduced' },
    { value: '3', label: 'ISO management systems certified' },
    { value: '3', label: 'Countries represented at international meetings' },
  ],
  contactEmail: 'yogeshgicf@gmail.com',
  location: 'Ahmedabad, Gujarat, India',
  socials: [{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/yogesh-modi-323a06274/' }],
};

export const projects = [
  {
    title: 'Supplier PPM Reduction Programme',
    category: 'Supplier Quality',
    shortDescription:
      'Reduced supplier parts-per-million defects by more than 2,500 through structured audits and capability-building.',
    fullDescription:
      'A supplier quality development programme combining structured supplier audits, capability enhancement and continuous quality improvement to reduce incoming defects and strengthen supply-chain performance.',
    technologies: ['Supplier Audits', 'Capability Building', 'Continuous Improvement', 'KPI Tracking'],
    client: 'Grundfos Pumps India',
    role: 'Senior Quality Manager',
    results: [{ label: 'Supplier PPM reduced', value: '2,500+' }],
    featured: true,
  },
  {
    title: 'CR Error-Proofing Application',
    category: 'Digital Solutions',
    shortDescription:
      'A digital error-proofing application that improved complaint-management accuracy, standardisation and data reliability.',
    fullDescription:
      'Developed and implemented an application to error-proof customer complaint (CR) handling — improving the accuracy of complaint management, standardising the process and making the underlying data more reliable.',
    technologies: ['Error-Proofing', 'Digitalisation', 'Complaint Management', 'Data Quality'],
    client: 'Grundfos Pumps India',
    role: 'Developer & process owner',
    featured: true,
  },
  {
    title: 'Smart Pick & Pack Digital Solution',
    category: 'Digital Solutions',
    shortDescription: 'A digital pick-and-pack solution for spare-kit operations that improved accuracy, traceability and efficiency.',
    fullDescription:
      'Developed a digital solution for spare-kit pick-and-pack operations to raise process accuracy, add traceability and improve operational efficiency.',
    technologies: ['Digitalisation', 'Traceability', 'Error-Proofing', 'Lean'],
    client: 'Grundfos Pumps India',
    role: 'Developer & process owner',
    featured: true,
  },
  {
    title: 'Six Sigma Black Belt: Nameplate Engraving Optimisation',
    category: 'Six Sigma',
    shortDescription: 'A Black Belt project that improved process capability and reduced variation in nameplate engraving.',
    fullDescription:
      'Completed as part of the ASQ Six Sigma Black Belt programme: a structured optimisation of the nameplate engraving process that improved process capability, reduced variation and enhanced production quality.',
    technologies: ['Six Sigma', 'Process Capability', 'Variation Reduction', 'Statistical Analysis'],
    client: 'Grundfos Pumps India',
    role: 'Black Belt project lead',
    featured: true,
  },
  {
    title: 'Integrated Management System Certification',
    category: 'Quality Systems',
    shortDescription: 'Led external SGS audits to maintain ISO 9001, ISO 14001 and ISO 45001 certification.',
    fullDescription:
      'Led the external SGS Integrated Management System audits, ensuring continued certification and compliance across quality (ISO 9001), environmental (ISO 14001) and occupational health & safety (ISO 45001) management.',
    technologies: ['ISO 9001', 'ISO 14001', 'ISO 45001', 'Audit Management'],
    client: 'Grundfos Pumps India',
    role: 'Audit lead',
    results: [{ label: 'Standards certified', value: '3' }],
    featured: false,
  },
  {
    title: 'Hydro Area Inspection Checklist',
    category: 'Quality Systems',
    shortDescription: 'Standardised inspection practices across operations for more consistent results.',
    fullDescription:
      'Designed and implemented an inspection checklist for the Hydro area, establishing standardised inspection practices and improving inspection consistency across operations.',
    technologies: ['Standard Work', 'Inspection', 'Quality Control'],
    client: 'Grundfos Pumps India',
    role: 'Designer & implementer',
    featured: false,
  },
  {
    title: 'Energy & Water Reduction Kaizens',
    category: 'Sustainability',
    shortDescription: 'Kaizen projects contributing to organisational energy-conservation and water-reduction goals.',
    fullDescription:
      'Contributed to organisational energy-conservation and water-reduction initiatives through Kaizen projects aligned with sustainability and resource-efficiency objectives.',
    technologies: ['Kaizen', 'Resource Efficiency', 'Sustainability'],
    client: 'Grundfos Pumps India',
    role: 'Contributor',
    featured: false,
  },
];

export const services = [
  {
    title: 'Quality Management Systems',
    icon: 'shield-check',
    shortDescription: 'Manufacturing quality from incoming inspection to customer performance, certified to ISO 9001, 14001 and 45001.',
    description:
      'Leading quality across incoming quality assurance, in-process controls, final verification and customer quality, and leading the external SGS audits for the integrated management system.',
    features: ['ISO 9001 / 14001 / 45001', 'Process & product audits', 'Customer & warranty quality', 'Quality KPIs & governance'],
  },
  {
    title: 'Business Strategy & Value Creation',
    icon: 'gauge',
    shortDescription: 'Connecting quality and operations decisions to competitiveness, cost and growth.',
    description:
      'Framing quality and operational improvements in business terms: productivity, competitiveness and economic value. Strengthened through the IIM Indore Executive Management Programme in strategic management and business analytics.',
    features: ['Strategic management', 'Business analytics', 'Performance KPIs', 'Economic value creation'],
  },
  {
    title: 'Supplier Quality Development',
    icon: 'handshake',
    shortDescription: 'Supplier capability building, risk reduction and measurable PPM improvement.',
    description:
      'Structured supplier audits, capability programmes and process-compliance work that reduce risk and build a resilient supply chain.',
    features: ['Supplier audits', 'Capability programmes', 'PPM reduction', 'Risk mitigation'],
  },
  {
    title: 'Problem Solving & Six Sigma',
    icon: 'target',
    shortDescription: 'Root-cause problem solving with Six Sigma, 8D and QRQC.',
    description:
      'Structured, data-driven problem solving that finds the real cause, fixes it permanently and prevents recurrence.',
    features: ['Six Sigma Black Belt (ASQ)', '8D & QRQC', 'Root-cause analysis', 'Corrective & preventive action'],
  },
  {
    title: 'Digitalisation & Operational Excellence',
    icon: 'workflow',
    shortDescription: 'Lean, Kaizen and in-house digital tools that remove errors from everyday work.',
    description:
      'Continuous improvement through Lean and Kaizen, combined with practical digital solutions such as the CR Error-Proofing Application and the Smart Pick & Pack system.',
    features: ['Error-proofing', 'Process digitalisation', 'Lean & Kaizen', 'Traceability'],
  },
  {
    title: 'Sustainability & Water Stewardship',
    icon: 'droplets',
    shortDescription: 'Resource efficiency, responsible manufacturing and community impact.',
    description:
      'Energy and water reduction projects, responsible manufacturing practices and membership of the Grundfos India CSR Committee.',
    features: ['Water stewardship', 'Energy & water reduction', 'CSR governance', 'Community engagement'],
  },
];

export const skills: { name: string; category: string }[] = [
  ...['Six Sigma', 'Lean Manufacturing', '8D', 'QRQC', 'Root Cause Analysis', 'Kaizen', 'TPM', 'SPC', 'MSA'].map((name) => ({
    name,
    category: 'Methodologies',
  })),
  ...['ISO 9001', 'ISO 14001', 'ISO 45001'].map((name) => ({ name, category: 'Standards' })),
  ...['CMM', 'Dimensional Metrology', 'Calibration', 'Performance Analytics'].map((name) => ({ name, category: 'Tools & Analytics' })),
  ...[
    'Supplier Development',
    'Warranty Management',
    'Voice of Customer',
    'Risk Management',
    'Stakeholder Management',
    'Cross-functional Leadership',
  ].map((name) => ({ name, category: 'Leadership & Management' })),
  ...['English', 'Hindi', 'Gujarati'].map((name) => ({ name, category: 'Languages' })),
];

type Kind = 'work' | 'education' | 'certification' | 'recognition' | 'international';
interface ExperienceSeed {
  kind: Kind;
  title: string;
  organization?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  summary?: string;
  highlights?: string[];
}

export const experience: ExperienceSeed[] = [
  {
    kind: 'work',
    title: 'Senior Quality Manager — Manufacturing Quality & Operational Excellence',
    organization: 'Grundfos Pumps India Pvt. Ltd.',
    location: 'Gandhinagar, Gujarat',
    startDate: 'Feb 2017',
    current: true,
    summary:
      'Quality leadership, risk mitigation, continuous improvement and responsible manufacturing within the global Grundfos organisation. Member of the Grundfos India CSR Committee.',
    highlights: [
      'Lead manufacturing quality systems across incoming, in-process, final and customer quality',
      'Drive supplier quality development focused on capability, risk reduction and compliance',
      'Champion Six Sigma, QRQC, 8D and root-cause analysis',
      'Facilitate cross-functional quality governance and continuous-improvement reviews',
    ],
  },
  {
    kind: 'work',
    title: 'Quality Engineer',
    organization: 'JBM Auto Systems Pvt. Ltd. (Ford Supplier Park)',
    location: 'Ahmedabad',
    startDate: 'Aug 2014',
    endDate: 'Feb 2017',
    summary: 'Quality assurance for components supplied to Ford global manufacturing facilities.',
    highlights: [
      'Led dimensional inspection, metrology, calibration and new-product measurement validation',
      'Received the Zero Rejection Award and the Drawing Competition Award',
      'Completed advanced CMM and Measurement System Analysis (MSA) training',
    ],
  },
  {
    kind: 'work',
    title: 'Quality Assurance Engineer',
    organization: 'Harsha Engineers Ltd.',
    startDate: 'Jun 2010',
    endDate: 'Jul 2014',
    summary: 'Quality assurance and process control for precision bearing-cage manufacturing.',
    highlights: [
      'Product audits, process audits, SPC studies and non-conformance investigations',
      'Supported production for global OEMs including SKF, Timken and FAG Bearings',
      'Contributed to TPM and continuous-improvement initiatives',
    ],
  },

  {
    kind: 'education',
    title: 'Executive Management Programme (Master of Management Studies)',
    organization: 'Indian Institute of Management Indore',
    startDate: '2025',
    endDate: '2027',
    current: true,
    summary: 'Strategic management, business analytics, leadership, innovation and economic value creation.',
  },
  {
    kind: 'education',
    title: 'Bachelor of Engineering — Mechanical Engineering',
    organization: 'Agnos College of Technology, RKDF University, Bhopal',
    endDate: '2020',
  },
  { kind: 'education', title: 'Diploma in Mechanical Engineering', organization: 'K.C.T. Polytechnic', endDate: '2010' },

  { kind: 'certification', title: 'Six Sigma Black Belt', organization: 'American Society for Quality (ASQ)' },
  { kind: 'certification', title: 'Lead Auditor — ISO 9001, ISO 14001 & ISO 45001', organization: 'SGS' },
  { kind: 'certification', title: 'Training Within Industry — Job Relations', organization: 'TWI' },
  { kind: 'certification', title: 'Member', organization: 'American Society for Quality (ASQ)' },

  { kind: 'recognition', title: 'RNK Scholarship', summary: 'Awarded on completing the ASQ Six Sigma Black Belt programme.' },
  { kind: 'recognition', title: 'Zero Rejection Award', organization: 'JBM Auto Systems' },
  { kind: 'recognition', title: 'Drawing Competition Award', organization: 'JBM Auto Systems' },
  {
    kind: 'recognition',
    title: 'Safety & engagement recognitions',
    organization: 'Grundfos',
    summary: 'Internal recognitions including the Safety Walk, Mime Video and Near-Miss competitions.',
  },

  {
    kind: 'international',
    title: 'APAC Regional EHS Meeting',
    organization: 'Grundfos',
    location: 'Taiwan',
    endDate: '2018',
    summary: 'Represented Grundfos India, collaborating with regional leaders on safety, sustainability and operational excellence.',
  },
  {
    kind: 'international',
    title: 'Grundfos Olympics',
    organization: 'Grundfos',
    location: 'Denmark',
    endDate: '2019 & 2023',
    summary: 'Exchanged best practices, innovation ideas and cross-cultural experience with international colleagues.',
  },
  {
    kind: 'international',
    title: 'CR Continuous Process Improvement Meeting',
    organization: 'Grundfos',
    location: 'China',
    endDate: '2025',
    summary: 'Contributed to cross-regional discussions on manufacturing excellence and quality improvement.',
  },
];
