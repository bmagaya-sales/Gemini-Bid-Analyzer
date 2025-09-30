
export interface BidAnalysis {
  solicitationDetails: {
    title: string | null;
    agency: string | null;
    summary: string | null;
  };
  relevanceAnalysis: {
    isRelevant: boolean;
    reason: string;
  };
  keyRequirements: {
    eligibility: string[];
    objectives: string[];
    lineItems: {
      name: string;
      quantity: string | number | null;
      description: string | null;
      partNumber: string | null;
    }[];
    productFit: {
      type: 'brand_name_or_equal' | 'specific_brand' | 'unspecified';
      details: string;
      isCarriedBrand: boolean | null;
    };
  };
  submissionInstructions: {
    deadline: string | null;
    formattingAndDelivery: string[];
  };
  financials: {
    budgetRange: string | null;
    contractTerm: string | null;
  };
  contactAndCompliance: {
    pointOfContact: string | null;
    complianceRequirements: string[];
  };
  flags_for_human_review: string[];
}