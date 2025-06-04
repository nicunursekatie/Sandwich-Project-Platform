import { useQuery } from "@tanstack/react-query";
import { Sandwich, Calendar, User, Users } from "lucide-react";
import type { SandwichCollection } from "@shared/schema";

export default function SandwichCollectionLog() {
  const { data: collections = [], isLoading } = useQuery<SandwichCollection[]>({
    queryKey: ["/api/sandwich-collections"]
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSubmittedAt = (timestamp: string | Date) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    }) + ' at ' + new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotal = (collection: SandwichCollection) => {
    const groupData = JSON.parse(collection.groupCollections || "[]");
    const groupTotal = groupData.reduce((sum: number, group: any) => sum + group.sandwichCount, 0);
    return collection.individualSandwiches + groupTotal;
  };

  const parseGroupCollections = (groupCollectionsJson: string) => {
    try {
      return JSON.parse(groupCollectionsJson || "[]");
    } catch {
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="h-6 bg-slate-200 rounded animate-pulse"></div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
              <div className="h-3 bg-slate-100 rounded animate-pulse"></div>
              <div className="h-3 bg-slate-100 rounded animate-pulse w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
      <div className="px-6 py-4 border-b border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center">
          <Sandwich className="text-amber-500 mr-2 w-5 h-5" />
          Collection Log
        </h2>
        <p className="text-sm text-slate-500 mt-1">{collections.length} total entries</p>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {collections.map((collection) => {
            const groupData = parseGroupCollections(collection.groupCollections);
            const totalSandwiches = calculateTotal(collection);

            return (
              <div key={collection.id} className="border border-slate-200 rounded-lg p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center text-slate-700">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="font-medium">{formatDate(collection.collectionDate)}</span>
                    </div>
                    <div className="flex items-center text-slate-600">
                      <User className="w-4 h-4 mr-1" />
                      <span>{collection.hostName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-slate-900">{totalSandwiches}</div>
                    <div className="text-xs text-slate-500">total sandwiches</div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Individual Collections */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">Individual Collections</span>
                      <span className="text-sm font-semibold text-slate-900">{collection.individualSandwiches}</span>
                    </div>
                  </div>

                  {/* Group Collections */}
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700">Group Collections</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {groupData.reduce((sum: number, group: any) => sum + group.sandwichCount, 0)}
                      </span>
                    </div>
                    {groupData.length > 0 && (
                      <div className="space-y-1">
                        {groupData.map((group: any, index: number) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className="text-slate-600 flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {group.groupName}
                            </span>
                            <span className="text-slate-700 font-medium">{group.sandwichCount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {groupData.length === 0 && (
                      <div className="text-xs text-slate-500">No group collections</div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-slate-200">
                  <div className="text-xs text-slate-500">
                    Submitted {formatSubmittedAt(collection.submittedAt)}
                  </div>
                </div>
              </div>
            );
          })}

          {collections.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No collection entries found. Use the form above to record sandwich collections.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}