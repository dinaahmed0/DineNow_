import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import Hero from "../hero/Hero";
import MainSlider from "../mainslider/MainSlider";
import FAQSection from "../faqsection/FAQSection";
import MobileAppBanner from "../mobileappbanner/MobileAppBanner";
import UserReviewsSpotlight from "../userreviewsspotlight/UserReviewsSpotlight";
import Footer from "../footer/Footer";

export default function Home() {
  const location = useLocation();
  const toastShownRef = useRef(false); // Track if toast has been shown

  useEffect(() => {
    // Check if we have a toast message and it hasn't been shown yet
    if (location.state?.showWelcomeToast && !toastShownRef.current) {
      toastShownRef.current = true; // Mark as shown
      
      toast.success(location.state.message || "Login successful! Welcome back! 🎉", {
        duration: 5000,
        position: 'top-center',
        icon: '👋',
        style: {
          background: '#6B8A62',
          color: '#fff',
          fontWeight: '500',
          padding: '16px',
          borderRadius: '12px',
        },
      });
      
      // Clear the state so toast doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  return (
    <>
      <Hero />
      <MainSlider />
      <UserReviewsSpotlight />
      <FAQSection />
      <MobileAppBanner/>
      <Footer />
    </>
  );
}