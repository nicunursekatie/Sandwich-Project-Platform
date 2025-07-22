import StreamMessaging from "@/components/stream-messaging";

export default function StreamMessages() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages (Stream)</h1>
        <p className="text-gray-600 mt-2">
          Professional messaging powered by Stream Chat with email-style interface
        </p>
      </div>
      
      <StreamMessaging />
    </div>
  );
}