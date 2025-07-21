export default function SimpleLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          The Sandwich Project
        </h1>
        <p className="text-gray-600 mb-8">
          Volunteer management platform for sandwich collection and distribution.
        </p>
        
        <div className="space-y-4">
          <a
            href="/api/login"
            className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login to Platform
          </a>
          
          <a
            href="/signup"
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Create Account
          </a>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            A 501(c)(3) nonprofit organization serving Georgia communities
          </p>
        </div>
      </div>
    </div>
  );
}