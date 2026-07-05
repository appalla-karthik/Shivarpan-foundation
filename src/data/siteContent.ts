export interface HomeHeroContent {
  badge: string;
  title: string;
  description: string;
}

export interface AboutContent {
  footerSummary: string;
  homepageSummary: string;
  highlights: string[];
  heroSubtitle: string;
  introParagraphs: string[];
  mission: string;
  vision: string;
  quickAccessDescription: string;
}

export interface OrganizationIdentifier {
  label: string;
  value: string;
}

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalDocument {
  title: string;
  subtitle: string;
  lastUpdated: string;
  intro: string[];
  sections: LegalSection[];
}

export const homeHeroContent: HomeHeroContent = {
  badge: "Shivarpan Charitable Foundation",
  title: "Driven by Compassion, Committed to Change",
  description:
    "Shivarpan Charitable Foundation was established in 2025 with a simple yet powerful purpose - to create meaningful change in the lives of underserved communities. Recognizing the challenges faced by vulnerable populations, the foundation works to address critical needs through initiatives in education, healthcare, and social support. Driven by compassion and a strong sense of responsibility toward society, the organization strives to provide individuals with the resources, guidance, and opportunities they need to build better futures. Through collective efforts, partnerships, and community engagement, Shivarpan Charitable Foundation aims to create sustainable solutions that uplift lives and strengthen communities.",
};

export const aboutContent: AboutContent = {
  footerSummary:
    "Shivarpan Charitable Foundation is a purpose-driven non-profit advancing education, care, and community wellbeing through transparent partnerships and measurable grassroots impact.",
  homepageSummary:
    "Shivarpan Charitable Foundation is a purpose-driven non-profit organization dedicated to addressing social challenges through impactful community initiatives. Our work combines grassroots action, structured programs, and responsible execution to create measurable change for underserved communities.",
  highlights: [
    "Programs focused on education, food distribution, elderly support, disability assistance, and animal welfare.",
    "Partnership-led execution with corporates, CSR initiatives, donors, volunteers, and social impact collaborators.",
    "Transparent, accountable delivery designed to expand outreach while keeping impact measurable.",
  ],
  heroSubtitle:
    "A purpose-driven non-profit building inclusive community development through education, care, partnerships, and measurable grassroots action.",
  introParagraphs: [
    "Shivarpan Charitable Foundation is a purpose-driven non-profit organization dedicated to addressing social challenges through impactful community initiatives. Our work focuses on critical areas such as education for underprivileged children, food distribution for the needy, elderly support, disability assistance, and animal welfare.",
    "We believe that sustainable social change is possible when communities, organizations, and individuals work together. The foundation actively seeks partnerships with corporate organizations, CSR initiatives, and social impact collaborators who share the vision of creating inclusive growth and community development.",
    "By implementing structured programs and grassroots initiatives, Shivarpan Charitable Foundation aims to deliver measurable impact while maintaining transparency and accountability in its work. Through meaningful collaborations with corporates, volunteers, and donors, the foundation strives to expand its outreach and strengthen its mission of building a compassionate and equitable society.",
  ],
  mission:
    "To uplift underserved communities through impactful education, healthcare, and social welfare programs, empowering individuals and creating sustainable change that leads to stronger and more resilient communities.",
  vision:
    "To build a world where every individual has equal access to opportunities, resources, and support, enabling them to live with dignity and achieve their full potential regardless of their background or circumstances.",
  quickAccessDescription:
    "Purpose-driven programs, trusted partnerships, and measurable community impact.",
};

export const organizationIdentifiers: OrganizationIdentifier[] = [
  {
    label: "CIN No.",
    value: "U85499GJ2025NPL157634",
  },
  {
    label: "PAN No.",
    value: "ABOCS9547E",
  },
];

export const privacyPolicyContent: LegalDocument = {
  title: "Privacy Policy",
  subtitle:
    "How Shivarpan Charitable Foundation collects, uses, protects, and manages personal information shared through this website.",
  lastUpdated: "March 2026",
  intro: [
    "Shivarpan Charitable Foundation values the privacy and trust of all visitors, donors, volunteers, and supporters who interact with our website. This Privacy Policy explains how we collect, use, protect, and manage personal information shared with us through our website.",
    "By using this website, you agree to the practices described in this Privacy Policy.",
  ],
  sections: [
    {
      heading: "Information We Collect",
      paragraphs: [
        "When you visit our website, contact us, or engage with our programs, we may collect certain information including:",
        "This information helps us improve our services and communicate effectively with our supporters.",
      ],
      bullets: [
        "Personal details such as name, email address, phone number, or mailing address.",
        "Information provided when making donations, volunteering, or submitting inquiries.",
        "Non-personal information such as browser type, IP address, and website usage data.",
      ],
    },
    {
      heading: "How We Use Your Information",
      paragraphs: [
        "The information collected may be used for the following purposes:",
        "We ensure that personal information is used responsibly and only for purposes related to the activities of the foundation.",
      ],
      bullets: [
        "To respond to inquiries or requests.",
        "To process donations and provide receipts.",
        "To share updates about our programs, activities, and impact.",
        "To improve the functionality and user experience of our website.",
        "To maintain transparency and communication with donors, volunteers, and supporters.",
      ],
    },
    {
      heading: "Protection of Information",
      paragraphs: [
        "Shivarpan Charitable Foundation is committed to protecting your personal information. We implement reasonable security measures to safeguard data from unauthorized access, misuse, or disclosure.",
        "While we take appropriate precautions, no online system can guarantee absolute security.",
      ],
    },
    {
      heading: "Sharing of Information",
      paragraphs: [
        "We do not sell, trade, or rent personal information to third parties.",
        "Information may only be shared when necessary with trusted service providers involved in website management, donation processing, or legal compliance, and only to the extent required.",
      ],
    },
    {
      heading: "Cookies and Website Analytics",
      paragraphs: [
        "Our website may use cookies and basic analytics tools to understand visitor behavior and improve the user experience. Cookies help us analyze website traffic and enhance functionality.",
        "Users can choose to disable cookies through their browser settings.",
      ],
    },
    {
      heading: "External Links",
      paragraphs: [
        "Our website may contain links to third-party websites for informational purposes. Shivarpan Charitable Foundation is not responsible for the privacy practices or content of external websites.",
        "We encourage visitors to review the privacy policies of any external sites they visit.",
      ],
    },
    {
      heading: "Changes to This Privacy Policy",
      paragraphs: [
        "Shivarpan Charitable Foundation may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Updates will be posted on this page.",
        "Continued use of the website after changes indicates acceptance of the updated policy.",
      ],
    },
    {
      heading: "Contact Us",
      paragraphs: [
        "If you have any questions regarding this Privacy Policy or how your information is handled, please contact us through the contact details provided on our website.",
      ],
    },
  ],
};

export const termsContent: LegalDocument = {
  title: "Terms and Conditions",
  subtitle:
    "The rules for using Shivarpan Charitable Foundation's website, donations, external links, liability, and governing law.",
  lastUpdated: "March 2026",
  intro: [
    "Welcome to the official website of Shivarpan Charitable Foundation. By accessing or using this website, you agree to comply with and be bound by the following Terms and Conditions. If you do not agree with any part of these terms, please do not use our website.",
  ],
  sections: [
    {
      heading: "Use of Website",
      paragraphs: [
        "The content on this website is provided for general information about Shivarpan Charitable Foundation and its activities. By using this website, you agree to use it only for lawful purposes and in a way that does not infringe the rights of others or restrict their use of the website.",
        "You must not misuse this website by introducing viruses, attempting unauthorized access, or engaging in any activity that may harm the website or its users.",
      ],
    },
    {
      heading: "Intellectual Property",
      paragraphs: [
        "All content on this website, including text, images, logos, graphics, and materials, is the property of Shivarpan Charitable Foundation unless otherwise stated. Unauthorized use, reproduction, or distribution of this content without permission is strictly prohibited.",
      ],
    },
    {
      heading: "Donations",
      paragraphs: [
        "Any donations made through this website are voluntary and non-refundable unless otherwise specified. Shivarpan Charitable Foundation ensures that donations are used for charitable purposes aligned with the organization's mission and programs.",
        "Donors are encouraged to verify details before making contributions.",
      ],
    },
    {
      heading: "External Links",
      paragraphs: [
        "Our website may contain links to third-party websites for informational purposes. Shivarpan Charitable Foundation does not control or take responsibility for the content, privacy policies, or practices of any external websites.",
      ],
    },
    {
      heading: "Limitation of Liability",
      paragraphs: [
        "While we strive to keep the information on this website accurate and up to date, Shivarpan Charitable Foundation does not guarantee the completeness or reliability of the content. The organization shall not be held liable for any loss or damage arising from the use of this website.",
      ],
    },
    {
      heading: "Privacy",
      paragraphs: [
        "Any personal information collected through this website will be handled in accordance with our Privacy Policy.",
      ],
    },
    {
      heading: "Changes to Terms",
      paragraphs: [
        "Shivarpan Charitable Foundation reserves the right to update or modify these Terms and Conditions at any time without prior notice. Continued use of the website after changes are made indicates your acceptance of the revised terms.",
      ],
    },
    {
      heading: "Governing Law",
      paragraphs: [
        "These Terms and Conditions are governed by the laws of India. Any disputes arising from the use of this website shall fall under the jurisdiction of the appropriate courts in India.",
      ],
    },
    {
      heading: "Contact Information",
      paragraphs: [
        "If you have any questions regarding these Terms and Conditions, you may contact us through the contact details provided on our website.",
      ],
    },
  ],
};

export const refundPolicyContent: LegalDocument = {
  title: "Refund Policy",
  subtitle:
    "Shivarpan Charitable Foundation's refund policy for donations and support transactions made through this website.",
  lastUpdated: "March 2026",
  intro: [
    "At Shivarpan Charitable Foundation, we strive to use every contribution responsibly and transparently for our charitable programs. Donations made through this website are generally non-refundable unless otherwise specified or required by law.",
    "This Refund Policy outlines the conditions under which a refund may be issued and how to request one.",
  ],
  sections: [
    {
      heading: "Donation Refunds",
      paragraphs: [
        "Donations made via the website are intended to support the foundation's charitable activities and are typically non-refundable.",
        "Refund requests are considered only in exceptional cases, such as payment processing errors or duplicate contributions.",
      ],
    },
    {
      heading: "How to Request a Refund",
      paragraphs: [
        "If you believe a refund is warranted, please contact us as soon as possible using the contact information provided on our website.",
        "Provide details about the transaction, including the date, amount, payment method, and any relevant order or donation reference.",
      ],
      bullets: [
        "Send your refund request through the website contact form or email address.",
        "Include donation details and the reason for the request.",
        "Allow up to 7 business days for the foundation to review your request.",
      ],
    },
    {
      heading: "Approval and Processing",
      paragraphs: [
        "Refund approval is at the sole discretion of Shivarpan Charitable Foundation and may depend on the circumstances surrounding the donation.",
        "If approved, the refund will be processed using the original payment method whenever possible.",
      ],
    },
    {
      heading: "Exceptions",
      paragraphs: [
        "Refunds are not guaranteed and may not be available for donations that have already been allocated to programs or operational costs.",
        "In some cases, alternative resolutions such as credit toward future contributions may be offered.",
      ],
    },
    {
      heading: "Contact Information",
      paragraphs: [
        "If you have questions regarding this Refund Policy or need assistance, please reach out through the contact details available on our website.",
      ],
    },
  ],
};
