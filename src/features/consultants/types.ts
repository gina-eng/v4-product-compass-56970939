export interface Consultant {
  id: string;
  name: string;
  headline: string;
  city: string;
  state: string;
  email: string;
  linkedinUrl: string;
  photoUrl?: string;

  unit?: string;

  primarySector: string;
  secondarySector?: string;

  professionalProfile: string;
  painsTackled: string;
  valueAreas: string;
  highlightProjects: string;
  competencies: string;
  education: string;
  languages: string;
}
