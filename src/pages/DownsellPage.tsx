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

  // ✅ Ensure no Hotjar on downsell pages
  useEffect(() => {
    const existingHotjar = document.querySelectorAll('script[src*="hotjar"]');
    existingHotjar.forEach(script => script.remove());
    
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

    searchParams.forEach((value, key) => {
      if (!cartPandaParams.includes(key)) {
        params.append(key, value);
      }
    });

    setCartParams(params.toString());
  }, [searchParams]);

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
            Maybe you still haven't realized this...
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-700 leading-relaxed mb-8">
            But flushing out <strong>100% of the toxic plaque</strong> from your penile veins is the <strong>ONLY way</strong> to permanently eliminate erectile dysfunction.
          </p>
        </section>

        {/* Warning Section */}
        <section className="mb-16">
          <div className="bg-red-50 border-l-4 border-red-500 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#B22222', fontSize: '1.75rem' }}>
              ⚠️ If you don't <strong>COMPLETELY EXTERMINATE</strong> that toxic junk from your system...
            </h2>
            
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p className="font-bold" style={{ color: '#B22222', fontSize: '1.25rem' }}>
                ⚠️ Your ED issues <strong>WILL come back.</strong>
              </p>
              <p>Even if you've started to feel the incredible benefits within the first few weeks…</p>
              <p className="font-bold" style={{ color: '#B22222' }}>
                ⚠️ If you stop using Blue Drops before all the plaque is gone, <strong>the nightmare can return to haunt you.</strong>
              </p>
              <p className="font-bold" style={{ color: '#B22222' }}>
                ⚠️ That dreaded softness right at the crucial moment can strike again…
              </p>
              <p className="font-bold" style={{ color: '#B22222' }}>
                ⚠️ The anxiety before sex will creep back in…
              </p>
              <p>Your relationship could go back to square one...</p>
              <p className="font-bold text-xl" style={{ color: '#B22222' }}>
                ⚠️ And worst of all — your erectile problems might become <strong>irreversible.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* Help Section */}
        <section className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            But I made a decision:
          </h2>
          <p className="text-xl text-gray-700 mb-4">
            I'm going to help you as much as I can — so you never have to go through that again.
          </p>
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
                <p>I recently finished my 6 bottles of Blue Drops, and honestly — I don't want to stop.</p>
                <p>I don't worry about sex anymore, and my wife has never been so satisfied with my performance.</p>
                <p>On top of that, I've noticed an increase in penis size — and so has my wife.</p>
                <p><strong>I think I gained around 2 inches, it's insane!!!</strong></p>
                <p>I feel more energetic and have way more stamina in everyday life.</p>
                <p>I wanted to order another 6-month supply, but I saw the site says it's out of stock.</p>
                <p>Please let me know when it's back — I'm willing to pay more if needed.</p>
                <p>Sincerely,<br/>James C.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Proof Section */}
        <section className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            This only proves one thing:
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            The benefits of Blue Drops go far beyond fixing erectile dysfunction.
          </p>
          <p className="text-xl font-bold mb-12" style={{ color: '#1E90FF', fontSize: '1.5rem' }}>
            Over 14,365 men have reported that Blue Drops helped them:
          </p>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <p className="font-bold text-lg flex items-center gap-3" style={{ color: '#228B22' }}>
                <span className="text-2xl">🍆</span>
                <span>Increase penis size and girth</span>
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <p className="font-bold text-lg flex items-center gap-3" style={{ color: '#228B22' }}>
                <span className="text-2xl">💪</span>
                <span>Triple their performance time in bed</span>
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <p className="font-bold text-lg flex items-center gap-3" style={{ color: '#228B22' }}>
                <span className="text-2xl">🧠</span>
                <span>Sharpen mental focus</span>
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <p className="font-bold text-lg flex items-center gap-3" style={{ color: '#228B22' }}>
                <span className="text-2xl">💪</span>
                <span>Build more muscle and strength</span>
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <p className="font-bold text-lg flex items-center gap-3" style={{ color: '#228B22' }}>
                <span className="text-2xl">🔥</span>
                <span>Burn off stubborn fat</span>
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
              <p className="font-bold text-lg flex items-center gap-3" style={{ color: '#228B22' }}>
                <span className="text-2xl">✨</span>
                <span>Regrow hair and improve appearance</span>
              </p>
            </div>
          </div>

          <p className="text-xl text-gray-700 mb-4">
            That's why <strong>NONE</strong> of them want to stop taking Blue Drops — even after beating ED.
          </p>
          <p className="text-xl text-gray-700 mb-8">
            They would do anything to get this exclusive discount I'm offering you right now.
          </p>
        </section>

        {/* Offer Section */}
        <section className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            And that's why I'm giving you one more shot…
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            This time, an even better deal.
          </p>
          <p className="text-xl text-gray-700 mb-8">
            Right here, on this page — and <strong>ONLY</strong> while supplies last...
          </p>

          {/* Price Highlight */}
          <div className="bg-white rounded-xl shadow-xl border-2 border-green-500 p-8 mb-12 max-w-2xl mx-auto relative">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-green-500 text-white px-6 py-2 rounded-full font-bold text-sm">
                ✅ TODAY ONLY — WHILE SUPPLIES LAST
              </div>
            </div>
            
            <div className="pt-4">
              <p className="text-4xl md:text-5xl font-black mb-4" style={{ color: '#1E90FF' }}>
                US$23 per bottle
              </p>
              <p className="text-xl text-gray-700 mb-6">
                (When you buy a 6-bottle supply of Blue Drops)
              </p>
              <p className="text-lg font-bold mb-8" style={{ color: '#B22222' }}>
                You will <strong>NOT</strong> see this offer again.<br/>
                Not tomorrow. Not ever.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Click the button below to claim your kit.
              </p>
              
              <div className="mb-6">
                <p className="text-2xl font-bold mb-4" style={{ color: '#1E90FF' }}>
                  👉 6 Bottles – $29/Bottle
                </p>
              </div>
              
              <button 
                onClick={handleAccept}
                className="w-full text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg checkout-button mb-4"
                style={{ backgroundColor: '#28a745' }}
              >
                YES, I WANT THIS DEAL
              </button>
              
              <p className="text-lg font-bold" style={{ color: '#1E90FF' }}>
                This is the <strong>BIGGEST</strong> discount ever offered by the lab — because we don't want you to suffer from ED ever again.
              </p>
            </div>
          </div>
        </section>

        {/* Extra Benefits */}
        <section className="mb-16">
          <p className="text-lg text-gray-700 mb-8 text-center">
            And don't miss out on the <strong>EXTRA</strong> benefits this formula can bring you.
          </p>

          {/* Testimonial 1 */}
          <div className="rounded-lg p-6 shadow-md border border-gray-200 mb-6 max-w-3xl mx-auto" style={{ backgroundColor: '#f4f4f4' }}>
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
                <blockquote className="text-gray-700 leading-relaxed italic text-lg">
                  <span className="text-4xl text-gray-400 leading-none">"</span>
                  I can't thank you enough for introducing me to Blue Drops! I thought I'd never feel like a real man again. My self-esteem is back. Thank you!
                </blockquote>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="rounded-lg p-6 shadow-md border border-gray-200 mb-8 max-w-3xl mx-auto" style={{ backgroundColor: '#f4f4f4' }}>
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
                <blockquote className="text-gray-700 leading-relaxed italic text-lg">
                  <span className="text-4xl text-gray-400 leading-none">"</span>
                  This is exactly what I needed! Damn — it feels so good to be confident in bed again. Thanks a ton! Young guys don't stand a chance against me now, haha. Blue Drops is now part of my daily routine.
                </blockquote>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Take advantage of this one-time-only offer...
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            And like them — start living with the sexual power and confidence you deserve.
          </p>
          <p className="text-xl font-bold mb-12" style={{ color: '#B22222', fontSize: '1.5rem' }}>
            Remember: This deal will <strong>NEVER</strong> appear again for you.
          </p>

          {/* Final Offer Box */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mb-8 max-w-2xl mx-auto">
            <div className="mb-6">
              <p className="text-2xl font-bold mb-4" style={{ color: '#1E90FF' }}>
                👉 6 Bottles – $29/Bottle
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">✔ 100% Satisfaction Guarantee</span>
            </div>
            
            <button 
              onClick={handleAccept}
              className="w-full text-white font-bold py-4 px-8 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg checkout-button mb-6"
              style={{ backgroundColor: '#28a745' }}
            >
              YES, I WANT THIS DEAL
            </button>
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
            className="text-white px-6 py-3 rounded-lg text-lg transition-colors checkout-button"
            style={{ backgroundColor: '#555' }}
          >
            No, thanks. I'll miss out.
          </button>
        </section>

      </div>
    </div>
  );
};