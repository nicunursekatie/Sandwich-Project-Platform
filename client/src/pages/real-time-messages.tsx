import EmailStyleMessaging from "@/components/email-style-messaging";

export default function RealTimeMessages() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">
          Send and receive messages instantly with other users in your organization
        </p>
      </div>
      
      <EmailStyleMessaging />
    </div>
  );
}