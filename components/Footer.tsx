import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Twitter, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="text-foreground" style={{ backgroundColor: '#FFDB75' }}>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <div className="mb-4">
              <Image
                src="/images/logo.png"
                alt="#34 Stories Logo"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Wear moments, Beyond time!
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Shop</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/shop?category=men" className="hover:text-primary transition-colors">
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link href="/shop?category=women" className="hover:text-primary transition-colors">
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link href="/shop?category=gifting" className="hover:text-primary transition-colors">
                  Gifting Items
                </Link>
              </li>
              <li>
                <Link href="/shop?category=corporate" className="hover:text-primary transition-colors">
                  Corporate
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/corporate" className="hover:text-primary transition-colors">
                  Corporate Gifting
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Policies</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/policies/terms-and-conditions" className="hover:text-primary transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy-policy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/cookies-policy" className="hover:text-primary transition-colors">
                  Cookies Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/return-policy" className="hover:text-primary transition-colors">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/customisation-policy" className="hover:text-primary transition-colors">
                  Customisation Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">Connect</h3>
            <div className="flex space-x-4 mb-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="mailto:hello@Infineight.house" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              hello@Infineight.house
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Infineight.House. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
