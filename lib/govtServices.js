// Hardcoded reference data for common Indian government services.
// Used both as the fallback source of truth (when Groq is unavailable)
// and as grounding context sent to the AI model for accurate answers.

const govtServices = [
  {
    name: 'Aadhaar Card',
    authority: 'Unique Identification Authority of India (UIDAI)',
    requiredDocs: ['Proof of Identity (e.g. PAN, Passport)', 'Proof of Address (e.g. utility bill)', 'Proof of Date of Birth', 'Passport-size photograph'],
    processSteps: [
      'Book an appointment online or visit a nearby Aadhaar Enrolment Centre',
      'Fill the enrolment form with personal details',
      'Provide biometrics (fingerprints, iris scan, photograph)',
      'Collect the acknowledgement slip with enrolment ID',
      'Track status online and download e-Aadhaar once generated',
    ],
    portalUrl: 'https://uidai.gov.in',
  },
  {
    name: 'PAN Card',
    authority: 'Income Tax Department (via NSDL/UTIITSL)',
    requiredDocs: ['Proof of Identity', 'Proof of Address', 'Proof of Date of Birth', 'Passport-size photograph'],
    processSteps: [
      'Apply online via the NSDL or UTIITSL portal (Form 49A for residents)',
      'Fill personal and contact details, upload documents',
      'Pay the applicable fee online',
      'e-Sign or send physical acknowledgement if required',
      'Track application using the acknowledgement number',
    ],
    portalUrl: 'https://www.onlineservices.nsdl.com',
  },
  {
    name: 'Voter ID Card',
    authority: 'Election Commission of India (ECI)',
    requiredDocs: ['Proof of Age (10th certificate/birth certificate)', 'Proof of Address', 'Passport-size photograph'],
    processSteps: [
      'Register on the National Voters\' Service Portal (NVSP) or Voter Helpline app',
      'Fill Form 6 for new registration',
      'Upload required documents and photograph',
      'Booth Level Officer (BLO) verification of address',
      'Voter ID card issued and delivered after approval',
    ],
    portalUrl: 'https://voters.eci.gov.in',
  },
  {
    name: 'Ration Card',
    authority: 'State Food & Civil Supplies Department',
    requiredDocs: ['Proof of Address', 'Proof of Identity', 'Family photograph', 'Income certificate (for certain categories)'],
    processSteps: [
      'Apply through the state\'s food & civil supplies department portal or common service centre',
      'Fill the application form with family details',
      'Submit required documents',
      'Field verification by local officials',
      'Ration card issued and linked to Public Distribution System (PDS)',
    ],
    portalUrl: 'https://nfsa.gov.in',
  },
  {
    name: 'Passport',
    authority: 'Ministry of External Affairs (Passport Seva)',
    requiredDocs: ['Proof of Address', 'Proof of Date of Birth', 'Passport-size photographs', 'Aadhaar card'],
    processSteps: [
      'Register on the Passport Seva Online Portal',
      'Fill the application form and pay the fee online',
      'Book an appointment at the nearest Passport Seva Kendra (PSK)',
      'Visit PSK for document verification and biometrics',
      'Police verification (if required) followed by dispatch of passport',
    ],
    portalUrl: 'https://www.passportindia.gov.in',
  },
  {
    name: 'Driving License',
    authority: 'State Transport Department (via Parivahan)',
    requiredDocs: ['Proof of Age', 'Proof of Address', 'Learner\'s License', 'Passport-size photograph'],
    processSteps: [
      'Apply for a Learner\'s License (LL) online via the Parivahan portal',
      'Pass the online learner\'s test',
      'Practice driving for the mandatory period',
      'Book a slot for the driving test at the RTO',
      'Pass the driving test to receive the permanent Driving License',
    ],
    portalUrl: 'https://parivahan.gov.in',
  },
  {
    name: 'Birth Certificate',
    authority: 'Municipal Corporation / State Registrar of Births & Deaths',
    requiredDocs: ['Hospital birth proof/discharge summary', 'Parents\' ID proof', 'Address proof'],
    processSteps: [
      'Register the birth with the local municipal office within 21 days (hospitals often do this automatically)',
      'Submit the birth report form with hospital and parent details',
      'Pay a nominal fee if applying after the free registration window',
      'Verification by the registrar\'s office',
      'Collect the certificate online or from the municipal office',
    ],
    portalUrl: 'https://crsorgi.gov.in',
  },
  {
    name: 'Death Certificate',
    authority: 'Municipal Corporation / State Registrar of Births & Deaths',
    requiredDocs: ['Hospital death proof/medical certificate of cause of death', 'ID proof of deceased', 'Applicant\'s ID proof'],
    processSteps: [
      'Report the death to the local municipal office within 21 days',
      'Submit the death report form along with medical certification',
      'Pay a nominal fee if applying after the free registration window',
      'Verification by the registrar\'s office',
      'Collect the certificate online or from the municipal office',
    ],
    portalUrl: 'https://crsorgi.gov.in',
  },
  {
    name: 'Income Certificate',
    authority: 'State Revenue Department (Tehsildar/SDM office)',
    requiredDocs: ['Proof of Address', 'Proof of Identity', 'Salary slips or income proof', 'Self-declaration form'],
    processSteps: [
      'Apply online via the state e-district portal or visit the Tehsil office',
      'Fill in income details and family information',
      'Submit supporting income documents',
      'Verification by the local revenue officer/patwari',
      'Certificate issued digitally or physically after approval',
    ],
    portalUrl: 'https://edistrict.gov.in',
  },
  {
    name: 'Caste Certificate',
    authority: 'State Revenue Department (Tehsildar/SDM office)',
    requiredDocs: ['Proof of Address', 'Proof of Identity', 'Family caste/community proof', 'Self-declaration form'],
    processSteps: [
      'Apply online via the state e-district portal or visit the Tehsil office',
      'Fill in caste and family details',
      'Submit supporting documents proving community status',
      'Field/records verification by revenue officials',
      'Certificate issued digitally or physically after approval',
    ],
    portalUrl: 'https://edistrict.gov.in',
  },
  {
    name: 'Property Tax',
    authority: 'Municipal Corporation / Local Urban Body',
    requiredDocs: ['Property ID/Khata number', 'Previous tax receipt', 'Proof of ownership'],
    processSteps: [
      'Visit the municipal corporation\'s property tax portal',
      'Enter property ID or search by owner name/address',
      'Verify assessed property details and outstanding dues',
      'Pay online via net banking, card, or UPI',
      'Download the payment receipt for records',
    ],
    portalUrl: 'https://www.mygov.in',
  },
  {
    name: 'Water Connection',
    authority: 'Municipal Water Supply & Sewerage Board',
    requiredDocs: ['Proof of Address', 'Property ownership/rental proof', 'ID proof of applicant'],
    processSteps: [
      'Apply online via the local water board portal or municipal office',
      'Fill the new connection application with property details',
      'Pay the applicable connection and security deposit fees',
      'Site inspection by water board officials',
      'Connection installed and meter activated',
    ],
    portalUrl: 'https://www.mygov.in',
  },
  {
    name: 'Domicile Certificate',
    authority: 'State Revenue Department (Tehsildar/SDM office)',
    requiredDocs: ['Proof of Address (long-term residence)', 'Proof of Identity', 'School leaving certificate (if applicable)'],
    processSteps: [
      'Apply online via the state e-district portal or visit the Tehsil office',
      'Fill in residence history and personal details',
      'Submit supporting residence proof documents',
      'Verification by local revenue officials',
      'Certificate issued digitally or physically after approval',
    ],
    portalUrl: 'https://edistrict.gov.in',
  },
  {
    name: 'Senior Citizen Card',
    authority: 'State Social Welfare Department',
    requiredDocs: ['Proof of Age (60+ years)', 'Proof of Address', 'Passport-size photograph'],
    processSteps: [
      'Apply online via the state social welfare portal or at the district social welfare office',
      'Fill in the application with age and address proof',
      'Submit documents for verification',
      'Verification by welfare department officials',
      'Card issued, enabling access to senior citizen benefits and concessions',
    ],
    portalUrl: 'https://www.mygov.in',
  },
  {
    name: 'Disability Certificate',
    authority: 'State Medical Board / District Hospital',
    requiredDocs: ['Medical assessment reports', 'Proof of Identity', 'Passport-size photograph'],
    processSteps: [
      'Register on the state\'s disability certificate portal or visit the district hospital',
      'Book an appointment with the medical assessment board',
      'Undergo medical examination to assess percentage of disability',
      'Board reviews and approves the assessment',
      'Certificate and Unique Disability ID (UDID) card issued',
    ],
    portalUrl: 'https://www.swavlambancard.gov.in',
  },
];

export default govtServices;

/**
 * Simple keyword matcher: finds the govt service whose name (or related
 * keywords) best matches the user's free-text query. Pure JS, no AI —
 * used both to build AI context and as the zero-dependency fallback path.
 */
export function findMatchingService(query) {
  if (!query) return null;
  const q = query.toLowerCase();

  const keywordMap = {
    'aadhaar card': ['aadhaar', 'aadhar', 'uid', 'uidai'],
    'pan card': ['pan card', 'pan number', 'income tax card'],
    'voter id card': ['voter', 'voting', 'election card', 'epic'],
    'ration card': ['ration', 'pds', 'food card'],
    'passport': ['passport', 'visa travel document'],
    'driving license': ['driving license', 'driving licence', 'dl', 'learner license', 'learner licence'],
    'birth certificate': ['birth certificate', 'birth cert'],
    'death certificate': ['death certificate', 'death cert'],
    'income certificate': ['income certificate', 'income proof cert'],
    'caste certificate': ['caste certificate', 'caste cert', 'community certificate'],
    'property tax': ['property tax', 'house tax', 'khata'],
    'water connection': ['water connection', 'water supply connection', 'new water'],
    'domicile certificate': ['domicile', 'residence certificate'],
    'senior citizen card': ['senior citizen', 'old age card'],
    'disability certificate': ['disability certificate', 'udid', 'handicap certificate'],
  };

  for (const service of govtServices) {
    const key = service.name.toLowerCase();
    const keywords = keywordMap[key] || [key];
    if (keywords.some((kw) => q.includes(kw))) {
      return service;
    }
  }
  return null;
}
