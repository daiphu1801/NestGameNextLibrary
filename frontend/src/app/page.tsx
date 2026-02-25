'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/features/games/store/gameStore';
import { gameService } from '@/services/gameService';
import { Header } from '@/components/layout/Header';
import { FeaturedGames } from '@/components/game/FeaturedGames';
import { validateEnv } from '@/config/env';
import { Sparkles, Zap, Save, Play, Gamepad2, ArrowRight, Shield, Globe, Users, Star, Github, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { usePerformance } from '@/components/providers/PerformanceProvider';
import { Game } from '@/types';
import Link from 'next/link';

export default function LandingPage() {
  const router = useRouter();
  const { setGames, isLoading, filteredGames, allGames } = useGameStore();
  const { isLowPerformanceMode } = usePerformance();
  const { t } = useLanguage();

  const handleGameClick = (game: Game) => {
    router.push(`/games/${game.id}/play`);
  };

  useEffect(() => {
    validateEnv();
    const loadGames = async () => {
      const games = await gameService.loadGames();
      setGames(games);
    };
    loadGames();
  }, [setGames]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 relative">
          <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full" />
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto relative z-10" />
          <p className="text-base font-medium text-muted-foreground animate-pulse relative z-10 font-mono-tech uppercase tracking-wider">
            {t('game.loading')}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen text-foreground selection:bg-primary/30 relative">
      {/* Base background color */}
      <div className="fixed inset-0 bg-background -z-20" />

      <Header />

      {/* Background Effects - NEXUS Style */}
      {!isLowPerformanceMode && (
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div
            className="absolute -top-[400px] left-1/2 -translate-x-1/2 w-[1200px] h-[800px] animate-pulse"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.25) 0%, rgba(0, 212, 255, 0.1) 30%, transparent 70%)',
              filter: 'blur(40px)',
              animationDuration: '4s',
            }}
          />
          <div
            className="absolute top-[20%] -left-[200px] w-[500px] h-[500px] animate-float"
            style={{
              background: 'radial-gradient(circle, rgba(0, 245, 212, 0.15) 0%, transparent 60%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            className="absolute top-[40%] -right-[300px] w-[700px] h-[700px] animate-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(255, 0, 255, 0.18) 0%, rgba(139, 92, 246, 0.08) 40%, transparent 70%)',
              filter: 'blur(80px)',
              animationDuration: '5s',
              animationDelay: '1s',
            }}
          />
          <div
            className="absolute -bottom-[200px] left-1/3 w-[800px] h-[400px] animate-pulse"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.12) 0%, transparent 60%)',
              filter: 'blur(100px)',
              animationDuration: '6s',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundSize: '60px 60px',
              backgroundImage: `
              linear-gradient(to right, rgba(0, 212, 255, 0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 212, 255, 0.06) 1px, transparent 1px)
            `,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, rgba(5, 10, 20, 0.4) 100%)',
            }}
          />
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-8">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Hero Content */}
            <div className="space-y-8">
              {/* Live Badge */}
              <div className="badge-live">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span>{t('welcome.badge').replace('{count}', '1700')}</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none">
                <span className="text-foreground block">{t('welcome.titlePart1') || 'PLAY YOUR'}</span>
                <span className="text-gradient-cyan block italic">{t('welcome.titlePart2') || 'CLASSICS'}</span>
              </h1>

              {/* Description */}
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                {t('welcome.description')}
              </p>

              {/* CTA Buttons */}
              <div className="flex items-center gap-4 flex-wrap">
                <Link href="/library" className="btn-primary inline-flex items-center gap-2 group">
                  <Play className="w-4 h-4" />
                  {t('landing.exploreNow') || 'Trải Nghiệm Ngay'}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/docs" className="btn-outline inline-flex items-center gap-2">
                  <span className="flex items-center gap-2">
                    {t('nav.docs') || 'Hướng Dẫn'}
                  </span>
                </Link>
                <Link
                  href="https://github.com/daiphu1801/NestGameNextLibrary"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg font-semibold text-sm uppercase tracking-wider transition-all duration-300 inline-flex items-center gap-2 bg-transparent border-2 border-white/20 text-muted-foreground hover:text-white hover:border-white hover:bg-white/5 hover:shadow-lg hover:shadow-white/10 active:scale-95"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </Link>
              </div>

              {/* Stats Cards */}
              <div className="flex items-center gap-4 flex-wrap pt-4">
                <div className="stats-card">
                  <div className="stats-value">{allGames.length}+</div>
                  <div className="stats-label">{t('stats.games') || 'Games'}</div>
                </div>
                <div className="stats-card">
                  <div className="stats-value">50K</div>
                  <div className="stats-label">{t('stats.users') || 'Users'}</div>
                </div>
                <div className="stats-card">
                  <div className="stats-value">100%</div>
                  <div className="stats-label">{t('stats.free') || 'Free'}</div>
                </div>
              </div>
            </div>

            {/* Right Column - Feature Card */}
            <div className="glass-card-strong rounded-2xl p-6 lg:p-8 space-y-6">
              <div className="flex items-center gap-2 text-sm font-mono-tech uppercase tracking-widest">
                <Gamepad2 className="w-4 h-4 text-primary" />
                <span className="text-foreground">Game</span>
                <span className="text-muted-foreground">Features</span>
              </div>

              <div className="space-y-4">
                <FeatureItem
                  icon={Sparkles}
                  title={t('welcome.free') || 'Free to Play'}
                  description={t('features.freeDesc') || 'No payment required, play instantly'}
                />
                <FeatureItem
                  icon={Zap}
                  title={t('welcome.noInstall') || 'Instant Load'}
                  description={t('features.instantDesc') || 'No downloads, runs in your browser'}
                />
                <FeatureItem
                  icon={Save}
                  title={t('welcome.saveState') || 'Cloud Saves'}
                  description={t('features.saveDesc') || 'Save your progress and continue anytime'}
                />
              </div>

              <Link href="/library" className="w-full btn-gradient py-4 mt-4 block text-center">
                {t('header.play') || 'Start Playing Now'}
              </Link>
            </div>
          </div>
        </section>

        {/* About Section - Introduction */}
        <section className="py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-black mb-6">
              <span className="text-foreground">{t('landing.aboutTitle') || 'Về'} </span>
              <span className="text-gradient-cyan">{t('landing.aboutTitleHighlight') || 'NestGame'}</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t('landing.aboutDesc') || 'NestGame là nền tảng giả lập NES trực tuyến, cho phép bạn chơi hơn 1700+ game kinh điển ngay trên trình duyệt. Được xây dựng với công nghệ hiện đại, NestGame mang đến trải nghiệm mượt mà, không cần cài đặt, hoàn toàn miễn phí.'}
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <AboutCard
              icon={Globe}
              title={t('landing.feature1Title') || 'Chơi Mọi Nơi'}
              description={t('landing.feature1Desc') || 'Truy cập và chơi game từ bất kỳ thiết bị nào có trình duyệt'}
            />
            <AboutCard
              icon={Shield}
              title={t('landing.feature2Title') || 'An Toàn & Bảo Mật'}
              description={t('landing.feature2Desc') || 'Không cần tải file, không lo virus hay phần mềm độc hại'}
            />
            <AboutCard
              icon={Users}
              title={t('landing.feature3Title') || 'Cộng Đồng Lớn'}
              description={t('landing.feature3Desc') || 'Hàng nghìn người chơi đang trải nghiệm game kinh điển mỗi ngày'}
            />
            <AboutCard
              icon={Star}
              title={t('landing.feature4Title') || 'Chất Lượng Cao'}
              description={t('landing.feature4Desc') || 'ROM được chọn lọc kỹ càng, đảm bảo trải nghiệm tốt nhất'}
            />
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 lg:py-24 border-t border-white/5">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-black mb-6">
              <span className="text-foreground">{t('landing.howItWorksTitle') || 'Cách'} </span>
              <span className="text-gradient-cyan">{t('landing.howItWorksHighlight') || 'Sử Dụng'}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <StepCard
              step="01"
              title={t('landing.step1Title') || 'Chọn Game'}
              description={t('landing.step1Desc') || 'Duyệt thư viện với hơn 1700+ games, tìm kiếm theo tên hoặc thể loại'}
            />
            <StepCard
              step="02"
              title={t('landing.step2Title') || 'Nhấn Play'}
              description={t('landing.step2Desc') || 'Click vào game yêu thích, nhấn nút Play để bắt đầu chơi ngay'}
            />
            <StepCard
              step="03"
              title={t('landing.step3Title') || 'Tận Hưởng'}
              description={t('landing.step3Desc') || 'Sử dụng bàn phím hoặc tay cầm để điều khiển, lưu game bất cứ lúc nào'}
            />
          </div>
        </section>

        {/* Featured Games Preview */}
        <section className="py-16 lg:py-24 border-t border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-black mb-2">
                <span className="text-foreground">{t('featured.title') || 'Games Hot'} </span>
                <span className="text-gradient-cyan">🔥</span>
              </h2>
              <p className="text-muted-foreground">{t('featured.subtitle') || 'Những game được yêu thích nhất'}</p>
            </div>
            <Link href="/library" className="btn-outline hidden sm:inline-flex items-center gap-2">
              {t('landing.viewAll') || 'Xem Tất Cả'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <FeaturedGames games={allGames} onGameClick={handleGameClick} />

          <div className="text-center mt-8 sm:hidden">
            <Link href="/library" className="btn-outline inline-flex items-center gap-2">
              {t('landing.viewAll') || 'Xem Tất Cả'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-16 lg:py-24">
          <div className="glass-card-strong rounded-3xl p-8 lg:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

            <div className="relative z-10">
              <h2 className="text-3xl lg:text-5xl font-black mb-6">
                <span className="text-foreground">{t('landing.ctaTitle') || 'Sẵn Sàng'} </span>
                <span className="text-gradient-cyan">{t('landing.ctaHighlight') || 'Khám Phá?'}</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('landing.ctaDesc') || 'Hơn 1700+ game NES kinh điển đang chờ bạn. Bắt đầu ngay hôm nay - hoàn toàn miễn phí!'}
              </p>
              <Link href="/library" className="btn-primary inline-flex items-center gap-3 text-lg px-8 py-4">
                <Gamepad2 className="w-5 h-5" />
                {t('landing.ctaButton') || 'Bắt Đầu Chơi Ngay'}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function FeatureItem({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors">
      <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function AboutCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <div className="glass-card rounded-xl p-6 text-center hover:border-primary/30 transition-colors group">
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-7 h-7 text-primary" />
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border-2 border-primary/30">
        <span className="text-2xl font-black text-primary">{step}</span>
      </div>
      <h3 className="font-bold text-xl mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
