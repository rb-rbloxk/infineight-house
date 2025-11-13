'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Helper function to check if a link is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/logo.png"
            alt="#34 Stories Logo"
            width={120}
            height={40}
            className="h-10 w-auto"
          />
        </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/shop" 
              className={`text-sm font-medium hover:text-primary transition-colors relative ${
                isActive('/shop') 
                  ? 'text-primary after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-0.5 after:bg-primary' 
                  : 'text-foreground'
              }`}
            >
              Shop
            </Link>
            <Link 
              href="/customise" 
              className={`text-sm font-medium hover:text-primary transition-colors relative ${
                isActive('/customise') 
                  ? 'text-primary after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-0.5 after:bg-primary' 
                  : 'text-foreground'
              }`}
            >
              Customize
            </Link>
            <Link 
              href="/corporate" 
              className={`text-sm font-medium hover:text-primary transition-colors relative ${
                isActive('/corporate') 
                  ? 'text-primary after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-0.5 after:bg-primary' 
                  : 'text-foreground'
              }`}
            >
              Corporate Gifting
            </Link>
            <Link 
              href="/bulk-calculator" 
              className={`text-sm font-medium hover:text-primary transition-colors relative ${
                isActive('/bulk-calculator') 
                  ? 'text-primary after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-0.5 after:bg-primary' 
                  : 'text-foreground'
              }`}
            >
              Bulk Calculator
            </Link>
            <Link 
              href="/about" 
              className={`text-sm font-medium hover:text-primary transition-colors relative ${
                isActive('/about') 
                  ? 'text-primary after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-0.5 after:bg-primary' 
                  : 'text-foreground'
              }`}
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className={`text-sm font-medium hover:text-primary transition-colors relative ${
                isActive('/contact') 
                  ? 'text-primary after:absolute after:bottom-[-20px] after:left-0 after:w-full after:h-0.5 after:bg-primary' 
                  : 'text-foreground'
              }`}
            >
              Contact
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/wishlist" className="relative">
                  <Heart className="h-5 w-5 hover:text-primary transition-colors text-foreground" />
                </Link>
                <Link href="/cart" className="relative">
                  <ShoppingCart className="h-5 w-5 hover:text-primary transition-colors text-foreground" />
                </Link>
                <div className="relative" ref={userMenuRef}>
                  <button 
                    className="flex items-center space-x-1"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  >
                    <User className="h-5 w-5 hover:text-primary transition-colors text-foreground" />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 border border-border z-50">
                      <Link 
                        href="/orders" 
                        className="block px-4 py-2 text-sm hover:bg-secondary text-foreground"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      <Link 
                        href="/wishlist" 
                        className="block px-4 py-2 text-sm hover:bg-secondary text-foreground"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Wishlist
                      </Link>
                      <Link 
                        href="/designs" 
                        className="block px-4 py-2 text-sm hover:bg-secondary text-foreground"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Saved Designs
                      </Link>
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-sm hover:bg-secondary text-foreground"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      {profile?.is_admin && (
                        <Link 
                          href="/admin" 
                          className="block px-4 py-2 text-sm hover:bg-secondary text-primary"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:bg-secondary text-foreground"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-foreground hover:bg-secondary">Login</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">Sign Up</Button>
                </Link>
              </>
            )}

            <button
              className="md:hidden text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-4 border-t border-border">
            <Link
              href="/shop"
              className={`block text-sm font-medium hover:text-primary transition-colors ${
                isActive('/shop') 
                  ? 'text-primary font-bold border-l-4 border-primary pl-3' 
                  : 'text-foreground pl-4'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/customise"
              className={`block text-sm font-medium hover:text-primary transition-colors ${
                isActive('/customise') 
                  ? 'text-primary font-bold border-l-4 border-primary pl-3' 
                  : 'text-foreground pl-4'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Customize
            </Link>
            <Link
              href="/corporate"
              className={`block text-sm font-medium hover:text-primary transition-colors ${
                isActive('/corporate') 
                  ? 'text-primary font-bold border-l-4 border-primary pl-3' 
                  : 'text-foreground pl-4'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Corporate Gifting
            </Link>
            <Link
              href="/bulk-calculator"
              className={`block text-sm font-medium hover:text-primary transition-colors ${
                isActive('/bulk-calculator') 
                  ? 'text-primary font-bold border-l-4 border-primary pl-3' 
                  : 'text-foreground pl-4'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Bulk Calculator
            </Link>
            <Link
              href="/about"
              className={`block text-sm font-medium hover:text-primary transition-colors ${
                isActive('/about') 
                  ? 'text-primary font-bold border-l-4 border-primary pl-3' 
                  : 'text-foreground pl-4'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`block text-sm font-medium hover:text-primary transition-colors ${
                isActive('/contact') 
                  ? 'text-primary font-bold border-l-4 border-primary pl-3' 
                  : 'text-foreground pl-4'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            {user && (
              <>
                <Link
                  href="/wishlist"
                  className="block text-sm font-medium hover:text-primary text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wishlist
                </Link>
                <Link
                  href="/orders"
                  className="block text-sm font-medium hover:text-primary text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
