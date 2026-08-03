export type FieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'toggle'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'image'
  | 'rating'
  | 'scale'
  | 'heading'
  | 'paragraph'
  | 'divider';

export interface FieldValidation {
  min_length?: number;
  max_length?: number;
  min_value?: number;
  max_value?: number;
  pattern?: string;
  allowed_file_types?: string[];
  max_file_size_mb?: number;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  help_text?: string;
  required: boolean;
  order: number;
  options?: string[];
  validation?: FieldValidation;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: FormField[];
}

export interface FormSettings {
  allow_multiple_submissions: boolean;
  show_progress_bar: boolean;
  success_message: string;
  redirect_url?: string | null;
  close_date?: string | null;
  max_responses?: number | null;
}

export interface FormTheme {
  primary_color: string;
  background_color: string;
  font_family: string;
  logo_url?: string | null;
  border_radius: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  language: 'en' | 'ar' | 'fr' | 'es' | 'de' | string;
  sections: FormSection[];
  settings: FormSettings;
  theme: FormTheme;
}

export interface UserProfile {
  id: string;
  email: string;
  phone?: string | null;
  full_name: string;
  is_verified: boolean;
  is_active: boolean;
  is_admin: boolean;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface FormMetadata {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'closed';
  slug?: string;
  views: number;
  response_count?: number;
  created_at: string;
  updated_at: string;
}
