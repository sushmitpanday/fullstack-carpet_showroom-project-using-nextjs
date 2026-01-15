import Link from 'next/link';

// params ko ab async handle karna padta hai
export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const title = slug.replace('-', ' ').toUpperCase();

  return (
    <div className="min-h-screen bg-[#121212] text-white p-10">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-green-500 mb-8 inline-block hover:underline">
          ← Back to Menu
        </Link>
        
        <h1 className="text-5xl font-bold border-b border-gray-800 pb-4 mb-6 text-green-500">
          {title} <span className="text-white">SECTION</span>
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#1e1e1e] p-6 rounded-lg border border-gray-800">
            <h2 className="text-xl font-semibold mb-4 text-green-400">Overview</h2>
            <p className="text-gray-400">Welcome to the {title} module.</p>
          </div>
        </div>
      </div>
    </div>
  );
}