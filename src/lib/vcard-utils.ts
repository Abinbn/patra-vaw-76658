/**
 * Utility functions for generating and downloading vCard files
 * Enhanced version with embedded photo support for maximum compatibility
 */

interface VCardData {
  name: string;
  title?: string;
  company?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  photo?: string;
  socialLinks?: Array<{ platform: string; url: string }>;
}

/**
 * Fetches an image from URL and converts it to base64
 */
const fetchImageAsBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        // Remove the data:image/...;base64, prefix
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Failed to fetch image for vCard:', error);
    return null;
  }
};

/**
 * Formats base64 data for vCard (line breaks every 76 characters)
 */
const formatBase64ForVCard = (base64: string): string => {
  const chunks: string[] = [];
  for (let i = 0; i < base64.length; i += 76) {
    chunks.push(base64.substring(i, i + 76));
  }
  return chunks.join('\r\n '); // Note the space before continuation lines
};

/**
 * Generates a vCard (VCF) file content from card data
 * @param embedPhoto - If true, downloads and embeds the photo as base64 (recommended for compatibility)
 */
export const generateVCard = async (
  data: VCardData, 
  embedPhoto: boolean = true
): Promise<string> => {
  // Validate required fields
  if (!data.name || data.name.trim() === '') {
    throw new Error('Name is required for vCard generation');
  }

  const vcard: string[] = [];
  
  // vCard header
  vcard.push('BEGIN:VCARD');
  vcard.push('VERSION:3.0');
  
  // Name (required)
  const nameParts = data.name.trim().split(' ').filter(part => part.length > 0);
  const lastName = nameParts.length > 1 ? nameParts.pop() : '';
  const firstName = nameParts.join(' ') || data.name.trim();
  vcard.push(`N:${lastName};${firstName};;;`);
  vcard.push(`FN:${data.name}`);
  
  // Title and Organization
  if (data.title) {
    vcard.push(`TITLE:${data.title}`);
  }
  
  if (data.company) {
    vcard.push(`ORG:${data.company}`);
  }
  
  // Contact information
  if (data.phone) {
    vcard.push(`TEL;TYPE=CELL:${data.phone}`);
  }
  
  if (data.email) {
    vcard.push(`EMAIL:${data.email}`);
  }
  
  if (data.website) {
    vcard.push(`URL:${data.website}`);
  }
  
  // Address
  if (data.address) {
    vcard.push(`ADR;TYPE=WORK:;;${data.address};;;;`);
  }
  
  // Photo handling
  if (data.photo) {
    if (embedPhoto) {
      // Try to embed the photo as base64 for maximum compatibility
      const base64Photo = await fetchImageAsBase64(data.photo);
      if (base64Photo) {
        const formattedPhoto = formatBase64ForVCard(base64Photo);
        vcard.push(`PHOTO;ENCODING=BASE64;TYPE=JPEG:\r\n ${formattedPhoto}`);
      } else {
        // Fallback to URL if fetch fails
        vcard.push(`PHOTO;VALUE=URL:${data.photo}`);
      }
    } else {
      // Use URL method (less compatible but smaller file size)
      vcard.push(`PHOTO;VALUE=URL:${data.photo}`);
    }
  }
  
  // Social links as custom properties
  if (data.socialLinks && data.socialLinks.length > 0) {
    data.socialLinks.forEach(link => {
      if (link.platform && link.url) {
        vcard.push(`X-SOCIALPROFILE;TYPE=${link.platform}:${link.url}`);
      }
    });
  }
  
  // vCard footer
  vcard.push('END:VCARD');
  
  return vcard.join('\r\n');
};

/**
 * Synchronous version of generateVCard (without photo embedding)
 * Use this if you need a quick VCF without waiting for image download
 */
export const generateVCardSync = (data: VCardData): string => {
  // Validate required fields
  if (!data.name || data.name.trim() === '') {
    throw new Error('Name is required for vCard generation');
  }

  const vcard: string[] = [];
  
  vcard.push('BEGIN:VCARD');
  vcard.push('VERSION:3.0');
  
  const nameParts = data.name.trim().split(' ').filter(part => part.length > 0);
  const lastName = nameParts.length > 1 ? nameParts.pop() : '';
  const firstName = nameParts.join(' ') || data.name.trim();
  vcard.push(`N:${lastName};${firstName};;;`);
  vcard.push(`FN:${data.name}`);
  
  if (data.title) vcard.push(`TITLE:${data.title}`);
  if (data.company) vcard.push(`ORG:${data.company}`);
  if (data.phone) vcard.push(`TEL;TYPE=CELL:${data.phone}`);
  if (data.email) vcard.push(`EMAIL:${data.email}`);
  if (data.website) vcard.push(`URL:${data.website}`);
  if (data.address) vcard.push(`ADR;TYPE=WORK:;;${data.address};;;;`);
  if (data.photo) vcard.push(`PHOTO;VALUE=URL:${data.photo}`);
  
  if (data.socialLinks && data.socialLinks.length > 0) {
    data.socialLinks.forEach(link => {
      if (link.platform && link.url) {
        vcard.push(`X-SOCIALPROFILE;TYPE=${link.platform}:${link.url}`);
      }
    });
  }
  
  vcard.push('END:VCARD');
  return vcard.join('\r\n');
};

/**
 * Triggers a download of the vCard file
 * @param embedPhoto - If true, embeds photo as base64 (better compatibility but larger file)
 */
export const downloadVCard = async (
  data: VCardData, 
  filename?: string,
  embedPhoto: boolean = true
): Promise<void> => {
  try {
    const vcardContent = await generateVCard(data, embedPhoto);
    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${data.name.replace(/\s+/g, '_')}.vcf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading vCard:', error);
    throw error;
  }
};

/**
 * Quick download without photo embedding (faster but less compatible)
 */
export const downloadVCardQuick = (data: VCardData, filename?: string): void => {
  try {
    const vcardContent = generateVCardSync(data);
    const blob = new Blob([vcardContent], { type: 'text/vcard;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${data.name.replace(/\s+/g, '_')}.vcf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading vCard:', error);
    throw error;
  }
};

/**
 * Parses user data from your Patra profile format to VCardData
 */
export const parseProfileToVCard = (profile: any): VCardData => {
  return {
    name: profile.name || profile.fullName || '',
    title: profile.title || profile.position || '',
    company: profile.company || profile.organization || '',
    phone: profile.phone || profile.mobile || '',
    email: profile.email || '',
    website: profile.website || profile.profileUrl || '',
    address: profile.address || '',
    photo: profile.photo || profile.avatar || profile.image || '',
    socialLinks: profile.socialLinks || profile.socials || []
  };
};


