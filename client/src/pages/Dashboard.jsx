import React, { useState, useEffect } from 'react';
import { Home, BookOpen, Tag, User, ChevronRight, Menu, X } from 'lucide-react';

// Mock Auth Context (replace with your actual context)
const useAuth = () => ({
  user: {
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "user",
    createdAt: "2024-01-15T10:30:00Z"
  },
  logout: () => console.log("Logout")
});

// Daily meditation quotes
const dailyQuotes = [
  {
    text: "Feel less stressed and more mindful with meditation. Discover peace, balance, and renewed energy every day.",
    author: "Mindfulness Practice"
  },
  {
    text: "Peace comes from within. Do not seek it without.",
    author: "Buddha"
  },
  {
    text: "The present moment is filled with joy and happiness. If you are attentive, you will see it.",
    author: "Thích Nhất Hạnh"
  },
  {
    text: "Meditation is not about stopping thoughts, but recognizing that we are more than our thoughts and our feelings.",
    author: "Arianna Huffington"
  },
  {
    text: "In today's rush, we all think too much — seek too much — want too much — and forget about the joy of just being.",
    author: "Eckhart Tolle"
  }
];

// Navigation Component
const Navigation = ({ activeTab, setActiveTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'pricing', label: 'Pricing', icon: Tag },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm sm:text-lg">Om</span>
            </div>
            <span className="text-lg sm:text-xl font-semibold text-gray-800">Omazing</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2 animate-fade-in">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 transition-all ${
                    activeTab === item.id
                      ? 'bg-gray-900 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Mobile Navigation Bar (Fixed) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="grid grid-cols-4 gap-1 px-2 py-2 safe-area-bottom">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 active:bg-gray-100'
                }`}
              >
                <Icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

// Welcome Section Component
const WelcomeSection = ({ userName }) => {
  return (
    <div className="mb-6 sm:mb-8">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
        Welcome, {userName ? userName.split(' ')[0] : 'Guest'}.
      </h1>
      <p className="text-base sm:text-lg text-gray-600">Find your next session below</p>
    </div>
  );
};

// Daily Quote Component
const DailyQuote = ({ quote }) => {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 md:p-8 mb-6 sm:mb-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full -mr-12 sm:-mr-16 -mt-12 sm:-mt-16 opacity-50"></div>
      <div className="relative flex items-start space-x-4 sm:space-x-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Daily Meditation</h2>
          <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed mb-2">
            {quote.text}
          </p>
          {quote.author !== "Mindfulness Practice" && (
            <p className="text-gray-500 italic text-sm sm:text-base">— {quote.author}</p>
          )}
        </div>
        <div className="hidden sm:block flex-shrink-0">
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 border-4 border-white shadow-lg"></div>
        </div>
      </div>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ category, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6 hover:shadow-md active:scale-95 transition-all cursor-pointer group"
    >
      <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
        <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-purple-200 transition-all flex-shrink-0">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0 w-full">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1 truncate">{category.name}</h3>
          <p className="text-xs sm:text-sm text-gray-500">{category.count} courses</p>
        </div>
      </div>
    </div>
  );
};

// Content Card Component
const ContentCard = ({ content, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md active:scale-98 transition-all cursor-pointer group"
    >
      <div className="flex items-center p-3 sm:p-4 space-x-3 sm:space-x-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1 group-hover:text-purple-600 transition-colors line-clamp-1">
            {content.title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{content.description}</p>
        </div>
        <div className="flex-shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden">
            <img
              src={content.image}
              alt={content.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Section Header Component
const SectionHeader = ({ title, onSeeAll }) => {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-5 md:mb-6">
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 active:text-gray-900 transition-colors flex-shrink-0"
        >
          <span className="text-xs sm:text-sm font-medium">See all</span>
          <ChevronRight size={16} className="sm:w-4 sm:h-4" />
        </button>
      )}
    </div>
  );
};

// Video Carousel Component
const VideoCarousel = ({ videos }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoPlaying || videos.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, videos.length]);

  const extractYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
    setIsAutoPlaying(false);
  };

  if (!videos || videos.length === 0) return null;

  return (
    <section className="mb-8 sm:mb-10 md:mb-12">
      <SectionHeader 
        title="Featured Videos" 
        onSeeAll={() => console.log('See all videos')} 
      />
      
      <div className="relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Video Container */}
        <div className="relative aspect-video bg-gray-900 overflow-hidden">
          {/* Videos */}
          <div 
            className="flex transition-transform duration-500 ease-out h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {videos.map((video, index) => {
              const videoId = extractYouTubeId(video.url);
              return (
                <div key={video._id || index} className="w-full flex-shrink-0 relative">
                  {videoId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?modestbranding=1&rel=0`}
                      title={video.title}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white">
                      <p>Invalid video URL</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          {videos.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all backdrop-blur-sm z-10"
                aria-label="Previous video"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 sm:p-3 rounded-full transition-all backdrop-blur-sm z-10"
                aria-label="Next video"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Video Info */}
        <div className="p-4 sm:p-5 md:p-6">
          <h3 className="font-bold text-gray-900 text-base sm:text-lg md:text-xl mb-2">
            {videos[currentIndex]?.title}
          </h3>
          {videos[currentIndex]?.description && (
            <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-2">
              {videos[currentIndex].description}
            </p>
          )}

          {/* Dots Navigation */}
          {videos.length > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              {videos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all rounded-full ${
                    index === currentIndex
                      ? 'w-8 h-2 bg-purple-600'
                      : 'w-2 h-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to video ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [dailyQuote, setDailyQuote] = useState(dailyQuotes[0]);
  const [categories, setCategories] = useState([]);
  const [recommendedContent, setRecommendedContent] = useState([]);
  const [meditationMusic, setMeditationMusic] = useState([]);
  const [courses, setCourses] = useState([]);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get random daily quote on mount
  useEffect(() => {
    const randomQuote = dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)];
    setDailyQuote(randomQuote);
  }, []);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch courses for categories (using course categories as content categories)
        const coursesRes = await fetch('/api/courses?limit=6');
        const coursesData = await coursesRes.json();
        
        if (coursesData.success) {
          setCourses(coursesData.data);
          
          // Create categories from course data
          const categoryMap = new Map();
          coursesData.data.forEach(course => {
            const cat = course.category;
            if (!categoryMap.has(cat)) {
              categoryMap.set(cat, {
                name: formatCategoryName(cat),
                count: 1,
                image: course.thumbnail || 'https://via.placeholder.com/100'
              });
            } else {
              categoryMap.get(cat).count++;
            }
          });
          
          setCategories(Array.from(categoryMap.values()).slice(0, 6));
        }

        // Fetch recommended content (audio content)
        const contentRes = await fetch('/api/content/public?type=audio&limit=3');
        const contentData = await contentRes.json();
        
        if (contentData.success) {
          setRecommendedContent(contentData.data.map(item => ({
            title: item.title,
            description: item.description || 'Practice mindfulness',
            image: item.storage?.url || 'https://via.placeholder.com/100'
          })));
        }

        // Fetch meditation music (audio content from music category)
        const musicRes = await fetch('/api/content/public?type=audio&category=music&limit=3');
        const musicData = await musicRes.json();
        
        if (musicData.success) {
          setMeditationMusic(musicData.data.map(item => ({
            title: item.title,
            description: item.description || 'Calm your mind and body',
            image: item.storage?.url || 'https://via.placeholder.com/100'
          })));
        }

      } catch (error) {
        console.error('Error fetching data:', error);
        // Set fallback data
        setCategories([
          { name: 'Focus', count: 32, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=100&h=100&fit=crop' },
          { name: 'Body Scan', count: 18, image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=100&h=100&fit=crop' },
          { name: 'Sleep', count: 25, image: 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?w=100&h=100&fit=crop' },
          { name: 'Relax', count: 20, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' },
          { name: 'Calm', count: 12, image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=100&h=100&fit=crop' },
          { name: 'Energy', count: 22, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop' }
        ]);
        
        setRecommendedContent([
          { title: 'Mindfulness', description: 'Practice and develop mindfulness', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=100&h=100&fit=crop' },
          { title: 'Relaxing Sounds', description: 'Calm your mind and body', image: 'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?w=100&h=100&fit=crop' },
          { title: 'Focus Booster', description: 'Improve your attention span', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=100&h=100&fit=crop' }
        ]);
        
        setMeditationMusic([
          { title: 'Deep Sleep', description: 'Sleep better with guided sessions', image: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=100&h=100&fit=crop' },
          { title: 'Focus Boost', description: 'Increase concentration with sounds', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=100&h=100&fit=crop' },
          { title: 'Morning Energy', description: 'Kickstart your day with clarity', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCategoryName = (category) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Welcome Section */}
        <WelcomeSection userName={user?.name} />

        {/* Daily Quote */}
        <DailyQuote quote={dailyQuote} />

        {/* Explore by Categories */}
        <section className="mb-8 sm:mb-10 md:mb-12">
          <SectionHeader 
            title="Explore by Categories" 
            onSeeAll={() => console.log('See all categories')} 
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((category, index) => (
              <CategoryCard
                key={index}
                category={category}
                onClick={() => console.log('Category clicked:', category.name)}
              />
            ))}
          </div>
        </section>

        {/* Recommended for You */}
        <section className="mb-8 sm:mb-10 md:mb-12">
          <SectionHeader 
            title="Recommended for You" 
            onSeeAll={() => console.log('See all recommendations')} 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {recommendedContent.map((content, index) => (
              <ContentCard
                key={index}
                content={content}
                onClick={() => console.log('Content clicked:', content.title)}
              />
            ))}
          </div>
        </section>

        {/* Meditation Music for You */}
        <section className="mb-8 sm:mb-10 md:mb-12">
          <SectionHeader 
            title="Meditation Music for You" 
            onSeeAll={() => console.log('See all music')} 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {meditationMusic.map((music, index) => (
              <ContentCard
                key={index}
                content={music}
                onClick={() => console.log('Music clicked:', music.title)}
              />
            ))}
          </div>
        </section>

        {/* Mindful Courses */}
        <section className="mb-8 sm:mb-10 md:mb-12">
          <SectionHeader 
            title="Mindful Courses" 
            onSeeAll={() => setActiveTab('courses')} 
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {courses.slice(0, 3).map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md active:scale-98 transition-all cursor-pointer group"
              >
                <div className="aspect-video w-full overflow-hidden bg-gray-100">
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/400x225'}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-2 group-hover:text-purple-600 transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2.5 sm:px-3 py-1 rounded-full truncate flex-1 min-w-0">
                      {formatCategoryName(course.category)}
                    </span>
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                      {course.pricing?.type === 'free' ? 'Free' : `$${course.pricing?.amount}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-in-out;
        }
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0.5rem);
        }
        .active\:scale-95:active {
          transform: scale(0.95);
        }
        .active\:scale-98:active {
          transform: scale(0.98);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;