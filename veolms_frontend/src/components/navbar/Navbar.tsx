'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  BookOpen,
  LayoutDashboard,
  Shield,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { gsap } from '@/lib/gsap';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const navRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!navRef.current) return;

    gsap.fromTo(
      navRef.current,
      { y: -20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      }
    );
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuRef.current) return;

    if (mobileOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        {
          height: 0,
          opacity: 0,
        },
        {
          height: 'auto',
          opacity: 1,
          duration: 0.25,
          ease: 'power2.out',
        }
      );
    }
  }, [mobileOpen]);

  const handleLogout = async () => {
    setMobileOpen(false);
    await logout();
    router.push('/');
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/');

  const navItemClass = (path: string, activeColor = 'indigo') => {
    const active =
      activeColor === 'purple'
        ? 'bg-purple-600/15 text-purple-300 border-purple-500/30'
        : 'bg-indigo-600/15 text-indigo-300 border-indigo-500/30';

    return `
      flex items-center gap-2
      px-3.5 py-2
      rounded-xl
      text-sm font-medium
      border
      transition-all duration-200
      ${
        isActive(path)
          ? active
          : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
      }
    `;
  };

  return (
    <header
      ref={navRef}
      className="
        sticky top-0 z-50 w-full
        border-b border-slate-800/80
        bg-slate-950/80
        backdrop-blur-xl
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group shrink-0"
          >
            <div
              className="
                w-9 h-9 sm:w-10 sm:h-10
                rounded-xl
                bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400
                p-0.5
                shadow-lg shadow-indigo-500/20
                group-hover:scale-105
                transition-transform duration-300
              "
            >
              <div
                className="
                  w-full h-full
                  bg-slate-950
                  rounded-[10px]
                  flex items-center justify-center
                "
              >
                <Sparkles
                  className="
                    w-4 h-4 sm:w-5 sm:h-5
                    text-indigo-400
                    group-hover:rotate-12
                    transition-transform duration-300
                  "
                />
              </div>
            </div>

            <div className="flex flex-col">
              <span
                className="
                  font-extrabold
                  text-lg sm:text-xl
                  tracking-tight
                  text-white
                  group-hover:text-indigo-400
                  transition-colors
                "
              >
                Open<span className="text-gradient-primary">LMS</span>
              </span>

              <span
                className="
                  hidden sm:block
                  text-[10px]
                  tracking-widest
                  uppercase
                  font-semibold
                  text-slate-500
                  -mt-1
                "
              >
                Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="
              hidden md:flex
              items-center
              gap-1
              bg-slate-900/60
              p-1.5
              rounded-2xl
              border border-slate-800
            "
          >
            <Link
              href="/courses"
              className={navItemClass('/courses')}
            >
              <BookOpen className="w-4 h-4" />
              <span>Explore Courses</span>
            </Link>

            {user && (
              <Link
                href="/dashboard"
                className={navItemClass('/dashboard')}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Learning</span>
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className={navItemClass('/admin', 'purple')}
              >
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Admin Portal</span>
              </Link>
            )}
          </nav>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <div className="flex flex-col items-end min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-200 truncate max-w-[150px]">
                      {user.name}
                    </span>

                    {user.role === 'ADMIN' ? (
                      <Badge variant="cyan">ADMIN</Badge>
                    ) : (
                      <Badge variant="indigo">STUDENT</Badge>
                    )}
                  </div>

                  <span className="text-xs text-slate-500 truncate max-w-[200px]">
                    {user.email}
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  icon={<LogOut className="w-4 h-4" />}
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>

                <Link href="/signup">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobileOpen}
            className="
              md:hidden
              w-10 h-10
              flex items-center justify-center
              rounded-xl
              border border-slate-800
              bg-slate-900/70
              text-slate-300
              hover:text-white
              hover:bg-slate-800
              transition-colors
            "
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div
            ref={mobileMenuRef}
            className="
              md:hidden
              overflow-hidden
              border-t border-slate-800/80
            "
          >
            <div className="py-4 space-y-2">
              <Link
                href="/courses"
                className={navItemClass('/courses')}
              >
                <BookOpen className="w-4 h-4" />
                Explore Courses
              </Link>

              {user && (
                <Link
                  href="/dashboard"
                  className={navItemClass('/dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  My Learning
                </Link>
              )}

              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className={navItemClass('/admin', 'purple')}
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  Admin Portal
                </Link>
              )}

              {/* Mobile User Section */}
              {user ? (
                <div className="pt-3 mt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between gap-3 px-1 mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-200 truncate">
                          {user.name}
                        </span>

                        {user.role === 'ADMIN' ? (
                          <Badge variant="cyan">ADMIN</Badge>
                        ) : (
                          <Badge variant="indigo">STUDENT</Badge>
                        )}
                      </div>

                      <span className="text-xs text-slate-500 truncate block">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    icon={<LogOut className="w-4 h-4" />}
                    className="w-full justify-center"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="pt-3 mt-3 border-t border-slate-800 grid grid-cols-2 gap-2">
                  <Link href="/login" className="w-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-center"
                    >
                      Sign In
                    </Button>
                  </Link>

                  <Link href="/signup" className="w-full">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-center"
                    >
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};