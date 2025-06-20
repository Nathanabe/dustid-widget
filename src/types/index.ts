export interface Contact {
  id: number;
  name: string;
  avatar: string;
  date?: string;
}

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  digits: number;
}

export type Stage =
  | "banner"
  | "signup"
  | "otp"
  | "welcome"
  | "contactSelected"
  | "shopping";

export interface DustidWidgetProps {
  userName?: string;
}

export interface StageProps {
  onNext?: () => void;
  onBack?: () => void;
  onClose?: () => void;
  data?: any;
  onDataChange?: (data: any) => void;
}
