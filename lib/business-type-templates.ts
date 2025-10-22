/**
 * Business Type Templates Mapping
 * Maps business types to their default staff positions and service categories
 */

export interface BusinessTypeTemplate {
  staff_position_templates: string[]
  service_category_templates: string[]
}

export const BUSINESS_TYPE_TEMPLATES: Record<string, BusinessTypeTemplate> = {
  // Beauty Salon / Salon Kecantikan
  "beauty_salon": {
    staff_position_templates: [
      "Beautician",
      "Makeup Artist",
      "Therapist",
      "Nail Technician",
      "Receptionist",
      "Manager"
    ],
    service_category_templates: [
      "facial_treatment",
      "body_treatment",
      "makeup",
      "manicure",
      "pedicure",
      "waxing",
      "eyelash_extensions"
    ]
  },

  // Hair Salon / Salon Rambut
  "hair_salon": {
    staff_position_templates: [
      "Junior Stylist",
      "Senior Stylist",
      "Colorist",
      "Hair Treatment Specialist",
      "Manager",
      "Receptionist"
    ],
    service_category_templates: [
      "hair_cut",
      "hair_color",
      "hair_treatment",
      "hair_styling",
      "hair_perm",
      "hair_rebonding",
      "hair_extension"
    ]
  },

  // Spa / Massage
  "spa": {
    staff_position_templates: [
      "Massage Therapist",
      "Spa Therapist",
      "Body Treatment Specialist",
      "Aromatherapist",
      "Manager",
      "Receptionist"
    ],
    service_category_templates: [
      "massage",
      "body_treatment",
      "body_scrub",
      "body_wrap",
      "aromatherapy",
      "hot_stone_therapy",
      "reflexology"
    ]
  },

  // Nail Salon / Nail Art
  "nail_salon": {
    staff_position_templates: [
      "Nail Technician",
      "Nail Artist",
      "Junior Nail Technician",
      "Senior Nail Technician",
      "Manager",
      "Receptionist"
    ],
    service_category_templates: [
      "manicure",
      "pedicure",
      "nail_art",
      "gel_nails",
      "acrylic_nails",
      "nail_extension",
      "nail_treatment"
    ]
  },

  // Barber Shop / Pangkas Rambut Pria
  "barber_shop": {
    staff_position_templates: [
      "Barber",
      "Senior Barber",
      "Junior Barber",
      "Beard Specialist",
      "Manager",
      "Receptionist"
    ],
    service_category_templates: [
      "haircut",
      "shaving",
      "beard_trim",
      "hair_styling",
      "hair_color",
      "scalp_treatment",
      "facial_grooming"
    ]
  },

  // Medical Spa / Klinik Kecantikan
  "medical_spa": {
    staff_position_templates: [
      "Dermatologist",
      "Beauty Doctor",
      "Aesthetic Nurse",
      "Laser Technician",
      "Therapist",
      "Manager",
      "Receptionist"
    ],
    service_category_templates: [
      "facial_treatment",
      "laser_treatment",
      "skin_rejuvenation",
      "chemical_peel",
      "microdermabrasion",
      "botox_filler",
      "acne_treatment",
      "skin_whitening"
    ]
  },

  // Aesthetic Clinic / Klinik Estetika
  "aesthetic_clinic": {
    staff_position_templates: [
      "Aesthetic Doctor",
      "Dermatologist",
      "Aesthetic Nurse",
      "Laser Specialist",
      "Consultant",
      "Manager",
      "Receptionist"
    ],
    service_category_templates: [
      "facial_aesthetic",
      "body_contouring",
      "laser_treatment",
      "injection_treatment",
      "thread_lift",
      "skin_tightening",
      "fat_reduction",
      "scar_treatment"
    ]
  },

  // Wellness Center / Pusat Kesehatan
  "wellness_center": {
    staff_position_templates: [
      "Wellness Consultant",
      "Massage Therapist",
      "Yoga Instructor",
      "Nutritionist",
      "Personal Trainer",
      "Manager",
      "Receptionist"
    ],
    service_category_templates: [
      "massage",
      "yoga_class",
      "fitness_training",
      "nutrition_consultation",
      "body_therapy",
      "meditation",
      "wellness_program"
    ]
  },

  // Makeup Studio / Studio Makeup
  "makeup_studio": {
    staff_position_templates: [
      "Makeup Artist",
      "Senior Makeup Artist",
      "Hair Stylist",
      "Bridal Specialist",
      "Manager",
      "Assistant"
    ],
    service_category_templates: [
      "party_makeup",
      "bridal_makeup",
      "photoshoot_makeup",
      "special_fx_makeup",
      "hair_styling",
      "makeup_class",
      "makeup_consultation"
    ]
  },

  // Tattoo & Piercing Studio
  "tattoo_studio": {
    staff_position_templates: [
      "Tattoo Artist",
      "Piercing Specialist",
      "Apprentice",
      "Manager",
      "Receptionist"
    ],
    service_category_templates: [
      "tattoo",
      "tattoo_removal",
      "piercing",
      "tattoo_touch_up",
      "tattoo_cover_up",
      "custom_design",
      "aftercare_consultation"
    ]
  },

  // Default / Other
  "other": {
    staff_position_templates: [
      "Therapist",
      "Beautician",
      "Specialist",
      "Manager",
      "Receptionist",
      "Assistant"
    ],
    service_category_templates: [
      "facial_treatment",
      "body_treatment",
      "massage",
      "hair_treatment",
      "nail_care",
      "consultation",
      "special_service"
    ]
  }
}

/**
 * Get templates for a specific business type
 */
export function getBusinessTypeTemplates(businessType: string): BusinessTypeTemplate {
  const templates = BUSINESS_TYPE_TEMPLATES[businessType.toLowerCase()]

  // Return the templates if found, otherwise return default "other" templates
  return templates || BUSINESS_TYPE_TEMPLATES["other"]
}

/**
 * Get all available business types
 */
export function getAvailableBusinessTypes(): string[] {
  return Object.keys(BUSINESS_TYPE_TEMPLATES).filter(key => key !== "other")
}

/**
 * Check if a business type exists in the mapping
 */
export function isValidBusinessType(businessType: string): boolean {
  return businessType.toLowerCase() in BUSINESS_TYPE_TEMPLATES
}
