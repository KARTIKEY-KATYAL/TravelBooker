import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/" data-testid="logo-link">
                <h1 className="text-2xl font-bold text-primary cursor-pointer">
                  <i className="fas fa-plane-departure mr-2"></i>TravelEase
                </h1>
              </Link>
            </div>
            {isAuthenticated && (
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-8">
                  <Link href="/" className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium" data-testid="nav-home">
                    Home
                  </Link>
                  <Link href="/dashboard" className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium" data-testid="nav-dashboard">
                    My Bookings
                  </Link>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 animate-pulse bg-muted rounded-full"></div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <i className="fas fa-user-circle text-lg text-muted-foreground"></i>
                  <span className="text-sm text-foreground" data-testid="user-greeting">
                    {user.firstName ? `Hi, ${user.firstName}` : user.email}
                  </span>
                </div>
                <a 
                  href="/api/logout" 
                  className="text-sm text-muted-foreground hover:text-primary px-3 py-2"
                  data-testid="logout-link"
                >
                  Logout
                </a>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a 
                  href="/api/login" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  data-testid="login-button"
                >
                  Sign In
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
