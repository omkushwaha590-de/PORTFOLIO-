/** DMAIC (the Six Sigma improvement cycle) plus "Sustain", written as a working method. */
export const STEPS = [
  {
    name: 'Define',
    lead: 'Start with the customer, not the symptom.',
    body: 'Frame the problem in terms of what the customer or the next process experiences, agree the scope with stakeholders and set a target everyone can measure.',
    outputs: ['Problem statement', 'Voice of Customer', 'Project charter'],
  },
  {
    name: 'Measure',
    lead: 'Trust the data before using it.',
    body: 'Validate the measurement system first (MSA, calibration, inspection standards), then establish a clear baseline for defects, PPM and process capability.',
    outputs: ['MSA', 'Baseline PPM', 'Process capability'],
  },
  {
    name: 'Analyze',
    lead: 'Find the root cause, not a culprit.',
    body: 'Use 8D, QRQC, root-cause analysis and statistics to separate the few causes that matter from the many that do not, on the shop floor and at the supplier.',
    outputs: ['Root-cause analysis', '8D / QRQC', 'SPC studies'],
  },
  {
    name: 'Improve',
    lead: 'Design errors out of the process.',
    body: 'Implement corrective and preventive actions, error-proofing and digital tools, piloted with the people who do the work every day.',
    outputs: ['CAPA', 'Error-proofing', 'Kaizen'],
  },
  {
    name: 'Control',
    lead: 'Make the gain the new normal.',
    body: 'Lock improvements in with control plans, standard work, checklists and audits, tracked through KPIs and quality governance reviews.',
    outputs: ['Control plans', 'Standard work', 'Audits & KPIs'],
  },
  {
    name: 'Sustain',
    lead: 'Build a culture that keeps improving.',
    body: 'Mentoring, training and recognition turn one-off projects into habits, and connect quality with safety, cost and sustainability.',
    outputs: ['Training & mentoring', 'Quality culture', 'Business review'],
  },
] as const;
