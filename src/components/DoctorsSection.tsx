import React, { useEffect, useState, useRef } from 'react';
import { Shield, Play } from 'lucide-react';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  affiliation: string;
  testimonial: string;
  profileImage: string;
  videoId: string; // VTurb video ID for testimonial
}

export const DoctorsSection: React.FC = () => {
  const [currentDoctor, setCurrentDoctor] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [lastMoveX, setLastMoveX] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState<{[key: string]: boolean}>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const doctors: Doctor[] = [
    {
      id: 1,
      name: "Dr. Mehmet Oz",
      specialty: "Cardiothoracic Surgeon, MD",
      affiliation: "Columbia University",
      testimonial: "BlueDrops represents a breakthrough in natural men's health. Simple ingredients, impressive results.",
      profileImage: "https://i.imgur.com/oM0Uyij.jpeg",
      videoId: "686778a578c1d68a67597d8c" // ✅ Dr. Oz VTurb video ID
    },
    {
      id: 2,
      name: "Dr. Steven Gundry",
      specialty: "Former Cardiac Surgeon, MD",
      affiliation: "Center for Restorative Medicine",
      testimonial: "Natural compounds like those in BlueDrops restore balance from within — exactly my philosophy.",
      profileImage: "https://i.imgur.com/z8WR0yL.jpeg",
      videoId: "68677941d890d9c12c549bbc" // REAL VTurb video ID - Dr. Gundry
    },
    {
      id: 3,
      name: "Dr. Rena Malik",
      specialty: "Urologist, MD",
      affiliation: "University of Maryland",
      testimonial: "BlueDrops offers men a promising natural alternative that supports both confidence and wellness.",
      profileImage: "https://i.imgur.com/iNaQpa5.jpeg",
      videoId: "68677d0e96c6c01dd66478a3" // REAL VTurb video ID - Dr. Rena Malik
    }
  ];

  // Rest of the code remains the same...

  return (
    <section className="mt-16 sm:mt-20 w-full max-w-5xl mx-auto px-4 animate-fadeInUp animation-delay-1400">
      {/* Section Header */}
      <div className="text-center mb-4">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-900 mb-2">
          <span className="block">Clinically Reviewed.</span>
          <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-600 bg-clip-text text-transparent block">
            Doctor Approved.
          </span>
        </h2>
        <p className="text-lg sm:text-xl text-blue-700 font-semibold">
          What Doctors Say About BlueDrops
        </p>
      </div>

      {/* Rest of the JSX remains the same... */}

    </section>
  );
};

// Rest of the components remain the same...