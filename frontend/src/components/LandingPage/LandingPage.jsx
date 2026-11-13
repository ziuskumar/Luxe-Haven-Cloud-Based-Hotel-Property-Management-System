import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ChevronDown,
  Calendar,
  Users,
  ShieldCheck,
  Award,
  Coffee,
  Waves,
  Utensils,
  Wifi,
  Clock,
  Compass,
  ArrowRight,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  Star,
} from "lucide-react";

export default function LandingPage({
  user,
  onOpenAuthModal,
  onExploreRooms,
  onBookNow,
  onGoToDashboard,
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-bone-canvas text-midnight-ink font-sans selection:bg-voltage-lime selection:text-midnight-ink scroll-smooth">
      {/* =========================================================================
          NAVIGATION: Transparent over hero, sticky solid blur upon scrolling
          ========================================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-midnight-ink/95 backdrop-blur-md shadow-lg py-3 text-white border-b border-cement-gray/20"
            : "bg-gradient-to-b from-black/70 via-black/30 to-transparent py-5 text-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-full bg-voltage-lime flex items-center justify-center text-midnight-ink font-black shadow-md transition group-hover:scale-105">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight font-display uppercase block leading-none">
                LUXE HAVEN
              </span>
              <span className="text-[9px] uppercase tracking-[0.25em] text-slate-300 font-bold block mt-1">
                Resort & Retreat
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold tracking-wider uppercase">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-slate-200 hover:text-voltage-lime transition"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("rooms")}
              className="text-slate-200 hover:text-voltage-lime transition"
            >
              Rooms
            </button>
            <button
              onClick={() => scrollToSection("experience")}
              className="text-slate-200 hover:text-voltage-lime transition"
            >
              Experience
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="text-slate-200 hover:text-voltage-lime transition"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-slate-200 hover:text-voltage-lime transition"
            >
              Contact
            </button>
          </nav>

          {/* Header Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <button
                onClick={onGoToDashboard}
                className="btn-lime text-xs px-5 py-2.5 font-bold shadow-md hover:scale-105 transition"
              >
                Go to PMS Dashboard
              </button>
            ) : (
              <>
                <button
                  onClick={onOpenAuthModal}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-200 hover:text-white transition"
                >
                  Login
                </button>
                <button
                  onClick={onBookNow}
                  className="btn-lime text-xs px-5 py-2.5 font-bold shadow-md hover:scale-105 transition"
                >
                  Book Your Stay
                </button>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-midnight-ink/98 border-t border-cement-gray/20 px-6 py-6 space-y-4 animate-in slide-in-from-top-4">
            <nav className="flex flex-col gap-4 text-sm font-bold uppercase tracking-wider text-slate-200">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  setMobileMenuOpen(false);
                }}
                className="text-left hover:text-voltage-lime transition"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("rooms")}
                className="text-left hover:text-voltage-lime transition"
              >
                Rooms
              </button>
              <button
                onClick={() => scrollToSection("experience")}
                className="text-left hover:text-voltage-lime transition"
              >
                Experience
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-left hover:text-voltage-lime transition"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-left hover:text-voltage-lime transition"
              >
                Contact
              </button>
            </nav>
            <div className="pt-4 border-t border-cement-gray/20 flex flex-col gap-2.5">
              {user ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGoToDashboard?.();
                  }}
                  className="btn-lime w-full py-3 text-xs font-bold justify-center"
                >
                  Open PMS Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAuthModal?.();
                    }}
                    className="w-full py-2.5 rounded-full text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onBookNow?.();
                    }}
                    className="btn-lime w-full py-3 text-xs font-bold justify-center"
                  >
                    Book Your Stay
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          HERO SECTION: Full Viewport 100vh with Exact Infinity Pool Resort Image
          ========================================================================= */}
      <section
        id="hero"
        className="relative min-h-[95vh] lg:min-h-screen w-full flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1776761731066-c89caa8d25e6?auto=format&fit=crop&fm=jpg&q=85&w=2400')`,
        }}
      >
        {/* Dark transparent overlay for text readability while keeping photograph dominant */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/60 pointer-events-none" />

        {/* Ambient Top Vignette */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white py-24 sm:py-32 space-y-6 animate-in fade-in zoom-in-95 duration-500">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-voltage-lime text-xs font-black uppercase tracking-[0.25em]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXPERIENCE EXCEPTIONAL HOSPITALITY</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight font-display leading-[1.05] drop-shadow-lg text-white">
            Where Luxury Meets Comfort.
          </h1>

          {/* Supporting Text */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-slate-200 font-medium leading-relaxed drop-shadow-md">
            Discover thoughtfully designed spaces, exceptional comfort, and memorable experiences at Luxe Haven.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => scrollToSection("rooms")}
              className="btn-lime w-full sm:w-auto text-sm sm:text-base px-8 py-4 font-black uppercase tracking-wider shadow-2xl transition hover:scale-105"
            >
              Explore Our Rooms
            </button>
            <button
              onClick={onBookNow}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm sm:text-base font-bold text-white bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 transition hover:scale-105 shadow-xl"
            >
              <span>Book Your Stay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          onClick={() => scrollToSection("rooms")}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-slate-300 hover:text-voltage-lime cursor-pointer transition select-none animate-bounce"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.25em]">Scroll to Explore</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/40 flex items-start justify-center p-1.5 backdrop-blur-sm bg-black/20">
            <div className="w-1.5 h-2.5 rounded-full bg-voltage-lime animate-pulse" />
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: DISCOVER YOUR STAY (Room Categories Showcase)
          ========================================================================= */}
      <section id="rooms" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-voltage-lime text-midnight-ink inline-block">
            ACCOMMODATIONS
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-midnight-ink tracking-tight font-display">
            Discover Your Stay
          </h2>
          <p className="text-sm sm:text-base text-slate-mute font-medium leading-relaxed">
            Every suite is carefully curated for tranquil panoramic views, bespoke furnishings, intuitive cloud climate control, and unmatched rest.
          </p>
        </div>

        {/* Room Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Luxury Suite (Requested exact image) */}
          <div className="card-plaster p-0 overflow-hidden group hover:translate-y-[-4px] transition duration-300 flex flex-col">
            <div className="relative h-64 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1777180249046-abf7d640e0d9?auto=format&fit=crop&fm=jpg&q=85&w=2000"
                alt="Grand Hillside Luxury Suite"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-4 left-4 bg-midnight-ink/80 backdrop-blur-sm text-voltage-lime text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Signature Suite
              </div>
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-midnight-ink text-xs font-black font-mono px-3 py-1 rounded-full shadow">
                $450 <span className="text-[10px] text-slate-mute font-sans font-medium">/ night</span>
              </div>
            </div>
            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xl font-black text-midnight-ink font-display tracking-tight">
                  Grand Infinity Luxury Suite
                </h3>
                <p className="text-xs text-slate-mute mt-1.5 leading-relaxed line-clamp-2">
                  Expansive hillside panoramas with private heated balcony spa, king bedding, and 24-hour dedicated butler service.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-midnight-ink font-bold pt-2 border-t border-cement-gray/50">
                <span className="px-2.5 py-1 rounded-full bg-bone-canvas flex items-center gap-1">
                  <Users className="w-3 h-3 text-cobalt-signal" /> 3 Guests
                </span>
                <span className="px-2.5 py-1 rounded-full bg-bone-canvas flex items-center gap-1">
                  <Waves className="w-3 h-3 text-cobalt-signal" /> Infinity View
                </span>
                <span className="px-2.5 py-1 rounded-full bg-bone-canvas flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-cobalt-signal" /> Starlink Wi-Fi
                </span>
              </div>

              <button
                onClick={onBookNow}
                className="btn-lime w-full py-3 text-xs font-black uppercase tracking-wider justify-center mt-2"
              >
                Reserve This Suite
              </button>
            </div>
          </div>

          {/* Card 2: Hotel Room (Requested exact image) */}
          <div className="card-plaster p-0 overflow-hidden group hover:translate-y-[-4px] transition duration-300 flex flex-col">
            <div className="relative h-64 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1776763018821-8feeaeeee0a5?auto=format&fit=crop&fm=jpg&q=85&w=2000"
                alt="Executive Deluxe Room"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-4 left-4 bg-midnight-ink/80 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Deluxe Collection
              </div>
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-midnight-ink text-xs font-black font-mono px-3 py-1 rounded-full shadow">
                $280 <span className="text-[10px] text-slate-mute font-sans font-medium">/ night</span>
              </div>
            </div>
            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xl font-black text-midnight-ink font-display tracking-tight">
                  Executive Courtyard Deluxe
                </h3>
                <p className="text-xs text-slate-mute mt-1.5 leading-relaxed line-clamp-2">
                  Artisan oak finishes, Italian travertine rain showers, plush queen bedding, and tranquil garden courtyard outlooks.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-midnight-ink font-bold pt-2 border-t border-cement-gray/50">
                <span className="px-2.5 py-1 rounded-full bg-bone-canvas flex items-center gap-1">
                  <Users className="w-3 h-3 text-cobalt-signal" /> 2 Guests
                </span>
                <span className="px-2.5 py-1 rounded-full bg-bone-canvas flex items-center gap-1">
                  <Coffee className="w-3 h-3 text-cobalt-signal" /> Espresso Bar
                </span>
                <span className="px-2.5 py-1 rounded-full bg-bone-canvas flex items-center gap-1">
                  <Award className="w-3 h-3 text-cobalt-signal" /> Travertine Bath
                </span>
              </div>

              <button
                onClick={onBookNow}
                className="btn-black w-full py-3 text-xs font-black uppercase tracking-wider justify-center mt-2"
              >
                Reserve This Room
              </button>
            </div>
          </div>

          {/* Card 3: Presidential Cliffside Villa */}
          <div className="card-plaster p-0 overflow-hidden group hover:translate-y-[-4px] transition duration-300 flex flex-col md:col-span-2 lg:col-span-1">
            <div className="relative h-64 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&fm=jpg&q=85&w=2000"
                alt="Presidential Cliffside Villa"
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute top-4 left-4 bg-voltage-lime text-midnight-ink text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Ultra Luxury Villa
              </div>
              <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-midnight-ink text-xs font-black font-mono px-3 py-1 rounded-full shadow">
                $650 <span className="text-[10px] text-slate-mute font-sans font-medium">/ night</span>
              </div>
            </div>
            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-xl font-black text-midnight-ink font-display tracking-tight">
                  Presidential Cliffside Villa
                </h3>
                <p className="text-xs text-slate-mute mt-1.5 leading-relaxed line-clamp-2">
                  Dual master bedrooms with a private infinity plunge pool, open-concept lounge, and panoramic 360-degree sunset terraces.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-midnight-ink font-bold pt-2 border-t border-cement-gray/50">
                <span className="px-2.5 py-1 rounded-full bg-bone-canvas flex items-center gap-1">
                  <Users className="w-3 h-3 text-cobalt-signal" /> 4 Guests
                </span>
                <span className="px-2.5 py-1 rounded-full bg-bone-canvas flex items-center gap-1">
                  <Waves className="w-3 h-3 text-cobalt-signal" /> Private Plunge Pool
                </span>
                <span className="px-2.5 py-1 rounded-full bg-bone-canvas flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cobalt-signal" /> VIP Security
                </span>
              </div>

              <button
                onClick={onBookNow}
                className="btn-lime w-full py-3 text-xs font-black uppercase tracking-wider justify-center mt-2"
              >
                Reserve This Villa
              </button>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <button
            onClick={onExploreRooms}
            className="btn-ghost text-xs font-bold text-midnight-ink hover:text-voltage-lime inline-flex items-center gap-2 group"
          >
            <span>View All Available Rooms & Dynamic Seasonal Rates</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </button>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: THE LUXE EXPERIENCE (Feature Panel with Exact Image)
          ========================================================================= */}
      <section id="experience" className="py-20 sm:py-28 bg-midnight-ink text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-voltage-lime text-midnight-ink inline-block">
              WORLD-CLASS HOSPITALITY
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight font-display">
              The Luxe Experience
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
              Immerse yourself in exceptional architectural design, personalized concierge hospitality, and holistic rejuvenation nestled along pristine hillside slopes.
            </p>
          </div>

          {/* Visual Feature Panel Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Visual Feature Image (Requested Exact Image) */}
            <div className="lg:col-span-7 relative group">
              <div className="rounded-[32px] overflow-hidden shadow-2xl border border-white/10 aspect-[16/10]">
                <img
                  src="https://images.unsplash.com/photo-1781511816247-006884d259e1?auto=format&fit=crop&fm=jpg&q=85&w=2400"
                  alt="The Luxe Haven Experience & Architecture"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 sm:bottom-6 sm:right-6 bg-black/85 backdrop-blur-md p-5 rounded-2xl border border-white/15 max-w-xs shadow-2xl hidden sm:block">
                <div className="flex items-center gap-1 text-voltage-lime mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-voltage-lime" />
                  ))}
                </div>
                <div className="text-xs font-bold text-white">Hillside Infinity & Wellness</div>
                <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                  Recognized by Global Hospitality Awards for architectural serenity and sensory design.
                </p>
              </div>
            </div>

            {/* Experience Amenities Checklist */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-voltage-lime/40 transition space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-voltage-lime/20 text-voltage-lime flex items-center justify-center font-bold">
                    <Waves className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white font-display">Hillside Infinity Pools</h4>
                    <span className="text-[11px] text-voltage-lime font-bold">Heated Mineral Spring Water</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-13">
                  Sunken cliffside lounges with uninterrupted valley horizon views, private daybeds, and beverage service.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-voltage-lime/40 transition space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cobalt-signal/20 text-cobalt-signal flex items-center justify-center font-bold">
                    <Utensils className="w-5 h-5 text-sky-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white font-display">Michelin-Inspired Gastronomy</h4>
                    <span className="text-[11px] text-sky-400 font-bold">Farm-to-Table Seasonal Menus</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-13">
                  Artisanal regional ingredients paired with curated cellar selections overseen by our resident sommeliers.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-voltage-lime/40 transition space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-voltage-lime/20 text-voltage-lime flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-black text-white font-display">Digital Keyless PMS Check-in</h4>
                    <span className="text-[11px] text-voltage-lime font-bold">Instant Mobile Arrival & Departure</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed pl-13">
                  Direct digital key issuance, zero front-desk queueing, and immediate sequential invoice generation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: ABOUT & GUEST VALUES
          ========================================================================= */}
      <section id="about" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-forest-depth text-white inline-block">
              OUR HERITAGE
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-midnight-ink tracking-tight font-display leading-tight">
              An Oasis Crafted for Modern Serenity.
            </h2>
            <p className="text-sm sm:text-base text-slate-mute font-medium leading-relaxed">
              Founded on the belief that travel should be both rejuvenating and effortless, Luxe Haven harmonizes cliffside modernist architecture with personalized, tech-forward hospitality.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-plaster-white border border-cement-gray/60 space-y-1">
                <div className="text-2xl font-black text-midnight-ink font-mono">100%</div>
                <div className="text-xs font-bold text-slate-mute">Direct Booking Guarantee</div>
              </div>
              <div className="p-4 rounded-2xl bg-plaster-white border border-cement-gray/60 space-y-1">
                <div className="text-2xl font-black text-midnight-ink font-mono">0 Queue</div>
                <div className="text-xs font-bold text-slate-mute">Keyless Digital Check-in</div>
              </div>
            </div>
          </div>

          <div className="card-plaster p-8 sm:p-10 space-y-5 bg-gradient-to-br from-white to-bone-canvas">
            <h3 className="text-xl font-black text-midnight-ink font-display">
              Why Guests Choose Direct Booking:
            </h3>
            <ul className="space-y-3.5 text-xs font-semibold text-midnight-ink">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-forest-depth flex-shrink-0 mt-0.5" />
                <span>Best rate promise with transparent dynamic pricing and zero surprise resort fees.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-forest-depth flex-shrink-0 mt-0.5" />
                <span>Complimentary flexible early check-in (from 1:00 PM) based on live room readiness.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-forest-depth flex-shrink-0 mt-0.5" />
                <span>Automated sequential GST tax invoice sent immediately upon checkout.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-forest-depth flex-shrink-0 mt-0.5" />
                <span>Dedicated concierge WhatsApp messaging before and during your stay.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: READY FOR YOUR NEXT STAY? (Full-Width Call to Action)
          ========================================================================= */}
      <section className="py-20 sm:py-28 bg-midnight-ink relative overflow-hidden text-center text-white">
        {/* Subtle decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-voltage-lime/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-voltage-lime text-xs font-black uppercase tracking-widest border border-white/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RESERVE TODAY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight font-display">
            Make Your Next Stay Extraordinary.
          </h2>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 font-normal leading-relaxed">
            Experience our cliffside infinity pools, Michelin-inspired seasonal dining, and serene architectural suites. Your reservation is backed by our direct best rate promise.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onBookNow}
              className="btn-lime w-full sm:w-auto text-sm sm:text-base px-10 py-4 font-black uppercase tracking-wider shadow-2xl transition hover:scale-105"
            >
              Reserve Your Stay
            </button>
            <button
              onClick={onOpenAuthModal}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm sm:text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition hover:scale-105"
            >
              <span>Guest Member Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-voltage-lime" /> Best Rate Guaranteed
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-voltage-lime" /> Instant Confirmation
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-voltage-lime" /> 24-Hour Cancellation Option
            </span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FOOTER: Five-Star Brand Footer
          ========================================================================= */}
      <footer id="contact" className="bg-black text-slate-400 py-16 border-t border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand Column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-white">
                <div className="w-7 h-7 rounded-full bg-voltage-lime flex items-center justify-center text-midnight-ink font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-black text-lg tracking-tight uppercase font-display">LUXE HAVEN</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Where luxury meets comfort. A cloud-native hospitality destination engineered for discerning travelers.
              </p>
              <div className="pt-2 text-[11px] text-slate-500 font-mono">
                GST HSN: 9963 &bull; Hotel PMS Engine v2.0
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Quick Links</h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button onClick={() => scrollToSection("rooms")} className="hover:text-white transition">
                    Rooms & Suites
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("experience")} className="hover:text-white transition">
                    The Luxe Experience
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection("about")} className="hover:text-white transition">
                    Our Heritage & Values
                  </button>
                </li>
                <li>
                  <button onClick={onOpenAuthModal} className="hover:text-white transition">
                    Staff & Guest Portal
                  </button>
                </li>
              </ul>
            </div>

            {/* Concierge & Contact */}
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Resort Concierge</h4>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-voltage-lime" />
                  <span>+1 (800) 589-3428</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-voltage-lime" />
                  <span>concierge@luxehaven.com</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-voltage-lime flex-shrink-0 mt-0.5" />
                  <span>Cliffside Reserve, Valley Overlook 401, Pacific Coast</span>
                </li>
              </ul>
            </div>

            {/* Stay Guidelines */}
            <div className="space-y-3">
              <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Stay Guidelines</h4>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Check-in:</span>
                  <span className="text-white font-bold">3:00 PM onwards</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Check-out:</span>
                  <span className="text-white font-bold">11:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Reception:</span>
                  <span className="text-voltage-lime font-bold">24 / 7 Live Desk</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>&copy; {new Date().getFullYear()} Luxe Haven Resort & Property Management System. All rights reserved.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="hover:text-white">
                Back to Top ↑
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
