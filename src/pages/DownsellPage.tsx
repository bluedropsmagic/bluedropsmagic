import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { AlertTriangle, Mail, Star, Shield, CheckCircle } from 'lucide-react';
import { trackInitiateCheckout } from '../utils/facebookPixelTracking';
import { BoltNavigation } from '../components/BoltNavigation';

interface DownsellPageProps {
  variant: 'dws1' | 'dws2' | 'dw3';
}

export const DownsellPage: React.FC<DownsellPageProps> = ({ variant }) => {
  const [searchParams] = useSearchParams();
  const { trackOfferClick } = useAnalytics();
  const [cartParams, setCartParams] = useState<string>('');

  // ✅ NEW: Ensure no Hotjar on downsell pages
  useEffect(() => {
    // Remove ALL Hotjar scripts from downsell pages
    const existingHotjar = document.querySelectorAll('script[src*="hotjar"]');
    existingHotjar.forEach(script => script.remove());
    
    // Clean up Hotjar globals
    if ((window as any).hj) {
      delete (window as any).hj;
    }
    if ((window as any)._hjSettings) {
      delete (window as any)._hjSettings;
    }
    
    console.log('🚫 Hotjar removed from downsell page');
  }, []);

  // Preserve CartPanda parameters
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Common CartPanda parameters to preserve
    const cartPandaParams = [
      'order_id', 'customer_id', 'transaction_id', 'email', 'phone',
      'first_name', 'last_name', 'address', 'city', 'state', 'zip',
      'country', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term',
      'utm_content', 'fbclid', 'gclid', 'affiliate_id', 'sub_id'
    ];

    cartPandaParams.forEach(param => {
      const value = searchParams.get(param);
      if (value) {
        params.append(param, value);
      }
    });

    // Also preserve any other parameters that might be present
    searchParams.forEach((value, key) => {
      if (!cartPandaParams.includes(key)) {
        params.append(key, value);
      }
    });

    setCartParams(params.toString());
  }, [searchParams]);

  // URLs based on variant - keeping original URLs
  const getUrls = () => {
    const urls = {
      'dws1': {
        accept: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws1?accepted=yes',
        reject: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws1?accepted=no'
      },
      'dws2': {
        accept: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws2?accepted=yes',
        reject: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws2?accepted=no'
      },
      'dw3': {
        accept: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=yes',
        reject: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=no'
      }
    };
    return urls[variant];
  };

  const urls = getUrls();

  const handleAccept = () => {
    trackInitiateCheckout(urls.accept);
    trackOfferClick(`downsell-${variant}-accept`);
    
    let url = cartParams ? `${urls.accept}&${cartParams}` : urls.accept;
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid');
    if (cid && !url.includes('cid=')) {
      url += (url.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
    }
    
    setTimeout(() => {
      window.location.href = url;
    }, 150);
  };

  const handleReject = () => {
    trackInitiateCheckout(urls.reject);
    trackOfferClick(`downsell-${variant}-reject`);
    
    let url = cartParams ? `${urls.reject}&${cartParams}` : urls.reject;
    const urlParams = new URLSearchParams(window.location.search);
    const cid = urlParams.get('cid');
    if (cid && !url.includes('cid=')) {
      url += (url.includes('?') ? '&' : '?') + 'cid=' + encodeURIComponent(cid);
    }
    
    setTimeout(() => {
      window.location.href = url;
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Bolt Navigation */}
      <BoltNavigation />
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        
        {/* Header */}
        <header className="text-center mb-16">
          <img 
            src="https://i.imgur.com/QJxTIcN.png" 
            alt="Blue Drops Logo"
            className="h-12 w-auto mx-auto"
          />
        </header>

        {/* Main Headline */}
        <section className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-8">
            Maybe you didn't realize it yet…
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8">
            But eliminating <strong>100% of the toxic plaque</strong> from your penile veins is the <strong>ONLY way</strong> to never suffer from erectile dysfunction again.
          </p>
        </section>

        {/* Warning Section */}
        <section className="mb-16">
          <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-red-800 mb-6">
              If you don't completely EXTERMINATE these toxic buildups…
            </h2>
            
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p><strong>Your ED problems will come back.</strong></p>
              <p>Even if you start feeling amazing results in the first few weeks…</p>
              <p>If you stop using Blue Drops before eliminating all the toxic plaque, all the torment might return to haunt you.</p>
              <p>The dreaded flaccidity might surprise you again at the crucial moment…</p>
              <p>The anxiety before sex could creep back in…</p>
              <p>And your relationship could fall back to square one.</p>
              <p><strong>Worse yet — your erectile issues might become irreversible.</strong></p>
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            But I decided to help you as much as possible — so you'll never have to go through that again.
          </h2>
          <p className="text-xl text-gray-700 mb-4">You might not know this…</p>
          <p className="text-xl text-gray-700 mb-8">But I get emails like this almost every day:</p>
        </section>

        {/* Email Section */}
        <section className="mb-16">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden max-w-3xl mx-auto">
            {/* Email Header */}
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-900">Email Received</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>From:</strong> James C.</p>
                <p><strong>To:</strong> contact@bluedrops.com</p>
                <p><strong>Subject:</strong> New Order Request</p>
              </div>
            </div>
            
            {/* Email Content */}
            <div className="p-6">
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>I need your help.</p>
                <p>I've just finished my six bottles of Blue Drops and honestly, I don't want to stop.</p>
                <p>No more anxiety during sex — and my wife has never been more satisfied in bed.</p>
                <p>On top of that, I noticed a size increase — my partner did too.</p>
                <p><strong>I think I've gained about 2 inches… it's incredible!</strong></p>
                <p>I feel more energetic and my endurance is on another level.</p>
                <p>I'd like to order another 6-bottle pack, but I saw on the website it's out of stock.</p>
                <p>Please let me know when it's restocked. I'm even willing to pay more.</p>
                <p>Looking forward to your reply.</p>
                <p>Sincerely,<br/>James C.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Proof Section */}
        <section className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            That proves one thing:
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            The benefits of Blue Drops go way beyond fixing erectile dysfunction.
          </p>
          <p className="text-xl font-bold text-blue-600 mb-12">
            Over 14,365 men have reported:
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <p className="text-gray-800 font-medium text-lg">Increased size and girth</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <p className="text-gray-800 font-medium text-lg">Triple the erection duration</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <p className="text-gray-800 font-medium text-lg">Sharper thinking</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <p className="text-gray-800 font-medium text-lg">Boosted strength and muscle mass</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <p className="text-gray-800 font-medium text-lg">Fat-burning acceleration</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <p className="text-gray-800 font-medium text-lg">Hair improvement and skin glow</p>
            </div>
          </div>

          <p className="text-xl text-gray-700 mb-4">
            All of them would give anything to have access to this exclusive discount — just for you.
          </p>
        </section>

        {/* Offer Section */}
        <section className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            So here's one more chance…
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            But it's the best one yet:
          </p>

          {/* Price Highlight */}
          <div className="bg-white rounded-xl shadow-xl border-2 border-green-500 p-8 mb-12 max-w-2xl mx-auto relative">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-green-500 text-white px-6 py-2 rounded-full font-bold text-sm">
                TODAY ONLY — WHILE SUPPLIES LAST
              </div>
            </div>
            
            <div className="pt-4">
              <p className="text-4xl md:text-5xl font-black text-green-600 mb-4">
                US$29 per bottle
              </p>
              <p className="text-xl text-gray-700 mb-6">
                (When you buy a 6-month kit)
              </p>
              <p className="text-lg text-gray-600 mb-8">
                You won't find this offer anywhere else.
              </p>
              
              <button 
                onClick={handleAccept}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg checkout-button mb-4"
              >
                Claim My Discount
              </button>
              
              <p className="text-sm text-gray-600">
                This is the BIGGEST discount the lab has ever offered — so you never have to suffer from ED again.
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="mb-16">
          <p className="text-lg text-gray-700 mb-8 text-center">
            And don't miss out on the EXTRA benefits of this potent formula.
          </p>

          {/* Testimonial 1 */}
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mb-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-xl">T</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-gray-900">Tristan Hayes</h4>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">Charleston, SC</span>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 leading-relaxed italic">
                  "I can't thank you enough for showing me Blue Drops! I thought I'd never feel like a real man again. My confidence is back — thank you so much!"
                </blockquote>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mb-8 max-w-3xl mx-auto">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold text-xl">L</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-gray-900">Landon Bishop</h4>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-600">Tucson, AZ</span>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 leading-relaxed italic">
                  "This is exactly what I needed! Damn, it feels good to be confident in bed again… Thanks! Now the younger guys don't stand a chance against me, haha. Blue Drops is part of my routine now."
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Don't miss this unique opportunity.
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Just like them, you can start enjoying a vibrant and powerful sex life again.
          </p>
          <p className="text-xl font-bold text-red-600 mb-12">
            This discount won't show up again for you.
          </p>

          {/* Final Offer Box */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">100% Satisfaction Guarantee</span>
            </div>
            
            <button 
              onClick={handleAccept}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg checkout-button mb-6"
            >
              Claim My Discount
            </button>
            
            <p className="text-lg font-semibold text-gray-800">
              6 bottles - $29/bottle
            </p>
          </div>
        </section>

        {/* Closing Message */}
        <section className="text-center mb-12">
          <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 max-w-md mx-auto">
            <p className="text-lg text-gray-700 mb-2">I'll leave it here.</p>
            <p className="text-lg font-medium text-blue-600">Take care!</p>
          </div>
        </section>

        {/* Reject Button */}
        <section className="text-center">
          <button 
            onClick={handleReject}
            className="text-gray-500 hover:text-gray-700 underline text-lg transition-colors checkout-button"
          >
            No, thanks. I'll miss out.
          </button>
        </section>

      </div>
    </div>
  );
};