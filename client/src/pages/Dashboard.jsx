import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import VideoCarousel from '../components/VideoCarousel';
import TopNavBar from '../components/navigation/TopNavBar';
import MeditationTimer from '../components/MeditationTimer';
import { contentAPI } from '../api/content';
import { coursesAPI } from '../api/courses';
import { quotesAPI } from '../api/quotes';
import med1Image from '../assets/med1.png';

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

const formatCategoryName = (category) => {
  if (!category) return '';
  return category
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const WelcomeSection = ({ userName }) => {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? '🌅 Good Morning'
      : currentHour < 18
        ? '☀️ Good Afternoon'
        : '🌙 Good Evening';

  return (
    <div className="mb-8 sm:mb-10">
      <div className="text-sm sm:text-base text-violet-600 font-semibold mb-2">{greeting}</div>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent mb-2">
        Welcome back, {userName ? userName.split(' ')[0] : 'Friend'}
      </h1>
      <p className="text-base sm:text-lg text-gray-600">
        Your journey to mindfulness continues
      </p>
    </div>
  );
};

const DailyQuote = ({ quote }) => (
  <div className="relative group mb-8 sm:mb-10">
    <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 rounded-3xl blur-xl opacity-30 group-hover:opacity-40 transition-opacity"></div>
    <div className="relative bg-gradient-to-br from-violet-50 via-white to-purple-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border border-violet-100 overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-violet-200/30 to-purple-200/30 rounded-full -mr-16 sm:-mr-24 -mt-16 sm:-mt-24"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-tr from-pink-200/30 to-violet-200/30 rounded-full -ml-12 sm:-ml-16 -mb-12 sm:-mb-16"></div>
      <div className="relative flex items-start space-x-6">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Today's Wisdom
            </h2>
          </div>
          <p className="text-gray-700 text-base sm:text-lg md:text-xl leading-relaxed mb-3 font-light">
            "{quote.text}"
          </p>
          {quote.author !== "Mindfulness Practice" && (
            <p className="text-violet-600 font-medium text-sm sm:text-base">
              — {quote.author}
            </p>
          )}
        </div>
        <div className="hidden lg:block flex-shrink-0">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full shadow-2xl shadow-violet-500/40 overflow-hidden">
            <img
              src={med1Image}
              alt="Meditation"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const CategoryCard = ({ category, onClick }) => {
  const categoryEmojis = {
    meditation: '🧘',
    music: '🎵',
    nature_sounds: '🌿',
    guided_meditation: '🎧',
    breathing_exercises: '💨',
    yoga: '🤸',
    mindfulness: '✨',
    stress_relief: '😌',
    sleep: '😴',
    focus: '🎯',
    inspiration: '💫'
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-violet-100 p-5 sm:p-6 transition-all duration-300 cursor-pointer hover:-translate-y-1"
    >
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="text-4xl sm:text-5xl transform group-hover:scale-110 transition-transform">
          {categoryEmojis[category.id] || '🌸'}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 group-hover:text-violet-600 transition-colors">{category.name}</h3>
          <p className="text-sm text-gray-500">{category.count} items</p>
        </div>
      </div>
    </div>
  );
};

const ContentCard = ({ content, onClick }) => {
  const getContentIcon = (type) => {
    switch (type) {
      case 'audio': return '🎵';
      case 'video': return '🎥';
      case 'image': return '🖼️';
      default: return '📄';
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-violet-100 overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-1"
    >
      <div className="flex items-center p-4 sm:p-5 space-x-4">
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-400 rounded-xl blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
            {content.thumbnail ? (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-violet-100">
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                  <span className="text-3xl">{getContentIcon(content.type)}</span>
                </div>
              </div>
            ) : (
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-50 to-purple-50 border-2 border-violet-100">
                <span className="text-3xl sm:text-4xl">{getContentIcon(content.type)}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 group-hover:text-violet-600 transition-colors line-clamp-1">
            {content.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">{content.description || 'Discover peace and mindfulness'}</p>
          <div className="flex items-center space-x-2 mt-2 flex-wrap gap-1">
            {content.category && (
              <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                {formatCategoryName(content.category)}
              </span>
            )}
            {content.courseTitle && (
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                📚 {content.courseTitle}
              </span>
            )}
            {content.duration && (
              <span className="text-xs font-medium text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                ⏱️ {formatDuration(content.duration)}
              </span>
            )}
            {content.isFree && (
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                FREE
              </span>
            )}
            {content.isPreview && !content.isFree && (
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                PREVIEW
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ title, onSeeAll, icon }) => (
  <div className="flex items-center justify-between mb-6 sm:mb-7">
    <div className="flex items-center space-x-3">
      {icon && <span className="text-2xl">{icon}</span>}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
    </div>
    {onSeeAll && (
      <button
        onClick={onSeeAll}
        className="flex items-center space-x-1 text-violet-600 hover:text-violet-700 transition-colors group"
      >
        <span className="text-sm sm:text-base font-semibold">See all</span>
        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
      </button>
    )}
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dailyQuote, setDailyQuote] = useState(dailyQuotes[0]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [recommendedContent, setRecommendedContent] = useState([]);
  const [trendingContent, setTrendingContent] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchDailyQuote = async () => {
      try {
        const response = await quotesAPI.getDailyQuote();
        if (response.success && response.data) {
          setDailyQuote(response.data);
        } else {
          // Fallback to hardcoded quotes
          setDailyQuote(dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)]);
        }
      } catch (error) {
        console.error('Failed to fetch daily quote:', error);
        // Fallback to hardcoded quotes
        setDailyQuote(dailyQuotes[Math.floor(Math.random() * dailyQuotes.length)]);
      }
    };
    fetchDailyQuote();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [contentRes, coursesRes, allCoursesRes] = await Promise.all([
          contentAPI.getPublicContent({ limit: 20 }),
          coursesAPI.getAllCourses({ limit: 3, status: 'published' }),
          coursesAPI.getAllCourses({ limit: 50, status: 'published' }),
        ]);

        if (contentRes.success && contentRes.data) {
          const content = contentRes.data;
          const categoryMap = new Map();
          contentAPI.getCategories().forEach(cat => {
            const count = content.filter(item => item.category === cat).length;
            if (count > 0) {
              categoryMap.set(cat, {
                id: cat,
                name: formatCategoryName(cat),
                count,
              });
            }
          });
          setCategories(Array.from(categoryMap.values()).slice(0, 6));
          setTrendingContent(content.slice(-6).reverse());
        }

        let recommendedItems = [];
        if (allCoursesRes.success && allCoursesRes.data) {
          const allCourses = allCoursesRes.data;
          const allLessons = [];
          allCourses.forEach(course => {
            course.modules?.forEach(module => {
              module.lessons?.forEach(lesson => {
                if (
                  (lesson.content?.type === 'video' || lesson.content?.type === 'audio') &&
                  (lesson.isPreview || course.pricing?.type === 'free')
                ) {
                  allLessons.push({
                    _id: lesson._id,
                    title: lesson.title,
                    description: lesson.description || course.shortDescription || course.description,
                    type: lesson.content.type,
                    category: course.category,
                    thumbnail: course.thumbnail,
                    duration: lesson.duration,
                    courseTitle: course.title,
                    courseId: course._id,
                    isPreview: lesson.isPreview,
                    isFree: course.pricing?.type === 'free',
                  });
                }
              });
            });
          });
          recommendedItems = allLessons.sort(() => 0.5 - Math.random()).slice(0, 6);
        }
        if (contentRes.success && contentRes.data && recommendedItems.length < 6) {
          const remainingSlots = 6 - recommendedItems.length;
          const additionalContent = contentRes.data.slice(0, remainingSlots).map(item => ({
            _id: item._id,
            title: item.title,
            description: item.description,
            type: item.type,
            category: item.category,
          }));
          recommendedItems = [...recommendedItems, ...additionalContent];
        }
        setRecommendedContent(recommendedItems.sort(() => 0.5 - Math.random()).slice(0, 3));

        if (coursesRes.success && coursesRes.data) {
          setCourses(coursesRes.data.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setCategories([
          { id: 'meditation', name: 'Meditation', count: 15 },
          { id: 'music', name: 'Music', count: 20 },
          { id: 'sleep', name: 'Sleep', count: 12 },
          { id: 'focus', name: 'Focus', count: 18 },
          { id: 'stress_relief', name: 'Stress Relief', count: 10 },
          { id: 'yoga', name: 'Yoga', count: 8 },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCategoryClick = category => navigate(`/content?category=${category.id}`);
  const handleContentClick = content => {
    if (content.courseId) navigate(`/courses/${content.courseId}`);
    else navigate(`/content/${content._id}`);
  };
  const handleCourseClick = course => navigate(`/courses/${course._id}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
        <TopNavBar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center h-96">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
              <div
                className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-400 rounded-full animate-spin"
                style={{
                  animationDirection: 'reverse',
                  animationDuration: '1s',
                }}
              />
            </div>
            <p className="mt-6 text-violet-600 font-medium">Loading your peaceful space...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 pb-24 md:pb-8">
      <TopNavBar />

      {/* Meditation Timer */}
      <MeditationTimer />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        <WelcomeSection userName={user?.name} />
        <DailyQuote quote={dailyQuote} />

        {recommendedContent.length > 0 && (
          <section className="mb-10 sm:mb-12 md:mb-16">
            <SectionHeader
              title="Recommended for You"
              icon="✨"
              onSeeAll={() => navigate('/content')}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {recommendedContent.map((content, index) => (
                <ContentCard
                  key={content._id || index}
                  content={content}
                  onClick={() => handleContentClick(content)}
                />
              ))}
            </div>
          </section>
        )}

        {categories.length > 0 && (
          <section className="mb-10 sm:mb-12 md:mb-16">
            <SectionHeader
              title="Browse by Category"
              icon="🌸"
              onSeeAll={() => navigate('/content')}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
              {categories.map((category, index) => (
                <CategoryCard
                  key={category.id || index}
                  category={category}
                  onClick={() => handleCategoryClick(category)}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mb-10 sm:mb-12 md:mb-16">
          <SectionHeader title="Featured Videos" icon="🎬" />
          <VideoCarousel />
        </section>

        {courses.length > 0 && (
          <section className="mb-10 sm:mb-12 md:mb-16">
            <SectionHeader
              title="Mindful Courses"
              icon="🧘"
              onSeeAll={() => navigate('/courses')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {courses.map(course => (
                <div
                  key={course._id}
                  onClick={() => handleCourseClick(course)}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl border border-violet-100 overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-2"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-violet-100 to-purple-100">
                    <img
                      src={
                        course.thumbnail ||
                        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop'
                      }
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-bold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full uppercase tracking-wide">
                        {formatCategoryName(course.category)}
                      </span>
                      <span className="text-lg font-bold text-gray-900">
                        {course.pricing?.type === 'free' ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `$${course.pricing?.amount || 0}`
                        )}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg sm:text-xl mb-2 group-hover:text-violet-600 transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {course.description || course.shortDescription}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>⭐ {course.metrics?.rating?.average?.toFixed(1) || '0.0'}</span>
                      <span>👥 {course.metrics?.enrollmentCount || 0} enrolled</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {trendingContent.length > 0 && (
          <section className="mb-10 sm:mb-12">
            <SectionHeader
              title="Trending Now"
              icon="🔥"
              onSeeAll={() => navigate('/content')}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {trendingContent.map((content, index) => (
                <ContentCard
                  key={content._id || index}
                  content={content}
                  onClick={() => handleContentClick(content)}
                />
              ))}
            </div>
          </section>
        )}

        <section className="mb-10 sm:mb-12">
          <SectionHeader title="Quick Access" icon="⚡" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <Link
              to="/content"
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-violet-100 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">📚</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 group-hover:text-violet-600 transition-colors">
                    Content Library
                  </h3>
                  <p className="text-sm text-gray-600">Explore all content</p>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" size={20} />
              </div>
            </Link>
            <Link
              to="/content?type=audio&category=music"
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-violet-100 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">🎵</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 group-hover:text-violet-600 transition-colors">
                    Meditation Music
                  </h3>
                  <p className="text-sm text-gray-600">Calming tracks</p>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" size={20} />
              </div>
            </Link>
            <Link
              to="/favorites"
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-violet-100 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">❤️</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 group-hover:text-violet-600 transition-colors">
                    Favorites
                  </h3>
                  <p className="text-sm text-gray-600">{user?.activities?.favoriteContent?.length || 0} saved</p>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" size={20} />
              </div>
            </Link>
            <Link
              to="/recently-played"
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-violet-100 p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">⏱️</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 group-hover:text-violet-600 transition-colors">
                    Recently Played
                  </h3>
                  <p className="text-sm text-gray-600">{user?.activities?.recentlyPlayed?.length || 0} items</p>
                </div>
                <ChevronRight className="text-gray-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" size={20} />
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

