import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { AlertTriangle, CheckCircle, Shield, Truck, Clock, Mail, Star, Users, TrendingUp, Heart, Zap, Award } from 'lucide-react';
import { trackInitiateCheckout } from '../utils/facebookPixelTracking';
import { BoltNavigation } from '../components/BoltNavigation';

interface DownsellPageProps {
  variant: 'dws1' | 'dws2' | 'dw3';
}

interface DownsellContent {
  warning: string;
  headline: string;
  subheadline: string;
  description: string[];
  testimonialEmail: {
    from: string;
    subject: string;
    content: string[];
  };
  benefits: string[];
  testimonials: Array<{
    name: string;
    location: string;
    quote: string;
  }>;
  finalOffer: {
    title: string;
    subtitle: string;
    pricePerBottle: string;
    totalBottles: string;
  };
  acceptUrl: string;
  rejectUrl: string;
  productImage: string;
  savings: string;
  originalPrice: string;
  newPrice: string;
  installments: string;
  bottlesOffered: string;
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

  const getDownsellContent = (variant: string): DownsellContent => {
    const contents = {
      'dws1': {
        warning: '⚠️ WAIT!',
        headline: 'Maybe you didn\'t understand that eliminating 100% of the toxin plaques from your penile veins is the ONLY way to never suffer from erectile dysfunction again',
        subheadline: 'If you don\'t COMPLETELY EXTERMINATE these damn toxin plaques...',
        description: [
          'Your erectile dysfunction problems will return.',
          'That\'s because, even if you start feeling the incredible benefits in the first few weeks.',
          'If you stop using BlueDrops before completely eliminating the toxin plaques, ALL the torment can come back to haunt you.',
          'The flaccidity at the crucial moment can catch you off guard again...',
          'The insecurity before sex will worry you once more...',
          'Your relationship with your partner will go back to square one...',
          'And worst of all, your flaccidity problem may become irreversible.'
        ],
        testimonialEmail: {
          from: 'James C.',
          subject: 'New Order Request',
          content: [
            'I need your help.',
            'I recently finished using the six bottles of BlueDrops and, honestly, I don\'t want to stop.',
            'I no longer have those worries during sex, and my wife has never been so satisfied with my performance in bed.',
            'Additionally, I noticed an increase in the size of my penis, which my partner also noticed.',
            'I think I gained about 2 inches, it\'s incredible!!!',
            'I feel more energetic and have much more stamina in my daily life.',
            'I would like to buy another six-bottle package, but I saw on the website that the product is out of stock.',
            'I would like to know when it will be restocked. I\'m willing to pay more if necessary.',
            'Awaiting your response.',
            'Sincerely, James C.'
          ]
        },
        benefits: [
          'Increased penis size and thickness',
          'Tripled erection time in bed',
          'Accelerated reasoning',
          'Increased strength and muscle mass',
          'Burned excess fat',
          'Improvement in hair loss and appearance'
        ],
        testimonials: [
          {
            name: 'Tristan Hayes',
            location: 'Charleston, SC',
            quote: 'I don\'t even know how to thank you for introducing me to BlueDrops! I thought I\'d never feel like a real man again. My self-esteem reignited, thank you so much!'
          },
          {
            name: 'Landon Bishop',
            location: 'Tucson, AZ',
            quote: 'This is all I needed! Damn! It feels so good to be confident in bed again... Thank you for this! Now the younger guys don\'t stand a chance against me, haha. BlueDrops is now part of my routine.'
          }
        ],
        finalOffer: {
          title: '🎯 Final Offer: 3-Month Supply',
          subtitle: 'Only $23 per bottle in a 3-month BlueDrops kit',
          pricePerBottle: '$23',
          totalBottles: '3 BOTTLES'
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws1?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws1?accepted=no',
        productImage: 'https://i.imgur.com/eXYnjhm.png',
        savings: 'SAVE $200',
        originalPrice: 'R$ 297,00',
        newPrice: 'R$ 97,00',
        installments: '12x R$ 8,08',
        bottlesOffered: '3 BOTTLES'
      },
      'dws2': {
        warning: '⚠️ LAST CHANCE:',
        headline: 'This is truly your final opportunity to get BlueDrops at a discount',
        subheadline: 'We\'ve already given you our best offers.',
        description: [
          'But we believe so strongly in BlueDrops that we\'re willing to make one final exception.',
          'This is the absolute lowest price we can offer - and it\'s only available right now.',
          'More than 14,365 men have reported that BlueDrops provides benefits that go beyond just eliminating flaccidity.',
          'All of them would give anything to have access to this exclusive discount that I\'m offering only to you.'
        ],
        testimonialEmail: {
          from: 'James C.',
          subject: 'New Order Request',
          content: [
            'I need your help.',
            'I recently finished using the six bottles of BlueDrops and, honestly, I don\'t want to stop.',
            'I no longer have those worries during sex, and my wife has never been so satisfied with my performance in bed.',
            'Additionally, I noticed an increase in the size of my penis, which my partner also noticed.',
            'I think I gained about 2 inches, it\'s incredible!!!',
            'I feel more energetic and have much more stamina in my daily life.'
          ]
        },
        benefits: [
          'Increased penis size and thickness',
          'Tripled erection time in bed',
          'Accelerated reasoning',
          'Increased strength and muscle mass',
          'Burned excess fat',
          'Improvement in hair loss and appearance'
        ],
        testimonials: [
          {
            name: 'Tristan Hayes',
            location: 'Charleston, SC',
            quote: 'I don\'t even know how to thank you for introducing me to BlueDrops! I thought I\'d never feel like a real man again. My self-esteem reignited, thank you so much!'
          },
          {
            name: 'Landon Bishop',
            location: 'Tucson, AZ',
            quote: 'This is all I needed! Damn! It feels so good to be confident in bed again... Thank you for this! Now the younger guys don\'t stand a chance against me, haha.'
          }
        ],
        finalOffer: {
          title: '💥 Absolute Final Offer: 2-Month Supply',
          subtitle: 'Only $29 per bottle in a 2-month BlueDrops kit',
          pricePerBottle: '$29',
          totalBottles: '2 BOTTLES'
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws2?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dws2?accepted=no',
        productImage: 'https://i.imgur.com/eXYnjhm.png',
        savings: 'SAVE $150',
        originalPrice: 'R$ 198,00',
        newPrice: 'R$ 67,00',
        installments: '12x R$ 5,58',
        bottlesOffered: '2 BOTTLES'
      },
      'dw3': {
        warning: '⚠️ FINAL OPPORTUNITY:',
        headline: 'This is it - the very last chance to get BlueDrops at any discount',
        subheadline: 'We\'ve exhausted all our special offers.',
        description: [
          'But we can\'t bear to see you leave empty-handed.',
          'So here\'s our final, final offer - one single bottle at a special price.',
          'Don\'t miss the countless EXTRA benefits that this powerful BlueDrops formula can provide you.',
          'Take advantage of this unique opportunity and, like them, start enjoying a vibrant and powerful sex life.'
        ],
        testimonialEmail: {
          from: 'James C.',
          subject: 'New Order Request',
          content: [
            'I need your help.',
            'I recently finished using the six bottles of BlueDrops and, honestly, I don\'t want to stop.',
            'I no longer have those worries during sex, and my wife has never been so satisfied with my performance in bed.',
            'I feel more energetic and have much more stamina in my daily life.'
          ]
        },
        benefits: [
          'Increased penis size and thickness',
          'Tripled erection time in bed',
          'Accelerated reasoning',
          'Increased strength and muscle mass',
          'Burned excess fat',
          'Improvement in hair loss and appearance'
        ],
        testimonials: [
          {
            name: 'Tristan Hayes',
            location: 'Charleston, SC',
            quote: 'I don\'t even know how to thank you for introducing me to BlueDrops! I thought I\'d never feel like a real man again. My self-esteem reignited, thank you so much!'
          }
        ],
        finalOffer: {
          title: '🔥 Rock Bottom Price: 1 Bottle',
          subtitle: 'Single bottle at our lowest price ever',
          pricePerBottle: '$49',
          totalBottles: '1 BOTTLE'
        },
        acceptUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=yes',
        rejectUrl: 'https://pagamento.paybluedrops.com/ex-ocu/downsell-offer/dw3?accepted=no',
        productImage: 'https://i.imgur.com/iWs7wy7.png',
        savings: 'SAVE $50',
        originalPrice: 'R$ 99,00',
        newPrice: 'R$ 49,00',
        installments: '12x R$ 4,08',
        bottlesOffered: '1 BOTTLE'
      }
    };

    return contents[variant as keyof typeof contents];
  };

  const content = getDownsellContent(variant);

  const handleAccept = () => {
    trackInitiateCheckout(content.acceptUrl);
    trackOfferClick(`downsell-${variant}-accept`);
    
    let url = cartParams ? `${content.acceptUrl}&${cartParams}` : content.acceptUrl;
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
    trackInitiateCheckout(content.rejectUrl);
    trackOfferClick(`downsell-${variant}-reject`);
    
    let url = cartParams ? `${content.rejectUrl}&${cartParams}` : content.rejectUrl;
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Bolt Navigation */}
      <BoltNavigation />
      
      {/* Fixed Alert Banner */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5 animate-pulse" />
          <span className="font-black text-xs sm:text-sm md:text-base tracking-wide">
            {content.warning} YOUR ORDER IS INCOMPLETE
          </span>
          <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5 animate-pulse" />
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <header className="mb-8 text-center animate-fadeInDown animation-delay-200">
            <img 
              src="https://i.imgur.com/QJxTIcN.png" 
              alt="Blue Drops Logo"
              className="h-8 w-auto mx-auto mb-4"
            />
          </header>

          {/* Main Headline */}
          <div className="text-center mb-12 animate-fadeInUp animation-delay-400">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-6 text-gray-900">
              {content.headline}
            </h1>
            
            <div className="bg-red-100 border-l-4 border-red-500 p-6 rounded-lg mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-red-800 mb-4">
                {content.subheadline}
              </h2>
              
              <div className="space-y-3 text-gray-700">
                {content.description.map((desc, index) => (
                  <p key={index} className="text-sm sm:text-base leading-relaxed">
                    {desc}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Email Testimonial Section */}
          <div className="mb-12 animate-fadeInUp animation-delay-600">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Email Header */}
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">But I decided to help you as much as possible</span>
                </div>
                <p className="text-gray-600 text-sm">Maybe you don't know... But I receive emails like this almost every day:</p>
              </div>
              
              {/* Email Content */}
              <div className="p-6">
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>From:</strong> {content.testimonialEmail.from}<br/>
                    <strong>To:</strong> contact@bluedrops.com<br/>
                    <strong>Subject:</strong> {content.testimonialEmail.subject}
                  </div>
                </div>
                
                <div className="space-y-3">
                  {content.testimonialEmail.content.map((line, index) => (
                    <p key={index} className="text-gray-700 leading-relaxed">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="mb-12 animate-fadeInUp animation-delay-800">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                This only proves one thing:
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                The benefits that BlueDrops provides go beyond just eliminating flaccidity.
              </p>
              <p className="text-xl font-bold text-blue-600 mb-8">
                More than 14,365 men reported that BlueDrops:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {content.benefits.map((benefit, index) => {
                const icons = [TrendingUp, Zap, Heart, Users, Award, Star];
                const IconComponent = icons[index % icons.length];
                
                return (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-gray-800 font-medium">{benefit}</p>
                  </div>
                );
              })}
            </div>

            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                All of this makes none of them want to stop taking BlueDrops, even after overcoming erectile dysfunction.
              </p>
              <p className="text-xl font-bold text-red-600">
                All of them would give anything to have access to this exclusive discount that I'm offering only to you.
              </p>
            </div>
          </div>

          {/* Final Offer Section */}
          <div className="mb-12 animate-fadeInUp animation-delay-1000">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                That's why I'm giving you one more chance... And this time, it's even better.
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                Only here, on this page, and while our stocks last...
              </p>
            </div>

            {/* Product Offer Card */}
            <div className="relative max-w-2xl mx-auto">
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 rounded-3xl blur-lg opacity-60 animate-pulse"></div>
              
              <div className="relative bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-8 text-white shadow-2xl">
                {/* Best Deal Badge */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-400 text-black px-6 py-2 rounded-full font-black text-sm shadow-lg">
                    🔥 BEST & BIGGEST DISCOUNT EVER
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-4">
                  {/* Product Image */}
                  <div className="text-center">
                    <img 
                      src={content.productImage}
                      alt="BlueDrops Package"
                      className="w-64 h-auto mx-auto drop-shadow-2xl"
                    />
                  </div>

                  {/* Offer Details */}
                  <div className="text-center lg:text-left">
                    <h4 className="text-3xl font-black mb-4">
                      {content.finalOffer.title}
                    </h4>
                    
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 mb-6">
                      <p className="text-2xl font-bold mb-2">
                        {content.finalOffer.subtitle}
                      </p>
                      <p className="text-lg opacity-90">
                        You won't see anything like this at any other time...
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-yellow-400" />
                        <span>180-Day Money-Back Guarantee</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-yellow-400" />
                        <span>Free Worldwide Shipping</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <span>Limited Time Offer</span>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <button 
                      onClick={handleAccept}
                      className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-black font-black py-4 px-6 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg border-2 border-white/40 checkout-button"
                    >
                      🚀 CLAIM YOUR {content.finalOffer.totalBottles} NOW
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="mb-12 animate-fadeInUp animation-delay-1200">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              What Our Customers Are Saying:
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content.testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">
                        {testimonial.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-sm text-gray-600">{testimonial.location}</p>
                    </div>
                    <div className="ml-auto">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <blockquote className="text-gray-700 italic leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA Section */}
          <div className="text-center mb-12 animate-fadeInUp animation-delay-1400">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Take advantage of this unique opportunity
              </h3>
              <p className="text-lg text-gray-700 mb-6">
                And, like them, start enjoying a vibrant and powerful sex life.
              </p>
              <p className="text-xl font-bold text-red-600 mb-8">
                Remember: this discount will never appear for you again.
              </p>

              {/* Final CTA Button */}
              <button 
                onClick={handleAccept}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-black py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg border-2 border-white/40 checkout-button mb-6"
              >
                🎯 YES - CLAIM MY {content.finalOffer.totalBottles}
              </button>

              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>100% Satisfaction Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-500" />
                  <span>Free Shipping</span>
                </div>
              </div>
            </div>
          </div>

          {/* Final Message */}
          <div className="text-center mb-8 animate-fadeInUp animation-delay-1600">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <p className="text-lg font-medium text-gray-800 mb-4">
                I'll leave it here.
              </p>
              <p className="text-lg font-medium text-blue-600">
                Take care!
              </p>
            </div>
          </div>

          {/* Reject Button */}
          <div className="text-center animate-fadeInUp animation-delay-1800">
            <button 
              onClick={handleReject}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors border border-gray-300 checkout-button"
            >
              No, thanks
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};