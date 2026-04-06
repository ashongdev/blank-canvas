import { useState } from "react";
import { FolderOpen, MoreVertical, Pencil, Trash2, Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Template, Collection } from "@/hooks/useDashboardStore";

interface Props {
  collections: Collection[];
  templates: Template[];
  onCreate: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onAssignCollection: (templateId: string, collectionId: string | null) => void;
}

const CollectionsPage = ({ collections, templates, onCreate, onUpdate, onDelete, onAssignCollection }: Props) => {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [editCol, setEditCol] = useState<Collection | null>(null);
  const [editName, setEditName] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleCreate = () => {
    if (newName.trim()) {
      onCreate(newName.trim());
      setNewName("");
      setCreating(false);
    }
  };

  const saveEdit = () => {
    if (editCol && editName.trim()) {
      onUpdate(editCol.id, editName.trim());
      setEditCol(null);
    }
  };

  const templatesInCollection = (colId: string) => templates.filter((t) => t.collectionId === colId && !t.trashed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">Collections</h2>
        {!creating ? (
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Collection
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              autoFocus
              placeholder="Collection name..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="h-9 w-48"
            />
            <Button size="sm" onClick={handleCreate}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => { setCreating(false); setNewName(""); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FolderOpen className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-lg">No collections yet</p>
          <p className="text-sm">Create a collection to organize your templates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => {
            const colTemplates = templatesInCollection(col.id);
            const isExpanded = expandedId === col.id;
            return (
              <Card
                key={col.id}
                className="border-border hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : col.id)}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <FolderOpen className="h-5 w-5 text-primary shrink-0" />
                      <span className="font-medium text-foreground truncate">{col.name}</span>
                      <Badge variant="secondary" className="text-xs">{colTemplates.length}</Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditCol(col); setEditName(col.name); }}>
                          <Pencil className="mr-2 h-4 w-4" /> Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); onDelete(col.id); }}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Collection
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {isExpanded && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      {colTemplates.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No templates in this collection.</p>
                      ) : (
                        colTemplates.map((t) => (
                          <div key={t.id} className="flex items-center justify-between text-sm">
                            <span className="truncate text-foreground">{t.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-muted-foreground hover:text-destructive"
                              onClick={(e) => { e.stopPropagation(); onAssignCollection(t.id, null); }}
                            >
                              Remove
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!editCol} onOpenChange={(o) => !o && setEditCol(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Collection</DialogTitle>
            <DialogDescription>Enter a new name for this collection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Name</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveEdit()} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCol(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionsPage;
