import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Copy, ArrowLeft, Mail, Check, Sparkles, Image as ImageIcon, Phone, Building2, Globe } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SignatureData {
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  avatarUrl: string;
  website: string;
}

export const EmailSignature: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<'html' | 'text' | null>(null);
  const [signatureData, setSignatureData] = useState<SignatureData>({
    fullName: '',
    jobTitle: '',
    company: '',
    email: '',
    phone: '',
    avatarUrl: '',
    website: '',
  });

  useEffect(() => {
    if (user) {
      fetchCardData();
    }
  }, [user]);

  const fetchCardData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('digital_cards')
        .select('*')
        .eq('owner_user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.content_json) {
        const content = data.content_json as any;
        setSignatureData({
          fullName: content.fullName || '',
          jobTitle: content.jobTitle || '',
          company: content.company || '',
          email: content.email || '',
          phone: content.phone || '',
          avatarUrl: content.avatarUrl || '',
          website: content.vanityUrl ? `https://cardcraft-omega.vercel.app/${content.vanityUrl}` : '',
        });
      }
    } catch (error) {
      console.error('Error fetching card:', error);
      toast({
        title: "Error",
        description: "Failed to load your card data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateHTMLSignature = () => {
    return `
<table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 14px; color: #333; max-width: 500px;">
  <tr>
    <td style="padding-right: 20px; vertical-align: top;">
      ${signatureData.avatarUrl ? `<img src="${signatureData.avatarUrl}" alt="${signatureData.fullName}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;" />` : ''}
    </td>
    <td style="vertical-align: top;">
      <p style="margin: 0; font-size: 16px; font-weight: bold; color: #000;">${signatureData.fullName}</p>
      ${signatureData.jobTitle ? `<p style="margin: 4px 0; font-size: 13px; color: #666;">${signatureData.jobTitle}</p>` : ''}
      ${signatureData.company ? `<p style="margin: 2px 0; font-size: 13px; color: #666;">${signatureData.company}</p>` : ''}
      <p style="margin: 8px 0 2px; font-size: 13px;">
        ${signatureData.email ? `<a href="mailto:${signatureData.email}" style="color: #0066cc; text-decoration: none;">${signatureData.email}</a>` : ''}
      </p>
      ${signatureData.phone ? `<p style="margin: 2px 0; font-size: 13px;">Tel: ${signatureData.phone}</p>` : ''}
      ${signatureData.website ? `<p style="margin: 6px 0 0; font-size: 12px;"><a href="${signatureData.website}" style="color: #0066cc; text-decoration: none;">View My Card</a></p>` : ''}
    </td>
  </tr>
</table>
    `.trim();
  };

  const generatePlainTextSignature = () => {
    return `
${signatureData.fullName}
${signatureData.jobTitle}${signatureData.company ? ` | ${signatureData.company}` : ''}
${signatureData.email ? `Email: ${signatureData.email}` : ''}
${signatureData.phone ? `Tel: ${signatureData.phone}` : ''}
${signatureData.website ? `Card: ${signatureData.website}` : ''}
    `.trim();
  };

  const copyToClipboard = async (text: string, type: 'html' | 'text') => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([text], { type: 'text/html' }),
          'text/plain': new Blob([generatePlainTextSignature()], { type: 'text/plain' }),
        }),
      ]);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      toast({
        title: "Copied!",
        description: `${type === 'html' ? 'HTML' : 'Plain text'} signature copied to clipboard`,
      });
    } catch (error) {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
      toast({
        title: "Copied!",
        description: `${type === 'html' ? 'HTML' : 'Plain text'} signature copied to clipboard`,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
        <div className="relative text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your signature...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] relative overflow-hidden">
      {/* Micro-dotted background */}
      <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
        backgroundSize: '20px 20px'
      }}></div>

      {/* Gradient orbs */}
      <div className="fixed top-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/editor')}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="text-2xl font-bold text-slate-900">
                  <span className="text-slate-600">P</span>atra
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm mb-6">
            <Mail className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-semibold text-slate-700">Email Signature Generator</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent mb-4">
            Professional Email Signatures
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Create stunning email signatures based on your CardCraft profile
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Customize Section */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Customize Your Signature
                </h2>
              </div>
              
              <div className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      value={signatureData.fullName}
                      onChange={(e) => setSignatureData({ ...signatureData, fullName: e.target.value })}
                      className="h-12 bg-white border-slate-200 focus:border-violet-500 focus:ring-violet-500 pl-4"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle" className="text-sm font-semibold text-slate-700">
                    Job Title
                  </Label>
                  <div className="relative">
                    <Input
                      id="jobTitle"
                      value={signatureData.jobTitle}
                      onChange={(e) => setSignatureData({ ...signatureData, jobTitle: e.target.value })}
                      className="h-12 bg-white border-slate-200 focus:border-violet-500 focus:ring-violet-500 pl-4"
                      placeholder="Product Designer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-semibold text-slate-700">
                    Company
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="company"
                      value={signatureData.company}
                      onChange={(e) => setSignatureData({ ...signatureData, company: e.target.value })}
                      className="h-12 bg-white border-slate-200 focus:border-violet-500 focus:ring-violet-500 pl-11"
                      placeholder="CardCraft Inc."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      value={signatureData.email}
                      onChange={(e) => setSignatureData({ ...signatureData, email: e.target.value })}
                      className="h-12 bg-white border-slate-200 focus:border-violet-500 focus:ring-violet-500 pl-11"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                    Phone
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="phone"
                      value={signatureData.phone}
                      onChange={(e) => setSignatureData({ ...signatureData, phone: e.target.value })}
                      className="h-12 bg-white border-slate-200 focus:border-violet-500 focus:ring-violet-500 pl-11"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                {signatureData.avatarUrl && (
                  <div className="pt-4 border-t border-slate-200">
                    <Label className="text-sm font-semibold text-slate-700 mb-3 block">
                      Profile Picture Preview
                    </Label>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-20 h-20 border-2 border-slate-200">
                        <AvatarImage src={signatureData.avatarUrl} alt={signatureData.fullName} />
                        <AvatarFallback className="bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700 text-2xl font-bold">
                          {signatureData.fullName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm text-slate-600">
                        <p className="font-medium">This image will appear in your signature</p>
                        <p className="text-xs text-slate-500 mt-1">Update it in your card editor</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Preview & Copy Section */}
          <div className="space-y-6">
            <Card className="bg-white border-slate-200 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Preview
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="border-2 border-slate-200 rounded-xl p-6 bg-white min-h-[200px]">
                  <div dangerouslySetInnerHTML={{ __html: generateHTMLSignature() }} />
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => copyToClipboard(generateHTMLSignature(), 'html')}
                    className="w-full h-12 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {copied === 'html' ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Copy HTML Signature
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => copyToClipboard(generatePlainTextSignature(), 'text')}
                    variant="outline"
                    className="w-full h-12 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  >
                    {copied === 'text' ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5 mr-2" />
                        Copy Plain Text
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Tip */}
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2">Pro Tip!</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      Use the HTML version for rich email clients like Gmail and Outlook. 
                      The plain text version works great for simple email clients.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* How to Use Section */}
        <Card className="bg-white border-slate-200 shadow-xl overflow-hidden max-w-6xl mx-auto mt-8">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5" />
              How to Add Your Signature
            </h2>
          </div>
          
          <div className="p-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-violet-600">1</span>
                </div>
                <h3 className="font-bold text-slate-900">Gmail</h3>
                <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                  <li>Click Settings (gear icon)</li>
                  <li>Go to "See all settings"</li>
                  <li>Scroll to "Signature"</li>
                  <li>Paste your signature</li>
                  <li>Save changes</li>
                </ol>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">2</span>
                </div>
                <h3 className="font-bold text-slate-900">Outlook</h3>
                <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                  <li>Click Settings (gear icon)</li>
                  <li>Search for "signature"</li>
                  <li>Click "Email signature"</li>
                  <li>Paste your signature</li>
                  <li>Save</li>
                </ol>
              </div>

              <div className="space-y-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-600">3</span>
                </div>
                <h3 className="font-bold text-slate-900">Apple Mail</h3>
                <ol className="text-sm text-slate-600 space-y-2 list-decimal list-inside">
                  <li>Open Mail preferences</li>
                  <li>Go to "Signatures"</li>
                  <li>Create new signature</li>
                  <li>Paste your content</li>
                  <li>Close to save</li>
                </ol>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};
