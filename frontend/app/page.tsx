import Link from 'next/link';
import { MapPin, Star, Trophy, User } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white">
            🌯 ChainRank
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Find the best Chipotle location near you
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Not all Chipotles are created equal. Discover which location makes the best chicken burrito, steak bowl, and more.
          </p>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <Link
              href="/map"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Map
            </Link>
            <Link
              href="/leaderboard"
              className="bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Leaderboard
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          <FeatureCard
            icon={<MapPin className="w-8 h-8 text-blue-600" />}
            title="Location Map"
            description="See all Chipotle locations with real-time ratings"
            href="/map"
          />
          <FeatureCard
            icon={<Star className="w-8 h-8 text-yellow-600" />}
            title="Submit Reviews"
            description="Rate menu items with receipt verification"
            href="/reviews"
          />
          <FeatureCard
            icon={<Trophy className="w-8 h-8 text-purple-600" />}
            title="Earn Badges"
            description="Become a Chipotle Explorer, Master, or Legend"
            href="/leaderboard"
          />
          <FeatureCard
            icon={<User className="w-8 h-8 text-green-600" />}
            title="Your Profile"
            description="Track your points, reviews, and achievements"
            href="/profile"
          />
        </div>

        {/* How It Works */}
        <div className="mt-20 bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step
              number="1"
              title="Visit & Order"
              description="Go to any Chipotle location and order your favorite item"
            />
            <Step
              number="2"
              title="Upload Receipt"
              description="Take a photo of your receipt for verification"
            />
            <Step
              number="3"
              title="Rate & Earn"
              description="Rate the menu item 1-10 and earn points & badges"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard label="Locations" value="10" />
          <StatCard label="Reviews" value="0" />
          <StatCard label="Users" value="0" />
          <StatCard label="Badges" value="12" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </Link>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md text-center">
      <div className="text-3xl font-bold text-blue-600 mb-1">{value}</div>
      <div className="text-gray-600 dark:text-gray-300">{label}</div>
    </div>
  );
}
