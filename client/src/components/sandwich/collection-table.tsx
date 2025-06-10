import { Edit, Trash2, Square, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SandwichCollection } from "@shared/schema";

interface CollectionTableProps {
  collections: SandwichCollection[];
  selectedCollections: Set<number>;
  onToggleSelect: (id: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onEdit: (collection: SandwichCollection) => void;
  onDelete: (id: number) => void;
}

export function CollectionTable({
  collections,
  selectedCollections,
  onToggleSelect,
  onSelectAll,
  onDeselectAll,
  onEdit,
  onDelete
}: CollectionTableProps) {
  const allSelected = collections.length > 0 && collections.every(c => selectedCollections.has(c.id));
  const someSelected = collections.some(c => selectedCollections.has(c.id));

  return (
    <div className="border rounded-lg">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-gray-800">
              <th className="p-3 text-left">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={allSelected ? onDeselectAll : onSelectAll}
                  className="h-6 w-6 p-0"
                >
                  {allSelected ? (
                    <CheckSquare className="h-4 w-4" />
                  ) : someSelected ? (
                    <div className="h-4 w-4 border-2 bg-blue-500 opacity-50 rounded-sm" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                </Button>
              </th>
              <th className="p-3 text-left font-medium">Date</th>
              <th className="p-3 text-left font-medium">Host</th>
              <th className="p-3 text-left font-medium">Individual</th>
              <th className="p-3 text-left font-medium">Group Collections</th>
              <th className="p-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <tr key={collection.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="p-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleSelect(collection.id)}
                    className="h-6 w-6 p-0"
                  >
                    {selectedCollections.has(collection.id) ? (
                      <CheckSquare className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </Button>
                </td>
                <td className="p-3">
                  <div className="font-medium">{collection.collectionDate}</div>
                </td>
                <td className="p-3">
                  <Badge variant="outline">{collection.hostName}</Badge>
                </td>
                <td className="p-3">
                  <div className="text-center font-medium text-blue-600">
                    {collection.individualSandwiches}
                  </div>
                </td>
                <td className="p-3">
                  <div className="max-w-xs">
                    <div className="text-sm text-gray-600 dark:text-gray-400 break-words">
                      {collection.groupCollections}
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(collection)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(collection.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}